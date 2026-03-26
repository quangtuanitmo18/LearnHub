import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterBodyDto,
  LoginBodyDto,
  UpdateProfileDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyOtpDto,
  ResendOtpDto,
  GoogleAuthDto,
  FacebookAuthDto,
} from './dto/auth.dto';
import { Public } from 'src/shared/decorators/public.decorator';
import {
  CurrentUser,
  type JwtPayload,
} from 'src/shared/decorators/current-user.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';

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
  login(@Body() body: LoginBodyDto) {
    return this.authService.login(body);
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
  googleAuth(@Body() googleAuthDto: GoogleAuthDto) {
    return this.authService.googleAuth(googleAuthDto);
  }

  @Public()
  @Post('facebook')
  @ResponseMessage('Facebook authentication successful')
  facebookAuth(@Body() facebookAuthDto: FacebookAuthDto) {
    return this.authService.facebookAuth(facebookAuthDto);
  }
}

export default AuthController;
