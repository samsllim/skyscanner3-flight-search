import { Injectable, HttpException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { RapidApiService } from './rapidapi/rapidapi.service';
import { FlightSearchDto } from './dto/flight-search.dto';
import { FlightOption, FlightLeg } from './interfaces/flight-option.interface';
import * as moment from 'moment';

@Injectable()
export class FlightsService {
  constructor(private readonly rapidApiService: RapidApiService) {}

  async searchFlights(dto: FlightSearchDto): Promise<{ all: FlightOption[], weekday: FlightOption[], weekend: FlightOption[] }> {
    try {
      const [fromEntityId, toEntityId] = await Promise.all([
        this.rapidApiService.getEntityId(dto.originQuery),
        this.rapidApiService.getEntityId(dto.destinationQuery)
      ]);

      if (!fromEntityId || !toEntityId) {
        throw new BadRequestException(`Invalid ${fromEntityId ? 'destination' : 'origin'} location. Please change the location`);
      }

      // Generate all possible date pairs between dto.departDate and dto.returnDate
      const datePairs = this.generateDatePairs(dto.departDate, dto.returnDate);

      if (datePairs.length === 0) {
        throw new BadRequestException('No valid date combinations found. Ensure returnDate is after departDate.');
      }

      const results = await Promise.all(
        datePairs.map(([dDate, rDate]) => 
          this.rapidApiService.searchRoundtrip(
            fromEntityId,
            toEntityId,
            dDate,
            rDate,
            dto.market,
            dto.currency,
            dto.adults,
            dto.children,
            dto.infants,
            dto.cabinClass
          ).then(res => this.transformFlightData(res, dto.currency))
        )
      );

      // Flatten all results into a single array
      const allFlights = results.flat();

      const { all, weekday, weekend } = this.groupByWeekendWeekday(allFlights);

      return { all, weekday, weekend };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException('An error occurred while searching flights.');
      }
    }
  }

  // Generate all (departDate, returnDate) pairs where depart < return
  private generateDatePairs(startDate: string, endDate: string): [string, string][] {
    const start = moment(startDate, 'YYYY-MM-DD');
    const end = moment(endDate, 'YYYY-MM-DD');
    const pairs: [string, string][] = [];

    if (!start.isValid() || !end.isValid() || !end.isAfter(start)) {
      return pairs; // no valid pairs if dates invalid or end <= start
    }

    const allDates: moment.Moment[] = [];
    for (let d = moment(start); d.isBefore(end) || d.isSame(end, 'day'); d.add(1, 'day')) {
      allDates.push(moment(d));
    }

    // Create all combinations where depart < return
    for (let i = 0; i < allDates.length; i++) {
      for (let j = i + 1; j < allDates.length; j++) {
        pairs.push([
          allDates[i].format('YYYY-MM-DD'),
          allDates[j].format('YYYY-MM-DD')
        ]);
      }
    }

    return pairs;
  }

  // Determine day type (weekday or weekend)
  private isWeekend(dateStr: string): boolean {
    const dayOfWeek = moment(dateStr, 'YYYY-MM-DD').day(); // Sunday=0, Monday=1, ..., Saturday=6
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  // Group flights into all, weekday, weekend
  private groupByWeekendWeekday(flights: FlightOption[]): { all: FlightOption[], weekday: FlightOption[], weekend: FlightOption[] } {
    const all: FlightOption[] = [...flights];
    const weekday: FlightOption[] = [];
    const weekend: FlightOption[] = [];

    for (const flight of flights) {
      const departIsWeekend = this.isWeekend(flight.departureDate);
      const returnIsWeekend = this.isWeekend(flight.returnDate);

      // If both are weekend
      if (departIsWeekend && returnIsWeekend) {
        weekend.push(flight);
      }
      // If both are weekday (not weekend)
      else if (!departIsWeekend && !returnIsWeekend) {
        weekday.push(flight);
      }
    }

    // Sort flights by price cheapest first
    all.sort((a, b) => a.price - b.price);
    weekday.sort((a, b) => a.price - b.price);
    weekend.sort((a, b) => a.price - b.price);

    return { all, weekday, weekend };
  }

  private transformFlightData(response: any, currency: string): FlightOption[] {
    const flights = response.data.itineraries || [];

    return flights.map((flight: any) => {
      const price = flight?.price?.raw ?? 0;
      const outboundLeg = flight.legs?.[0];
      const inboundLeg = flight.legs?.[1];

      const depature: FlightLeg = {
        airline: outboundLeg?.carriers?.marketing?.[0]?.name || 'Unknown Airline',
        departure: outboundLeg?.departure || '',
        arrival: outboundLeg?.arrival || '',
        stopCount: outboundLeg?.stopCount || 0,
        segments: outboundLeg?.segments || []
      }

      const arrival: FlightLeg = {
        airline: inboundLeg?.carriers?.marketing?.[0]?.name || 'Unknown Airline',
        departure: inboundLeg?.departure || '',
        arrival: inboundLeg?.arrival || '',
        stopCount: inboundLeg?.stopCount || 0,
        segments: inboundLeg?.segments || []
      }

      const departureDate = outboundLeg?.departure ? moment(outboundLeg.departure).format('YYYY-MM-DD') : '';
      const returnDate = inboundLeg?.departure ? moment(inboundLeg.departure).format('YYYY-MM-DD') : '';

      return {
        price,
        currency,
        depature,
        arrival,
        departureDate,
        returnDate
      };
    });
  }
}
