import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../common/services/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async signup(input: {
    name: string;
    email: string;
    phoneNumber?: string;
    city?: string;
    country?: string;
    password: string;
  }): Promise<{ accessToken: string; message: string; success: boolean }> {
    const user = await this.usersService.createUser({ ...input, role: 'USER' });
    const token = this.signToken(user);
    return {
      accessToken: token,
      message: 'User registered successfully',
      success: true,
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{
    user: User;
    accessToken: string;
    message: string;
    success: boolean;
  }> {
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.signToken(user);
    return {
      user,
      accessToken: token,
      message: 'Login successful',
      success: true,
    };
  }

  signToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role as Role,
    };
    return this.jwtService.sign(payload);
  }

  async updateProfile(
    userId: string,
    updateData: {
      name?: string;
      phoneNumber?: string;
      city?: string;
      country?: string;
    },
  ): Promise<{
    message: string;
    success: boolean;
    user: Omit<User, 'passwordHash'>;
  }> {
    const updatedUser = await this.usersService.updateUser(userId, updateData);
    return {
      message: 'Profile updated successfully',
      success: true,
      user: updatedUser,
    };
  }

  async getCurrentUser(userId: string): Promise<Omit<User, 'passwordHash'>> {
    return this.usersService.getUserById(userId);
  }

  // Forgot password flow
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private signResetToken(user: Pick<User, 'id' | 'email'>): string {
    const payload = {
      sub: user.id,
      email: user.email,
      purpose: 'reset_password',
    };
    // short lived reset token
    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }

  async requestPasswordReset(
    email: string,
  ): Promise<{ message: string; success: boolean }> {
    const user = await this.usersService.findByEmail(email);

    // Always return generic message
    const genericResponse = {
      message: 'If an account exists for this email, an OTP has been sent.',
      success: true,
    } as const;

    if (!user) {
      return genericResponse;
    }

    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.passwordResetRequest.create({
      data: {
        userId: user.id,
        otpHash,
        expiresAt,
      },
    });

    await this.emailService.sendPasswordResetOtp({
      toEmail: user.email,
      toName: user.name,
      otp,
    });
    return genericResponse;
  }

  async verifyPasswordResetOtp(
    email: string,
    otp: string,
  ): Promise<{ resetToken: string; success: boolean; message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // generic
      return {
        success: false,
        message: 'Invalid OTP or expired',
        resetToken: '',
      };
    }

    const request = await this.prisma.passwordResetRequest.findFirst({
      where: {
        userId: user.id,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!request) {
      return {
        success: false,
        message: 'Invalid OTP or expired',
        resetToken: '',
      };
    }

    if (request.attempts >= 5) {
      return {
        success: false,
        message: 'Too many attempts. Please request a new OTP.',
        resetToken: '',
      };
    }

    const isValid = await bcrypt.compare(otp, request.otpHash);
    await this.prisma.passwordResetRequest.update({
      where: { id: request.id },
      data: { attempts: request.attempts + 1, used: isValid },
    });

    if (!isValid) {
      return {
        success: false,
        message: 'Invalid OTP or expired',
        resetToken: '',
      };
    }

    const resetToken = this.signResetToken(user);
    return { success: true, message: 'OTP verified', resetToken };
  }

  async resetPassword(
    resetToken: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    let payload: any;
    try {
      payload = this.jwtService.verify(resetToken);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: any) {
      throw new BadRequestException('Invalid or expired token');
    }
    if (!payload || payload.purpose !== 'reset_password') {
      throw new BadRequestException('Invalid token');
    }

    const userId: string = payload.sub;
    // Update password using UsersService helper
    await this.usersService.updateUserPassword(userId, newPassword);

    return { success: true, message: 'Password has been reset successfully' };
  }
}
