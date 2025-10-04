import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommunityMessageDto } from './dto/create-community-message.dto';

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async createMessage(
    createMessageDto: CreateCommunityMessageDto,
    userId: string,
  ) {
    await this.prisma.communityMessage.create({
      data: {
        content: createMessageDto.content,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return {
      message: 'Message sent successfully!',
      success: true,
    };
  }

  async findAll(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.communityMessage.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.communityMessage.count(),
    ]);

    return {
      messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    return this.prisma.communityMessage.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.prisma.communityMessage.delete({
      where: {
        id,
        userId,
      },
    });
    return {
      message: 'Message deleted successfully!',
      success: true,
    };
  }
}
