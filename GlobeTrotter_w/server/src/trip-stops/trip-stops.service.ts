import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripStopDto } from './dto/create-trip-stop.dto';
import { UpdateTripStopDto } from './dto/update-trip-stop.dto';

@Injectable()
export class TripStopsService {
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
  }

  async create(
    tripId: string,
    createTripStopDto: CreateTripStopDto,
    userId: string,
  ) {
    // First verify the trip exists and user owns it
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Validate dates
    const startDate = new Date(createTripStopDto.startDate);
    const endDate = new Date(createTripStopDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (startDate < trip.startDate || endDate > trip.endDate) {
      throw new BadRequestException(
        'Stop dates must be within trip date range',
      );
    }

    // cityId is optional in the schema, so no validation needed

    await this.prisma.tripStop.create({
      data: {
        tripId,
        startDate,
        endDate,
        cityId: createTripStopDto.cityId,
        city: createTripStopDto.city,
        notes: createTripStopDto.notes,
      },
    });

    return {
      message: 'Trip stop created successfully!',
      success: true,
    };
  }

  async findAll(tripId: string, userId?: string) {
    // First verify the trip exists and check access permissions
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
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

    const stops = await this.prisma.tripStop.findMany({
      where: { tripId },
      include: {
        places: {
          include: {
            activities: {
              orderBy: { startTime: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return stops.map((stop) => this.formatTripStopWithPlaces(stop));
  }

  async findOne(id: string, userId?: string) {
    const stop = await this.prisma.tripStop.findUnique({
      where: { id },
      include: { trip: true },
    });

    if (!stop) {
      throw new NotFoundException('Stop not found');
    }

    // Allow viewing if:
    // 1. User owns the trip (when authenticated)
    // 2. Trip is public (regardless of authentication)
    const isOwner = userId && stop.trip.ownerId === userId;
    const isPublicTrip = stop.trip.isPublic;

    const canView = isOwner || isPublicTrip;

    if (!canView) {
      throw new ForbiddenException('Access denied');
    }

    return this.formatTripStop(stop);
  }

  async update(
    id: string,
    updateTripStopDto: UpdateTripStopDto,
    userId: string,
  ) {
    // First verify the stop exists and user owns the trip
    const existingStop = await this.prisma.tripStop.findUnique({
      where: { id },
      include: { trip: true },
    });

    if (!existingStop) {
      throw new NotFoundException('Stop not found');
    }

    if (existingStop.trip.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Validate dates if they're being updated
    let startDate = existingStop.startDate;
    let endDate = existingStop.endDate;

    if (updateTripStopDto.startDate) {
      startDate = new Date(updateTripStopDto.startDate);
    }
    if (updateTripStopDto.endDate) {
      endDate = new Date(updateTripStopDto.endDate);
    }

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (
      startDate < existingStop.trip.startDate ||
      endDate > existingStop.trip.endDate
    ) {
      throw new BadRequestException(
        'Stop dates must be within trip date range',
      );
    }

    // Validate that cityId is provided if being updated
    if (updateTripStopDto.cityId !== undefined && !updateTripStopDto.cityId) {
      throw new BadRequestException('cityId must be provided');
    }

    await this.prisma.tripStop.update({
      where: { id },
      data: {
        ...updateTripStopDto,
        ...(updateTripStopDto.startDate && {
          startDate: new Date(updateTripStopDto.startDate),
        }),
        ...(updateTripStopDto.endDate && {
          endDate: new Date(updateTripStopDto.endDate),
        }),
      },
    });

    return {
      message: 'Trip stop updated successfully!',
      success: true,
    };
  }

  async remove(id: string, userId: string) {
    // First verify the stop exists and user owns the trip
    const existingStop = await this.prisma.tripStop.findUnique({
      where: { id },
      include: { trip: true },
    });

    if (!existingStop) {
      throw new NotFoundException('Stop not found');
    }

    if (existingStop.trip.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Delete the stop
    await this.prisma.tripStop.delete({
      where: { id },
    });

    // Update trip budget after deleting stop (places and activities are cascaded)
    await this.updateTripBudget(existingStop.trip.id);

    return {
      message: 'Trip stop deleted successfully!',
      success: true,
    };
  }

  private formatTripStop(stop: any) {
    return {
      id: stop.id,
      tripId: stop.tripId,
      cityId: stop.cityId,
      city: stop.city,
      startDate: stop.startDate.toISOString(),
      endDate: stop.endDate.toISOString(),
      notes: stop.notes,
      createdAt: stop.createdAt.toISOString(),
      updatedAt: stop.updatedAt.toISOString(),
    };
  }

  private formatTripStopWithPlaces(stop: any) {
    const places = stop.places.map((place: any) => {
      const totalExpense = place.activities.reduce(
        (sum: number, activity: any) => sum + Number(activity.expense),
        0,
      );

      return {
        id: place.id,
        name: place.name,
        latitude: place.latitude,
        longitude: place.longitude,
        totalExpense: Number(totalExpense.toFixed(2)),
        activities: place.activities.map((activity: any) => ({
          id: activity.id,
          title: activity.title,
          description: activity.description,
          expense: Number(activity.expense),
          startTime: activity.startTime.toISOString(),
          endTime: activity.endTime.toISOString(),
          createdAt: activity.createdAt.toISOString(),
          updatedAt: activity.updatedAt.toISOString(),
        })),
        createdAt: place.createdAt.toISOString(),
        updatedAt: place.updatedAt.toISOString(),
      };
    });

    return {
      id: stop.id,
      tripId: stop.tripId,
      cityId: stop.cityId,
      city: stop.city,
      startDate: stop.startDate.toISOString(),
      endDate: stop.endDate.toISOString(),
      notes: stop.notes,
      places,
      createdAt: stop.createdAt.toISOString(),
      updatedAt: stop.updatedAt.toISOString(),
    };
  }
}
