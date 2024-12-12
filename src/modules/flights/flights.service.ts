import { Injectable } from '@nestjs/common';
import { RapidApiService } from './rapidapi/rapidapi.service';
import { FlightSearchDto } from './dto/flight-search.dto';
import { FlightOption, FlightLeg } from './interfaces/flight-option.interface';
import * as moment from 'moment';

@Injectable()
export class FlightsService {
  constructor(private readonly rapidApiService: RapidApiService) {}

  async searchFlights(dto: FlightSearchDto): Promise<FlightOption[]> {
    // const fromEntityId = await this.rapidApiService.getEntityId(dto.originQuery);
    // const toEntityId = await this.rapidApiService.getEntityId(dto.destinationQuery);

    const [fromEntityId, toEntityId] = await Promise.all([
      this.rapidApiService.getEntityId(dto.originQuery),
      this.rapidApiService.getEntityId(dto.destinationQuery)
    ]);

    const rawData = await this.rapidApiService.searchRoundtrip(
      fromEntityId,
      toEntityId,
      dto.departDate,
      dto.returnDate,
      dto.market,
      dto.currency,
      dto.adults,
      dto.children,
      dto.infants,
      dto.cabinClass
    );

    return this.transformFlightData(rawData);
  }

  // Private helper method to transform the raw RapidAPI data
  private transformFlightData(response: any): FlightOption[] {
    const flights = response.data.itineraries || [];

    return flights.map((flight: any) => {
      const price = flight?.price?.raw ?? 0;

      const outboundLeg = flight.legs?.[0];
      const inboundLeg = flight.legs?.[1];

      const depature : FlightLeg = {
        airline: outboundLeg?.carriers?.marketing?.[0]?.name || 'Unknown Airline',
        departure: outboundLeg?.departure ? outboundLeg.departure : '',
        arrival: outboundLeg?.arrival ? outboundLeg.arrival : '',
        stopCount: outboundLeg?.segments?.length || 0,
        segments: outboundLeg?.segments || []
      }

      const arrival : FlightLeg = {
        airline: inboundLeg?.carriers?.marketing?.[0]?.name || 'Unknown Airline',
        departure: inboundLeg?.departure ? inboundLeg.departure : '',
        arrival: inboundLeg?.arrival ? inboundLeg.arrival : '',
        stopCount: inboundLeg?.segments?.length || 0,
        segments: inboundLeg?.segments || []
      }

      const departureDate = outboundLeg?.departure ? moment(outboundLeg.departure).format('YYYY-MM-DD') : '';
      const returnDate = inboundLeg?.departure ? moment(inboundLeg.departure).format('YYYY-MM-DD') : '';

      return {
        price,
        depature,
        arrival,
        departureDate,
        returnDate
      };
    });
  }
}
