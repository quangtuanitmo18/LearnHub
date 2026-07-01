import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Response as ExpressResponse } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from 'src/shared/services/prisma.service';
import { SYSTEM_ROLE_NAMES } from 'src/shared/configs/permission';
import { EmailQueueService } from '../email/services';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  ChangePasswordDto,
  FacebookAuthDto,
  ForgotPasswordDto,
  GoogleAuthDto,
  LoginBodyDto,
  RegisterBodyDto,
  ResendOtpDto,
  ResetPasswordDto,
  UpdateProfileDto,
  VerifyOtpDto,
} from './dto/auth.dto';
import { AuthQueueService } from './services';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailQueueService: EmailQueueService,
    private readonly authQueueService: AuthQueueService,
    @InjectQueue('gamification') private readonly gamificationQueue: Queue,
  ) {
    const googleClientId = this.configService.get<string>('google.clientId');
    this.googleClient = new OAuth2Client(googleClientId);
  }

  private async generateAccessToken(userId: string, userType: string) {
    const payload = {
      sub: userId,
      userType,
      type: 'access',
    };
    const secret = this.configService.get<string>('jwt.accessSecret');

    return await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: '1d',
    });
  }

  private async generateRefreshToken(userId: string) {
    const payload = {
      sub: userId,
      type: 'refresh',
    };
    const secret = this.configService.get<string>('jwt.refreshSecret');

    return await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: '7d',
    });
  }

  /**
   * Generate a 6-digit OTP
   */
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(body: RegisterBodyDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      // If user exists but email not verified, allow re-registration with new OTP
      if (!existingUser.isEmailVerified) {
        const otp = this.generateOtp();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await this.prismaService.user.update({
          where: { id: existingUser.id },
          data: {
            username: body.username,
            password: await bcrypt.hash(body.password, 10),
            otpCode: otp,
            otpExpires: otpExpires,
          },
        });

        // Send OTP email
        try {
          await this.emailQueueService.queueOtpVerificationEmail({
            to: body.email,
            username: body.username,
            otpCode: otp,
            expiresIn: '10 minutes',
          });
        } catch (error) {
          console.log('Failed to queue OTP email:', error);
        }

        // Queue cleanup job in case user doesn't verify
        await this.authQueueService.queueUnverifiedUserCleanup(
          existingUser.id,
          body.email,
        );

        return {
          message:
            'Registration successful. Please check your email for OTP verification.',
          email: body.email,
        };
      }
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const otp = this.generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = await this.prismaService.user.create({
      data: {
        username: body.username,
        email: body.email,
        password: hashedPassword,
        status: 'INACTIVE',
        isEmailVerified: false,
        otpCode: otp,
        otpExpires: otpExpires,
      },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        userType: true,
        createdAt: true,
      },
    });

    // Send OTP email
    try {
      await this.emailQueueService.queueOtpVerificationEmail({
        to: body.email,
        username: body.username,
        otpCode: otp,
        expiresIn: '10 minutes',
      });
    } catch (error) {
      console.error('Failed to queue OTP email:', error);
    }

    // Queue cleanup job in case user doesn't verify
    await this.authQueueService.queueUnverifiedUserCleanup(
      newUser.id,
      newUser.email,
    );

    return {
      message:
        'Registration successful. Please check your email for OTP verification.',
      email: newUser.email,
    };
  }

  /**
   * Verify OTP and activate account
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (!user.otpCode || !user.otpExpires) {
      throw new BadRequestException('No OTP found. Please request a new one.');
    }

    if (new Date() > user.otpExpires) {
      throw new BadRequestException(
        'OTP has expired. Please request a new one.',
      );
    }

    if (user.otpCode !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Activate user account
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        status: 'ACTIVE',
        isEmailVerified: true,
        otpCode: null,
        otpExpires: null,
        roles: { connect: { name: SYSTEM_ROLE_NAMES.STUDENT } },
      },
    });

    // Cancel the cleanup job since user is now verified
    await this.authQueueService.cancelUnverifiedUserCleanup(user.id);

    return {
      message: 'Email verified successfully. You can now login.',
    };
  }

  /**
   * Resend OTP
   */
  async resendOtp(resendOtpDto: ResendOtpDto) {
    const { email } = resendOtpDto;

    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success for security (don't reveal if email exists)
      return { message: 'If the email exists, a new OTP has been sent.' };
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const otp = this.generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpires: otpExpires,
      },
    });

    // Send OTP email
    try {
      await this.emailQueueService.queueOtpVerificationEmail({
        to: email,
        username: user.username,
        otpCode: otp,
        expiresIn: '10 minutes',
      });
    } catch (error) {
      console.error('Failed to queue OTP email:', error);
    }

    return { message: 'If the email exists, a new OTP has been sent.' };
  }

  async login(body: LoginBodyDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: body.email },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new BadRequestException('Account is not active');
    }

    const isPasswordValid = await bcrypt.compare(
      body.password,
      user.password || '',
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user.id, user.userType),
      this.generateRefreshToken(user.id),
    ]);

    // Gamification: Daily login points (fire-and-forget)
    void this.gamificationQueue.add('add-points', {
      userId: user.id,
      points: 5,
      reason: 'DAILY_LOGIN',
      metadata: { trigger: 'login' },
    });

    const permissions = new Set<string>();
    user.roles.forEach((role) => {
      role.permissions.forEach((permission) => permissions.add(permission));
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        roles: user.roles,
        permissions: Array.from(permissions),
      },
      accessToken,
      refreshToken,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Get purchased courses (from completed orders for COURSE type or legacy orders)
    const purchasedCourses = await this.prismaService.orderItem.findMany({
      where: {
        order: {
          userId: userId,
          status: 'COMPLETED',
          OR: [{ orderType: 'COURSE' }, { orderType: undefined }],
        },
      },
      select: {
        courseId: true,
      },
      distinct: ['courseId'],
    });

    const courseIds = purchasedCourses.map((item) => item.courseId);

    // Collect all permissions from user roles
    const permissions = new Set<string>();
    user.roles.forEach((role) => {
      role.permissions.forEach((permission) => permissions.add(permission));
    });

    // Check and update membership status if expired
    let isMembership = (user as any).isMembership || false;
    const planEndDate = (user as any).planEndDate as string | Date | null;

    // If user has membership but it's expired, update the status
    if (isMembership && planEndDate && new Date(planEndDate) < new Date()) {
      // Update membership status to false
      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          isMembership: false,
          plan: 'NONE',
        },
      });
      isMembership = false;
    }

    // Check membership status
    const membership = {
      plan: isMembership ? (user as any).plan || 'NONE' : 'NONE',
      isMembership: isMembership,
      planStartDate: (user as any).planStartDate || null,
      planEndDate: planEndDate || null,
      isActive:
        isMembership && planEndDate && new Date(planEndDate) > new Date(),
    };

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      userType: user.userType,
      avatar: user.avatar,
      createdAt: user.createdAt,
      roles: user.roles,
      permissions: Array.from(permissions),
      courses: courseIds,
      membership,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        ...(updateProfileDto.username && {
          username: updateProfileDto.username,
        }),
        ...(updateProfileDto.avatar && { avatar: updateProfileDto.avatar }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        status: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Change password
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    // Validate new password matches confirm password
    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        'New password and confirm password do not match',
      );
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify current password if user has one
    if (user.password) {
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Check if new password is same as current
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw new BadRequestException(
          'New password must be different from current password',
        );
      }
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Forgot password - send reset email
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    // Always return success message for security (don't reveal if email exists)
    if (!user) {
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Token expires in 1 hour
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    // Save reset token to user
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // Queue password reset email
    try {
      const frontendUrl =
        this.configService.get<string>('frontendUrl') ||
        'http://localhost:4000';
      await this.emailQueueService.queuePasswordResetEmail({
        to: user.email,
        username: user.username,
        resetToken: resetToken,
        expiresIn: '1 hour',
        frontendUrl,
      });
    } catch (error) {
      // Don't throw error, just log it - email is non-critical for response
      console.error('Failed to queue password reset email:', error);
    }

    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    // Hash the provided token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await this.prismaService.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        updatedAt: new Date(),
      },
    });

    return { message: 'Password has been reset successfully' };
  }

  /**
   * Authenticate with Google ID token
   * Verifies the token and creates/logs in the user
   */
  async googleAuth(googleAuthDto: GoogleAuthDto) {
    const { idToken } = googleAuthDto;

    try {
      // Verify the Google ID token
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('google.clientId'),
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new BadRequestException('Invalid Google token');
      }

      const { email, name, picture } = payload;

      if (!email) {
        throw new BadRequestException('Email not provided by Google');
      }

      // Check if user exists
      let user = await this.prismaService.user.findUnique({
        where: { email },
        include: {
          roles: {
            select: {
              id: true,
              name: true,
              permissions: true,
            },
          },
        },
      });

      if (user) {
        // User exists - check if account is active
        if (user.status !== 'ACTIVE') {
          throw new BadRequestException('Account is not active');
        }

        // Update avatar if not set
        if (!user.avatar && picture) {
          user = await this.prismaService.user.update({
            where: { id: user.id },
            data: { avatar: picture },
            include: {
              roles: {
                select: {
                  id: true,
                  name: true,
                  permissions: true,
                },
              },
            },
          });
        }

        // Auto-assign Student role if user has no roles (e.g. failed initial assignment)
        if (user.roles.length === 0) {
          user = await this.prismaService.user.update({
            where: { id: user.id },
            data: {
              roles: { connect: { name: SYSTEM_ROLE_NAMES.STUDENT } },
            },
            include: {
              roles: {
                select: {
                  id: true,
                  name: true,
                  permissions: true,
                },
              },
            },
          });
        }
      } else {
        // Create new user
        user = await this.prismaService.user.create({
          data: {
            email,
            username: name || email.split('@')[0],
            avatar: picture || undefined,
            status: 'ACTIVE',
            isEmailVerified: true, // Google verified the email
            userType: 'GOOGLE',
            roles: { connect: { name: SYSTEM_ROLE_NAMES.STUDENT } },
          },
          include: {
            roles: {
              select: {
                id: true,
                name: true,
                permissions: true,
              },
            },
          },
        });
      }

      // Generate tokens
      const [accessToken, refreshToken] = await Promise.all([
        this.generateAccessToken(user.id, user.userType),
        this.generateRefreshToken(user.id),
      ]);

      // Collect permissions
      const permissions = new Set<string>();
      user.roles.forEach((role) => {
        role.permissions.forEach((permission) => permissions.add(permission));
      });

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          userType: user.userType,
          roles: user.roles,
          permissions: Array.from(permissions),
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Google authentication error:', error);
      throw new BadRequestException('Failed to authenticate with Google');
    }
  }

  /**
   * Authenticate with Facebook access token
   * Verifies the token via Facebook Graph API and creates/logs in the user
   */
  async facebookAuth(facebookAuthDto: FacebookAuthDto) {
    const { accessToken } = facebookAuthDto;

    try {
      // Verify the Facebook access token and get user info
      const fbResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`,
      );

      if (!fbResponse.ok) {
        throw new BadRequestException('Invalid Facebook token');
      }

      const fbData = await fbResponse.json();

      if (fbData.error) {
        throw new BadRequestException(
          fbData.error.message || 'Invalid Facebook token',
        );
      }

      const { email, name, picture } = fbData;
      const avatarUrl = picture?.data?.url;

      if (!email) {
        throw new BadRequestException(
          'Email not provided by Facebook. Please ensure email permission is granted.',
        );
      }

      // Check if user exists
      let user = await this.prismaService.user.findUnique({
        where: { email },
        include: {
          roles: {
            select: {
              id: true,
              name: true,
              permissions: true,
            },
          },
        },
      });

      if (user) {
        // User exists - check if account is active
        if (user.status !== 'ACTIVE') {
          throw new BadRequestException('Account is not active');
        }

        // Update avatar if not set
        if (!user.avatar && avatarUrl) {
          user = await this.prismaService.user.update({
            where: { id: user.id },
            data: { avatar: avatarUrl },
            include: {
              roles: {
                select: {
                  id: true,
                  name: true,
                  permissions: true,
                },
              },
            },
          });
        }

        // Auto-assign Student role if user has no roles (e.g. failed initial assignment)
        if (user.roles.length === 0) {
          user = await this.prismaService.user.update({
            where: { id: user.id },
            data: {
              roles: { connect: { name: SYSTEM_ROLE_NAMES.STUDENT } },
            },
            include: {
              roles: {
                select: {
                  id: true,
                  name: true,
                  permissions: true,
                },
              },
            },
          });
        }
      } else {
        // Create new user
        user = await this.prismaService.user.create({
          data: {
            email,
            username: name || email.split('@')[0],
            avatar: avatarUrl || undefined,
            status: 'ACTIVE',
            isEmailVerified: true, // Facebook verified the email
            userType: 'FACEBOOK',
            roles: { connect: { name: SYSTEM_ROLE_NAMES.STUDENT } },
          },
          include: {
            roles: {
              select: {
                id: true,
                name: true,
                permissions: true,
              },
            },
          },
        });
      }

      // Generate tokens
      const [jwtAccessToken, refreshToken] = await Promise.all([
        this.generateAccessToken(user.id, user.userType),
        this.generateRefreshToken(user.id),
      ]);

      // Collect permissions
      const permissions = new Set<string>();
      user.roles.forEach((role) => {
        role.permissions.forEach((permission) => permissions.add(permission));
      });

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          userType: user.userType,
          roles: user.roles,
          permissions: Array.from(permissions),
        },
        accessToken: jwtAccessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Facebook authentication error:', error);
      throw new BadRequestException('Failed to authenticate with Facebook');
    }
  }

  /**
   * Refresh access token using a valid refresh token
   */
  async refreshAccessToken(refreshTokenValue: string) {
    try {
      const secret = this.configService.get<string>('jwt.refreshSecret');
      const payload = await this.jwtService.verifyAsync(refreshTokenValue, {
        secret,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
        include: {
          roles: {
            select: { id: true, name: true, permissions: true },
          },
        },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User not found or inactive');
      }

      const [accessToken, newRefreshToken] = await Promise.all([
        this.generateAccessToken(user.id, user.userType),
        this.generateRefreshToken(user.id),
      ]);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Set auth tokens as HttpOnly cookies on the response
   */
  setAuthCookies(
    res: ExpressResponse,
    accessToken: string,
    refreshToken: string,
  ): void {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
      path: '/api/v1/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  /**
   * Clear auth cookies on logout
   */
  clearAuthCookies(res: ExpressResponse): void {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
      path: '/api/v1/auth/refresh',
    });
  }
}
