import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreateCommunityMessageDto } from './dto/create-community-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string; role: string };
}

@Controller('community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  createMessage(
    @Body() createMessageDto: CreateCommunityMessageDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communityService.createMessage(
      createMessageDto,
      req.user.userId,
    );
  }

  @Get('messages')
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;

    return this.communityService.findAll(pageNum, limitNum);
  }

  @Get('messages/:id')
  findOne(@Param('id') id: string) {
    return this.communityService.findOne(id);
  }

  @Delete('messages/:id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.communityService.remove(id, req.user.userId);
  }
}
