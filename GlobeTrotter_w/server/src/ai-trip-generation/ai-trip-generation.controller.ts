import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Get,
  Param,
} from '@nestjs/common';
import { AiTripGenerationService } from './ai-trip-generation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string; role: string };
}

interface GenerateTripDto {
  city: string;
  duration: number; // in days
  budget: string;
  interests: string[];
}

interface EstimateActivityCostDto {
  title: string;
  description?: string;
  placeName: string;
  city: string;
  startTime: string;
  endTime: string;
}

interface GenerateNarrationDto {
  trip?: { name?: string; description?: string } | null;
  stop?: { city?: string; notes?: string } | null;
  place?: { name?: string } | null;
  activity: {
    id?: string;
    title: string;
    description?: string;
    expense?: number;
    startTime?: string;
    endTime?: string;
  };
}

@Controller('ai-trip-generation')
export class AiTripGenerationController {
  constructor(
    private readonly aiTripGenerationService: AiTripGenerationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generateTrip(
    @Body() generateTripDto: GenerateTripDto,
    @Request() req: AuthenticatedRequest,
  ) {
    // Validate input
    if (
      !generateTripDto.city ||
      !generateTripDto.duration ||
      !generateTripDto.budget
    ) {
      throw new BadRequestException(
        'City, duration, and budget are required fields',
      );
    }

    if (generateTripDto.duration < 1 || generateTripDto.duration > 30) {
      throw new BadRequestException('Duration must be between 1 and 30 days');
    }

    if (!Array.isArray(generateTripDto.interests)) {
      generateTripDto.interests = [];
    }

    return this.aiTripGenerationService.generateTrip(
      generateTripDto.city,
      generateTripDto.duration,
      generateTripDto.budget,
      generateTripDto.interests,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('estimate-cost')
  @HttpCode(HttpStatus.OK)
  async estimateActivityCost(@Body() estimateCostDto: EstimateActivityCostDto) {
    // Validate input
    if (
      !estimateCostDto.title ||
      !estimateCostDto.placeName ||
      !estimateCostDto.city
    ) {
      throw new BadRequestException(
        'Title, place name, and city are required fields',
      );
    }

    return this.aiTripGenerationService.estimateActivityCost(
      estimateCostDto.title,
      estimateCostDto.description || '',
      estimateCostDto.placeName,
      estimateCostDto.city,
      estimateCostDto.startTime,
      estimateCostDto.endTime,
    );
  }

  @Get('trip/:tripId/images')
  async getTripImages(@Param('tripId') tripId: string) {
    if (!tripId) {
      throw new BadRequestException('Trip ID is required');
    }

    return this.aiTripGenerationService.fetchTripImages(tripId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('narrate-activity')
  @HttpCode(HttpStatus.OK)
  async narrateActivity(@Body() dto: GenerateNarrationDto) {
    if (!dto?.activity?.title) {
      throw new BadRequestException('Activity title is required');
    }
    return this.aiTripGenerationService.generateActivityNarration(
      dto.trip || null,
      dto.stop || null,
      dto.place || null,
      dto.activity,
    );
  }
}
