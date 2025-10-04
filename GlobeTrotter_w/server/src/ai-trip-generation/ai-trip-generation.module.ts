import { Module } from '@nestjs/common';
import { AiTripGenerationController } from './ai-trip-generation.controller';
import { AiTripGenerationService } from './ai-trip-generation.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiTripGenerationController],
  providers: [AiTripGenerationService],
  exports: [AiTripGenerationService],
})
export class AiTripGenerationModule {}
