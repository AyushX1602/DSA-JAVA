import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { GeocodingService } from '../common/services/geocoding.service';

@Injectable()
export class PlacesService {
  constructor(
    private prisma: PrismaService,
    private geocodingService: GeocodingService,
  ) {}

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
    tripStopId: string,
    createPlaceDto: CreatePlaceDto,
    userId: string,
  ) {
    // First verify the trip stop exists and user owns the trip
    const tripStop = await this.prisma.tripStop.findUnique({
      where: { id: tripStopId },
      include: { trip: true },
    });

    if (!tripStop) {
      throw new NotFoundException('Trip stop not found');
    }

    if (tripStop.trip.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // If coordinates are not provided, try to geocode the place name
    let latitude = createPlaceDto.latitude;
    let longitude = createPlaceDto.longitude;

    if (!latitude || !longitude) {
      const geocodingResult = await this.geocodingService.geocodeAddress(
        createPlaceDto.name,
      );
      if (geocodingResult) {
        latitude = geocodingResult.latitude;
        longitude = geocodingResult.longitude;
      }
    }

    await this.prisma.place.create({
      data: {
        tripStopId,
        name: createPlaceDto.name,
        latitude: latitude,
        longitude: longitude,
      },
    });

    return {
      message: 'Place created successfully!',
      success: true,
    };
  }

  async findAll(tripStopId: string, userId?: string) {
    // First verify the trip stop exists and check access permissions
    const tripStop = await this.prisma.tripStop.findUnique({
      where: { id: tripStopId },
      include: { trip: true },
    });

    if (!tripStop) {
      throw new NotFoundException('Trip stop not found');
    }

    // Allow viewing if:
    // 1. User owns the trip (when authenticated)
    // 2. Trip is public (regardless of authentication)
    const isOwner = userId && tripStop.trip.ownerId === userId;
    const isPublicTrip = tripStop.trip.isPublic;

    const canView = isOwner || isPublicTrip;

    if (!canView) {
      throw new ForbiddenException('Access denied');
    }

    const places = await this.prisma.place.findMany({
      where: { tripStopId },
      include: {
        activities: {
          orderBy: { startTime: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return places.map((place) => this.formatPlaceWithActivities(place));
  }

  async findOne(id: string, userId?: string) {
    const place = await this.prisma.place.findUnique({
      where: { id },
      include: {
        tripStop: {
          include: { trip: true },
        },
        activities: {
          orderBy: { startTime: 'asc' },
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

    return this.formatPlaceWithActivities(place);
  }

  async update(id: string, updatePlaceDto: UpdatePlaceDto, userId: string) {
    // First verify the place exists and user owns the trip
    const existingPlace = await this.prisma.place.findUnique({
      where: { id },
      include: {
        tripStop: {
          include: { trip: true },
        },
      },
    });

    if (!existingPlace) {
      throw new NotFoundException('Place not found');
    }

    if (existingPlace.tripStop.trip.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.place.update({
      where: { id },
      data: updatePlaceDto,
    });

    return {
      message: 'Place updated successfully!',
      success: true,
    };
  }

  async remove(id: string, userId: string) {
    // First verify the place exists and user owns the trip
    const existingPlace = await this.prisma.place.findUnique({
      where: { id },
      include: {
        tripStop: {
          include: { trip: true },
        },
      },
    });

    if (!existingPlace) {
      throw new NotFoundException('Place not found');
    }

    if (existingPlace.tripStop.trip.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Delete the place (activities will be deleted due to cascade)
    await this.prisma.place.delete({
      where: { id },
    });

    // Update trip budget after deleting place (activities are cascaded)
    await this.updateTripBudget(existingPlace.tripStop.trip.id);
  }

  private formatPlaceWithActivities(place: any) {
    const totalExpense = place.activities.reduce(
      (sum: number, activity: any) => sum + Number(activity.expense),
      0,
    );

    return {
      id: place.id,
      tripStopId: place.tripStopId,
      name: place.name,
      latitude: place.latitude ? Number(place.latitude) : null,
      longitude: place.longitude ? Number(place.longitude) : null,
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
  }
}
