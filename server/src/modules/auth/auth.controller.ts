import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  CurrentUser,
  type JwtPayload,
} from 'src/shared/decorators/current-user.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { AuthService } from './auth.service';
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ResponseMessage('User registered successfully')
  register(@Body() body: RegisterBodyDto) {
    return this.authService.register(body);
  }

  @Public()
  @Post('login')
  @ResponseMessage('Login successful')
  async login(
    @Body() body: LoginBodyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(body);

    // Set HttpOnly cookies
    this.authService.setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
    );

    return result;
  }

  @Get('me')
  @ResponseMessage('Current user retrieved successfully')
  getCurrentUser(@CurrentUser() user: JwtPayload) {
    return this.authService.getCurrentUser(user.sub);
  }

  @Put('profile')
  @ResponseMessage('Profile updated successfully')
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.sub, updateProfileDto);
  }

  @Put('change-password')
  @ResponseMessage('Password changed successfully')
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.sub, changePasswordDto);
  }

  @Public()
  @Post('forgot-password')
  @ResponseMessage('Password reset email sent')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @ResponseMessage('Password reset successful')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Post('verify-otp')
  @ResponseMessage('Email verified successfully')
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Public()
  @Post('resend-otp')
  @ResponseMessage('OTP sent successfully')
  resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto);
  }

  @Public()
  @Post('google')
  @ResponseMessage('Google authentication successful')
  async googleAuth(
    @Body() googleAuthDto: GoogleAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.googleAuth(googleAuthDto);

    // Set cookies if login was successful (has tokens)
    if ('accessToken' in result && result.accessToken) {
      this.authService.setAuthCookies(
        res,
        result.accessToken,
        result.refreshToken,
      );
    }

    return result;
  }

  @Public()
  @Post('facebook')
  @ResponseMessage('Facebook authentication successful')
  async facebookAuth(
    @Body() facebookAuthDto: FacebookAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.facebookAuth(facebookAuthDto);

    // Set cookies if login was successful (has tokens)
    if ('accessToken' in result && result.accessToken) {
      this.authService.setAuthCookies(
        res,
        result.accessToken,
        result.refreshToken,
      );
    }

    return result;
  }

  @Public()
  @Post('refresh')
  @ResponseMessage('Token refreshed successfully')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Read refresh token from cookie or body
    const refreshTokenValue: string | undefined =
      req.cookies?.refresh_token || req.body?.refreshToken;

    if (!refreshTokenValue) {
      throw new BadRequestException('Refresh token is required');
    }

    const result = await this.authService.refreshAccessToken(refreshTokenValue);

    // Set new cookies
    this.authService.setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
    );

    return result;
  }

  @Post('logout')
  @ResponseMessage('Logged out successfully')
  logout(@Res({ passthrough: true }) res: Response) {
    this.authService.clearAuthCookies(res);
    return { message: 'Logged out successfully' };
  }
}

export default AuthController;
