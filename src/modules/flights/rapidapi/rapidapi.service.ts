import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RapidApiService {
  constructor(private readonly httpService: HttpService) {}

  async getEntityId(query: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `https://${process.env.RAPIDAPI_HOST}/flights/auto-complete`,
          {
            params: { query },
            headers: {
              'x-rapidapi-host': process.env.RAPIDAPI_HOST,
              'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            },
          }
        )
      );

      if (!response.data.data || response.data.data.length === 0) {
        throw new BadRequestException('Please change the location');
      }

      return response.data.data[0].presentation.id;
    } catch (e) {
      console.log(e);
      throw new BadRequestException('Something went wrong');
    }
  }

  async searchRoundtrip(fromEntityId: string, toEntityId: string, departDate: string, returnDate: string, market?: string, currency?: string, stops?: string, adults?: number, children?: number, infants?: number, cabinClass?: string): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `https://${process.env.RAPIDAPI_HOST}/flights/search-roundtrip`,
          {
            params: { fromEntityId, toEntityId, departDate, returnDate, market, currency, stops, adults, children, infants, cabinClass },
            headers: {
              'x-rapidapi-host': process.env.RAPIDAPI_HOST,
              'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            },
          }
        )
      );

      return response.data;
    } catch (e) {
      console.log(e);
      throw new BadRequestException('Something went wrong');
    }
  }
}
