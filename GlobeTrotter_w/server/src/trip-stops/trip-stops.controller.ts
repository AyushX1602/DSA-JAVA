import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TripStopsService } from './trip-stops.service';
import { CreateTripStopDto } from './dto/create-trip-stop.dto';
import { UpdateTripStopDto } from './dto/update-trip-stop.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string; role: string };
}

@Controller('trips/:tripId/stops')
export class TripStopsController {
  constructor(private readonly tripStopsService: TripStopsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('tripId') tripId: string,
    @Body() createTripStopDto: CreateTripStopDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tripStopsService.create(
      tripId,
      createTripStopDto,
      req.user.userId,
    );
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Param('tripId') tripId: string, @Request() req: any) {
    const userId = req.user?.userId;
    return this.tripStopsService.findAll(tripId, userId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.userId;
    return this.tripStopsService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateTripStopDto: UpdateTripStopDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tripStopsService.update(id, updateTripStopDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.tripStopsService.remove(id, req.user.userId);
  }
}
