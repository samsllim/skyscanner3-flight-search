import { Module } from '@nestjs/common';
import { LocationController } from './locations.controller';
import { LocationsService } from './locations.service';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [HttpModule],
  controllers: [LocationController],
  providers: [LocationsService],
})
export class LocationsModule {}
