import { IsDateString, IsOptional, IsString, IsEnum, IsInt, Min, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import * as moment from 'moment';

export enum CabinClass {
  ECONOMY = 'economy',
  PREMIUM_ECONOMY = 'premium_economy',
  BUSINESS = 'business',
  FIRST = 'first',
}

export enum Stops {
  DIRECT = 'direct',
  ONE_STOP = '1stop',
  TWO_STOP = '2stop'
}

// const ALLOWED_CURRENCIES = ['USD', 'EUR', 'MYR', 'MZN']; // Example list
// const ALLOWED_MARKETS = ['US', 'MY', 'MZ']; // Example markets

const exampleDepartDate = moment().add(1, 'days').format('YYYY-MM-DD').toString();
const exampleReturnDate = moment(exampleDepartDate).add(7, 'days').format('YYYY-MM-DD').toString();

export class FlightSearchDto {
  @ApiProperty({ example: 'New York' })
  @IsString()
  originQuery: string;

  @ApiProperty({ example: 'London' })
  @IsString()
  destinationQuery: string;

  @ApiProperty({ example: exampleDepartDate })
  @IsDateString()
  departDate: string;

  @ApiProperty({ example: exampleReturnDate })
  @IsDateString()
  returnDate: string;

  @ApiProperty({ enum: Stops, example: 'direct', required: false })
  @IsOptional()
  @IsEnum(Stops)
  stops?: Stops = Stops.DIRECT;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  adults?: number = 1;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  children?: number = 0;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  infants?: number = 0;

  @ApiProperty({ enum: CabinClass, example: 'economy', required: false })
  @IsOptional()
  @IsEnum(CabinClass)
  cabinClass?: CabinClass = CabinClass.ECONOMY;

  @ApiProperty({ example: 'USD', required: false })
  @IsOptional()
  @IsString()
  // @IsIn(ALLOWED_CURRENCIES, { message: 'currency must be one of the allowed values: USD, EUR, MYR, MZN' })
  currency?: string = 'USD';

  @ApiProperty({ example: 'US', required: false })
  @IsOptional()
  @IsString()
  // @IsIn(ALLOWED_MARKETS, { message: 'market must be one of the allowed values: US, MY, MZ' })
  market?: string = 'US';
}

