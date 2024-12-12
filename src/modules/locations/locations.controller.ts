import { Controller, Get, Ip, Post, Body, Req } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Locations')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationsService: LocationsService) {}
  @Get('detect')
  async detectLocation(@Ip() ipAddress: string) {
    return this.locationsService.getLocationDetails(ipAddress);
  }
}
