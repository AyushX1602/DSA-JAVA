import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

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

    const newBudget = totalBudget._sum.expense || 0;

    // Update the trip budget
    await this.prisma.trip.update({
      where: { id: tripId },
      data: { budget: newBudget },
    });

    return newBudget;
  }

  async create(
    placeId: string,
    createActivityDto: CreateActivityDto,
    userId: string,
  ) {
    // First verify the place exists and user owns the trip
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
      include: {
        tripStop: {
          include: { trip: true },
        },
      },
    });

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    if (place.tripStop.trip.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Validate that activity times are within trip stop boundaries
    const startTime = new Date(createActivityDto.startTime);
    const endTime = new Date(createActivityDto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (
      startTime < place.tripStop.startDate ||
      endTime > place.tripStop.endDate
    ) {
      throw new BadRequestException(
        'Activity times must be within trip stop date range',
      );
    }

    // Check for time conflicts with existing activities at the same place
    await this.checkTimeConflicts(placeId, startTime, endTime);

    await this.prisma.activity.create({
      data: {
        placeId,
        title: createActivityDto.title,
        description: createActivityDto.description,
        expense: createActivityDto.expense,
        startTime,
        endTime,
      },
    });

    // Update trip budget after creating activity
    await this.updateTripBudget(place.tripStop.trip.id);

    return {
      message: 'Activity created successfully!',
      success: true,
    };
  }

  async findAll(placeId: string, userId?: string) {
    // First verify the place exists and check access permissions
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
      include: {
        tripStop: {
          include: { trip: true },
        },
      },
    });

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    // Allow viewing if:
    // 1. User owns the trip (when authenticated)
    // 2. Trip is public (regardless of authentication)
    const isOwner = userId && place.tripStop.trip.ownerId === userId;
    const isPublicTrip = place.tripStop.trip.isPublic;

    const canView = isOwner || isPublicTrip;

    if (!canView) {
      throw new ForbiddenException('Access denied');
    }

    const activities = await this.prisma.activity.findMany({
      where: { placeId },
      orderBy: { startTime: 'asc' },
    });

    return activities.map((activity) => this.formatActivity(activity));
  }

  async findOne(id: string, userId?: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        place: {
          include: {
            tripStop: {
              include: { trip: true },
            },
          },
        },
      },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    // Allow viewing if:
    // 1. User owns the trip (when authenticated)
    // 2. Trip is public (regardless of authentication)
    const isOwner = userId && activity.place.tripStop.trip.ownerId === userId;
    const isPublicTrip = activity.place.tripStop.trip.isPublic;

    const canView = isOwner || isPublicTrip;

    if (!canView) {
      throw new ForbiddenException('Access denied');
    }

    return this.formatActivity(activity);
  }

  async update(
    id: string,
    updateActivityDto: UpdateActivityDto,
    userId: string,
  ) {
    // First verify the activity exists and user owns the trip
    const existingActivity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        place: {
          include: {
            tripStop: {
              include: { trip: true },
            },
          },
        },
      },
    });

    if (!existingActivity) {
      throw new NotFoundException('Activity not found');
    }

    if (existingActivity.place.tripStop.trip.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Validate times if they're being updated
    let startTime = existingActivity.startTime;
    let endTime = existingActivity.endTime;

    if (updateActivityDto.startTime) {
      startTime = new Date(updateActivityDto.startTime);
    }
    if (updateActivityDto.endTime) {
      endTime = new Date(updateActivityDto.endTime);
    }

    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (
      startTime < existingActivity.place.tripStop.startDate ||
      endTime > existingActivity.place.tripStop.endDate
    ) {
      throw new BadRequestException(
        'Activity times must be within trip stop date range',
      );
    }

    // Check for time conflicts with other activities at the same place
    await this.checkTimeConflicts(
      existingActivity.placeId,
      startTime,
      endTime,
      id, // Exclude current activity from conflict check
    );

    await this.prisma.activity.update({
      where: { id },
      data: {
        ...updateActivityDto,
        ...(updateActivityDto.startTime && {
          startTime: new Date(updateActivityDto.startTime),
        }),
        ...(updateActivityDto.endTime && {
          endTime: new Date(updateActivityDto.endTime),
        }),
      },
    });

    // Update trip budget after updating activity
    await this.updateTripBudget(existingActivity.place.tripStop.trip.id);

    return {
      message: 'Activity updated successfully!',
      success: true,
    };
  }

  async remove(id: string, userId: string) {
    const existingActivity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        place: {
          include: {
            tripStop: {
              include: { trip: true },
            },
          },
        },
      },
    });

    if (!existingActivity) {
      throw new NotFoundException('Activity not found');
    }

    if (existingActivity.place.tripStop.trip.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.activity.delete({
      where: { id },
    });

    // Update trip budget after deleting activity
    await this.updateTripBudget(existingActivity.place.tripStop.trip.id);

    return {
      message: 'Activity deleted successfully!',
      success: true,
    };
  }

  private async checkTimeConflicts(
    placeId: string,
    startTime: Date,
    endTime: Date,
    excludeActivityId?: string,
  ) {
    const conflictingActivities = await this.prisma.activity.findMany({
      where: {
        placeId,
        id: excludeActivityId ? { not: excludeActivityId } : undefined,
        OR: [
          // New activity overlaps with existing activity
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
    });

    if (conflictingActivities.length > 0) {
      throw new BadRequestException(
        'Activity time conflicts with existing activities at this place',
      );
    }
  }

  private formatActivity(activity: any) {
    return {
      id: activity.id,
      placeId: activity.placeId,
      title: activity.title,
      description: activity.description,
      expense: Number(activity.expense),
      startTime: activity.startTime.toISOString(),
      endTime: activity.endTime.toISOString(),
      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt.toISOString(),
    };
  }
}
