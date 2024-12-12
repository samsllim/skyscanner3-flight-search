import { 
  Controller, 
  Post, 
  Body, 
  UsePipes, 
  ValidationPipe, 
  UseGuards, 
  InternalServerErrorException, 
  HttpException, 
  BadRequestException
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
      // Check if it's an HttpException thrown by the service
      if (error instanceof HttpException || error instanceof BadRequestException) {
        // Rethrow the known HTTP exception so Nest can handle it appropriately
        throw error;
      }
      // Otherwise, throw a generic 500 error
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }
}
