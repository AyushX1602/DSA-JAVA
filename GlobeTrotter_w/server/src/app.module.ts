import { Module } from '@nestjs/common';
import { HelloModule } from './hello/hello.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TripsModule } from './trips/trips.module';
import { TripStopsModule } from './trip-stops/trip-stops.module';
import { PlacesModule } from './places/places.module';
import { ActivitiesModule } from './activities/activities.module';
import { CommunityModule } from './community/community.module';
import { AiTripGenerationModule } from './ai-trip-generation/ai-trip-generation.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    HelloModule,
    TripsModule,
    TripStopsModule,
    PlacesModule,
    ActivitiesModule,
    CommunityModule,
    AiTripGenerationModule,
    CommonModule,
  ],
})
export class AppModule {}
