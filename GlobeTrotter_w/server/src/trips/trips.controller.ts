import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string; role: string };
}

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  // Public endpoint - no authentication required
  @Get('public')
  findPublicTrips(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('minBudget') minBudget?: string,
    @Query('maxBudget') maxBudget?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    return this.tripsService.findPublicTrips(pageNum, limitNum, {
      name,
      startDate,
      endDate,
      minBudget,
      maxBudget,
    });
  }

  // Public endpoint for getting trip suggestions based on name/description
  @Get('suggestions')
  getTripSuggestions(
    @Query('name') name?: string,
    @Query('description') description?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.tripsService.findSimilarPublicTrips(
      name,
      description,
      limitNum,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createTripDto: CreateTripDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tripsService.create(createTripDto, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('minBudget') minBudget?: string,
    @Query('maxBudget') maxBudget?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    return this.tripsService.findAll(req.user.userId, pageNum, limitNum, {
      name,
      startDate,
      endDate,
      minBudget,
      maxBudget,
    });
  }

  @Get('calendar')
  @UseGuards(JwtAuthGuard)
  getUserCalendar(@Request() req: AuthenticatedRequest) {
    return this.tripsService.getUserCalendar(req.user.userId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req: any) {
    // Extract user ID if authenticated, otherwise undefined
    const userId = req.user?.userId;
    return this.tripsService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateTripDto: UpdateTripDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tripsService.update(id, updateTripDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.tripsService.remove(id, req.user.userId);
  }
}
