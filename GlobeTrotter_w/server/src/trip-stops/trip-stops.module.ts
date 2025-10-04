import { Module } from '@nestjs/common';
import { TripStopsService } from './trip-stops.service';
import { TripStopsController } from './trip-stops.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TripStopsController],
  providers: [TripStopsService],
  exports: [TripStopsService],
})
export class TripStopsModule {}
