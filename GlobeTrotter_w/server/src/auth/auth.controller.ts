import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body()
    body: {
      name: string;
      phoneNumber?: string;
      email: string;
      city?: string;
      country?: string;
      password: string;
    },
  ) {
    return this.authService.signup(body);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    return this.authService.getCurrentUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @Req() req: any,
    @Body()
    body: {
      name?: string;
      phoneNumber?: string;
      city?: string;
      country?: string;
    },
  ) {
    return this.authService.updateProfile(req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin')
  adminOnly() {
    return { ok: true };
  }

  // Forgot password
  @Post('forgot-password/request')
  async requestPasswordReset(@Body() body: { email: string }) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('forgot-password/verify')
  async verifyPasswordReset(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyPasswordResetOtp(body.email, body.otp);
  }

  @Post('forgot-password/reset')
  async resetPassword(
    @Body() body: { resetToken: string; newPassword: string },
  ) {
    return this.authService.resetPassword(body.resetToken, body.newPassword);
  }
}
