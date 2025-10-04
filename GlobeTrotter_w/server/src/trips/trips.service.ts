import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async create(createTripDto: CreateTripDto, userId: string) {
    // Validate that startDate is before endDate
    const startDate = new Date(createTripDto.startDate);
    const endDate = new Date(createTripDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const trip = await this.prisma.trip.create({
      data: {
        ...createTripDto,
        startDate,
        endDate,
        owner: {
          connect: { id: userId },
        },
        budget: createTripDto.budget
          ? new Decimal(createTripDto.budget)
          : new Decimal(0),
      },
    });

    return {
      id: trip.id,
      message: 'Trip created successfully!',
      success: true,
    };
  }

  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters?: {
      name?: string;
      startDate?: string;
      endDate?: string;
      minBudget?: string;
      maxBudget?: string;
    },
  ) {
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = { ownerId: userId };

    if (filters?.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }

    if (filters?.startDate) {
      where.startDate = { gte: new Date(filters.startDate) };
    }

    if (filters?.endDate) {
      where.endDate = { lte: new Date(filters.endDate) };
    }

    if (filters?.minBudget || filters?.maxBudget) {
      where.budget = {};
      if (filters.minBudget) {
        where.budget.gte = parseFloat(filters.minBudget);
      }
      if (filters.maxBudget) {
        where.budget.lte = parseFloat(filters.maxBudget);
      }
    }

    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          startDate: true,
          endDate: true,
          budget: true,
          isPublic: true,
          ownerId: true,
          createdAt: true,
          owner: {
            select: {
              name: true,
            },
          },
        },
      }),
      this.prisma.trip.count({
        where,
      }),
    ]);

    return {
      trips: trips.map((trip) => this.formatTripSummary(trip)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    // Allow viewing if:
    // 1. User owns the trip (when authenticated)
    // 2. Trip is public (regardless of authentication)
    const isOwner = userId && trip.ownerId === userId;
    const isPublicTrip = trip.isPublic;

    const canView = isOwner || isPublicTrip;

    if (!canView) {
      throw new ForbiddenException('Access denied');
    }

    return {
      message: 'Trip retrieved successfully',
      success: true,
      data: {
        ...this.formatTripDetail(trip),
        isOwned: userId ? trip.ownerId === userId : false,
        ownerName: trip.owner?.name,
      },
    };
  }

  async update(id: string, updateTripDto: UpdateTripDto, userId: string) {
    // First check if trip exists and user owns it
    const existingTrip = await this.prisma.trip.findUnique({
      where: { id },
    });

    if (!existingTrip) {
      throw new NotFoundException('Trip not found');
    }

    if (existingTrip.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Validate dates if both are being updated
    if (updateTripDto.startDate && updateTripDto.endDate) {
      const startDate = new Date(updateTripDto.startDate);
      const endDate = new Date(updateTripDto.endDate);

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    } else if (updateTripDto.startDate && existingTrip.endDate) {
      const startDate = new Date(updateTripDto.startDate);
      const endDate = new Date(existingTrip.endDate);

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    } else if (updateTripDto.endDate && existingTrip.startDate) {
      const startDate = new Date(existingTrip.startDate);
      const endDate = new Date(updateTripDto.endDate);

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    await this.prisma.trip.update({
      where: { id },
      data: {
        ...updateTripDto,
        ...(updateTripDto.startDate && {
          startDate: new Date(updateTripDto.startDate),
        }),
        ...(updateTripDto.endDate && {
          endDate: new Date(updateTripDto.endDate),
        }),
      },
    });

    return {
      message: 'Trip updated successfully!',
      success: true,
    };
  }

  async remove(id: string, userId: string) {
    // First check if trip exists and user owns it
    const existingTrip = await this.prisma.trip.findUnique({
      where: { id },
    });

    if (!existingTrip) {
      throw new NotFoundException('Trip not found');
    }

    if (existingTrip.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.trip.delete({
      where: { id },
    });

    return {
      message: 'Trip deleted successfully!',
      success: true,
    };
  }

  async getUserCalendar(userId: string) {
    const activities = await this.prisma.activity.findMany({
      where: {
        place: {
          tripStop: {
            trip: {
              ownerId: userId,
            },
          },
        },
      },
      include: {
        place: {
          include: {
            tripStop: {
              include: {
                trip: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const calendarEvents = activities.map((activity) => ({
      id: activity.id,
      title: `${activity.title} - ${activity.place.name}`,
      start: activity.startTime,
      end: activity.endTime,
      description: activity.description,
      placeName: activity.place.name,
      tripName: activity.place.tripStop.trip.name,
      tripId: activity.place.tripStop.trip.id,
    }));

    return calendarEvents;
  }

  async getCalendar(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const activities = await this.prisma.activity.findMany({
      where: {
        place: {
          tripStop: {
            tripId: tripId,
          },
        },
      },
      include: {
        place: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const calendarEvents = activities.map((activity) => ({
      id: activity.id,
      title: `${activity.title} - ${activity.place.name}`,
      start: activity.startTime,
      end: activity.endTime,
      description: activity.description,
      placeName: activity.place.name,
    }));

    return calendarEvents;
  }

  async findPublicTrips(
    page: number = 1,
    limit: number = 20,
    filters?: {
      name?: string;
      startDate?: string;
      endDate?: string;
      minBudget?: string;
      maxBudget?: string;
    },
  ) {
    const skip = (page - 1) * limit;

    // Build where clause for filtering public trips only
    const where: any = { isPublic: true };

    if (filters?.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }

    if (filters?.startDate) {
      where.startDate = { gte: new Date(filters.startDate) };
    }

    if (filters?.endDate) {
      where.endDate = { lte: new Date(filters.endDate) };
    }

    if (filters?.minBudget || filters?.maxBudget) {
      where.budget = {};
      if (filters.minBudget) {
        where.budget.gte = parseFloat(filters.minBudget);
      }
      if (filters.maxBudget) {
        where.budget.lte = parseFloat(filters.maxBudget);
      }
    }

    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          startDate: true,
          endDate: true,
          budget: true,
          isPublic: true,
          ownerId: true,
          createdAt: true,
          owner: {
            select: {
              name: true,
            },
          },
        },
      }),
      this.prisma.trip.count({
        where,
      }),
    ]);

    return {
      trips: trips.map((trip) => this.formatTripSummary(trip)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findSimilarPublicTrips(
    name?: string,
    description?: string,
    limit: number = 5,
  ) {
    const where: any = { isPublic: true };
    const searchTerms: string[] = [];

    // Collect search terms from name and description
    if (name) {
      searchTerms.push(
        ...name
          .toLowerCase()
          .split(/\s+/)
          .filter((term) => term.length > 2),
      );
    }
    if (description) {
      searchTerms.push(
        ...description
          .toLowerCase()
          .split(/\s+/)
          .filter((term) => term.length > 2),
      );
    }

    // If no meaningful search terms, return empty results
    if (searchTerms.length === 0) {
      return { trips: [] };
    }

    // Build OR conditions for name and description matching
    const searchConditions = [];

    // Search in trip names
    searchTerms.forEach((term) => {
      searchConditions.push({
        name: { contains: term, mode: 'insensitive' as const },
      });
    });

    // Search in trip descriptions
    searchTerms.forEach((term) => {
      searchConditions.push({
        description: { contains: term, mode: 'insensitive' as const },
      });
    });

    where.OR = searchConditions;

    const trips = await this.prisma.trip.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        budget: true,
        isPublic: true,
        ownerId: true,
        createdAt: true,
        owner: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      trips: trips.map((trip) => this.formatTripSummary(trip)),
    };
  }

  private async updateTripBudget(tripId: string) {
    // Calculate total budget from all activities in the trip
    const totalBudget = await this.prisma.activity.aggregate({
      where: {
        place: {
          tripStop: {
            tripId: tripId,
          },
        },
      },
      _sum: {
        expense: true,
      },
    });

    const newBudget = totalBudget._sum.expense || new Decimal(0);

    // Update the trip budget
    await this.prisma.trip.update({
      where: { id: tripId },
      data: { budget: newBudget },
    });

    return newBudget;
  }

  private formatTripSummary(trip: {
    id: string;
    name: string;
    description?: string | null;
    startDate: Date;
    endDate: Date;
    budget: Decimal | null;
    isPublic: boolean;
    ownerId: string;
    createdAt: Date;
    owner?: {
      name: string;
    };
  }) {
    return {
      id: trip.id,
      name: trip.name,
      description: trip.description,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      budget: trip.budget?.toString() || null,
      isPublic: trip.isPublic,
      ownerId: trip.ownerId,
      createdAt: trip.createdAt.toISOString(),
      ownerName: trip.owner?.name,
    };
  }

  private formatTripDetail(trip: any) {
    return {
      id: trip.id,
      name: trip.name,
      description: trip.description,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      budget: trip.budget?.toString() || null,
      isPublic: trip.isPublic,
      ownerId: trip.ownerId,
      createdAt: trip.createdAt.toISOString(),
      updatedAt: trip.updatedAt.toISOString(),
    };
  }
}
