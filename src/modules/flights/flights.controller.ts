import { Controller, Post, Body, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { FlightSearchDto } from './dto/flight-search.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';

@ApiTags('Flights')
@Controller('search-flight')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post()
  @ApiOperation({ summary: 'Search for roundtrip flights' })
  @ApiResponse({ status: 200, description: 'Flights retrieved successfully.' })
  // BONUS: Protect Endpoint - using an API Key Guard as an example
  @UseGuards(ApiKeyGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async searchFlights(@Body() dto: FlightSearchDto) {
    const result = await this.flightsService.searchFlights(dto);
    return {
      status: 'success',
      data: result
    };
  }
}
