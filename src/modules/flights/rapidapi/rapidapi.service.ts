import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RapidApiService {
  constructor(private readonly httpService: HttpService) {}

  async getEntityId(query: string) {
    try {
      const response = await firstValueFrom(
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
      
      return response.data.data[0]?.presentation.id;
    } catch (e) {
      const errMsg = e?.response?.data?.message || 'Failed to fetch data from RapidAPI';
      throw new BadRequestException(errMsg);
    }
  }

  async searchRoundtrip(fromEntityId: string, toEntityId: string, departDate: string, returnDate: string, market?: string, currency?: string, adults?: number, children?: number, infants?: number, cabinClass?: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://${process.env.RAPIDAPI_HOST}/flights/search-roundtrip`,
          {
            params: { fromEntityId, toEntityId, departDate, returnDate, market, currency, adults, children, infants, cabinClass, sort: 'cheapest_first' },
            headers: {
              'x-rapidapi-host': process.env.RAPIDAPI_HOST,
              'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            },
          }
        )
      );

      return response.data;
    } catch (e) {
      const errMsg = e?.response?.data?.message || 'Failed to fetch data from RapidAPI';
      throw new BadRequestException(errMsg);
    }
  }
}
