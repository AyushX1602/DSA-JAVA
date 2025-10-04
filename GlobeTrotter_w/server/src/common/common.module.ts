import { Module } from '@nestjs/common';
import { GeocodingService } from './services/geocoding.service';
import { EmailService } from './services/email.service';

@Module({
  providers: [GeocodingService, EmailService],
  exports: [GeocodingService, EmailService],
})
export class CommonModule {}
