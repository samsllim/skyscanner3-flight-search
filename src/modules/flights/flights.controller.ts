import { 
  Controller, 
  Post, 
  Body, 
  UsePipes, 
  ValidationPipe, 
  UseGuards, 
  InternalServerErrorException, 
  HttpException, 
} from '@nestjs/common';
import { FlightsService } from './flights.service';
import { FlightSearchDto } from './dto/flight-search.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@ApiTags('Flights')
@Controller('search-flight')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post()
  @ApiOperation({ summary: 'Search for roundtrip flights' })
  @ApiResponse({ status: 200, description: 'Flights retrieved successfully.' })
  @UseGuards(ApiKeyGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async searchFlights(@Body() dto: FlightSearchDto) {
    try {
      const result = await this.flightsService.searchFlights(dto);
      return {
        status: 'success',
        data: result
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }
}
