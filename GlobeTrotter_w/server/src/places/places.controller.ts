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
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string; role: string };
}

@Controller('trip-stops/:tripStopId/places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('tripStopId') tripStopId: string,
    @Body() createPlaceDto: CreatePlaceDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.placesService.create(
      tripStopId,
      createPlaceDto,
      req.user.userId,
    );
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Param('tripStopId') tripStopId: string, @Request() req: any) {
    const userId = req.user?.userId;
    return this.placesService.findAll(tripStopId, userId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.userId;
    return this.placesService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updatePlaceDto: UpdatePlaceDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.placesService.update(id, updatePlaceDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.placesService.remove(id, req.user.userId);
  }
}
