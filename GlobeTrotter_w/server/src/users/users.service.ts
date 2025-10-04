import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export interface CreateUserInput {
  name: string;
  email: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
  password: string;
  role?: Role;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
  role?: Role;
}

export interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  totalActiveUsers: number;
  recentSignups: number;
  usersByMonth: { month: string; count: number }[];
  usersByCountry: { country: string; count: number }[];
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(
    input: CreateUserInput,
  ): Promise<Omit<User, 'passwordHash'>> {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    return this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phoneNumber: input.phoneNumber ?? null,
        city: input.city ?? null,
        country: input.country ?? null,
        passwordHash,
        role: input.role ?? 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        city: true,
        country: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  // Admin functionality
  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{
    users: Omit<User, 'passwordHash'>[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { city: { contains: search, mode: 'insensitive' as const } },
            { country: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          city: true,
          country: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(id: string): Promise<Omit<User, 'passwordHash'> | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        city: true,
        country: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUser(
    id: string,
    input: UpdateUserInput,
  ): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (input.email && input.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existing) {
        throw new BadRequestException('Email already in use');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: input,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        city: true,
        country: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } });
  }

  async getUserStats(): Promise<UserStats> {
    const [
      totalUsers,
      totalAdmins,
      recentSignupsCount,
      usersByMonth,
      usersByCountry,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      this.prisma.$queryRaw`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
          COUNT(*)::int as count
        FROM "User" 
        WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
        LIMIT 12
      `,
      this.prisma.user.groupBy({
        by: ['country'],
        _count: { country: true },
        where: { country: { not: null } },
        orderBy: { _count: { country: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalUsers,
      totalAdmins,
      totalActiveUsers: totalUsers - totalAdmins, // Users with USER role
      recentSignups: recentSignupsCount,
      usersByMonth: (usersByMonth as any[]).map((item) => ({
        month: item.month,
        count: item.count,
      })),
      usersByCountry: usersByCountry.map((item) => ({
        country: item.country || 'Unknown',
        count: item._count.country,
      })),
    };
  }

  async getTripStats(): Promise<{
    totalTrips: number;
    averageTripsPerUser: number;
    totalActivities: number;
    totalExpenses: number;
    tripsByMonth: { month: string; count: number }[];
  }> {
    const [
      totalTrips,
      totalActivities,
      totalExpenses,
      tripsByMonth,
      totalUsers,
    ] = await Promise.all([
      this.prisma.trip.count(),
      this.prisma.activity.count(),
      this.prisma.activity.aggregate({
        _sum: { expense: true },
      }),
      this.prisma.$queryRaw`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
          COUNT(*)::int as count
        FROM "Trip" 
        WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
        LIMIT 12
      `,
      this.prisma.user.count(),
    ]);

    return {
      totalTrips,
      averageTripsPerUser: totalUsers > 0 ? totalTrips / totalUsers : 0,
      totalActivities,
      totalExpenses: Number(totalExpenses._sum.expense) || 0,
      tripsByMonth: (tripsByMonth as any[]).map((item) => ({
        month: item.month,
        count: item.count,
      })),
    };
  }
}
