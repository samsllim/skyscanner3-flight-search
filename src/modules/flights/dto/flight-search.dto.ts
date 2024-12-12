import { 
  IsDateString, 
  IsOptional, 
  IsString, 
  IsEnum, 
  IsInt, 
  Min, 
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import * as moment from 'moment';
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

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

// Custom decorator for validating dates from today onward
export function IsDateFromToday(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDateFromToday',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return false;
          
          // Parse the date and compare with today
          const inputDate = moment(value, 'YYYY-MM-DD', true);
          const today = moment().startOf('day');
          
          return inputDate.isSameOrAfter(today);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a date from today onward`;
        }
      },
    });
  };
}

// Custom decorator to ensure return date is not earlier than depart date
export function IsReturnDateValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isReturnDateValid',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as FlightSearchDto;
          
          // If either date is missing, validation will be handled by other decorators
          if (!obj.departDate || !obj.returnDate) return true;
          
          const departDate = moment(obj.departDate, 'YYYY-MM-DD', true);
          const returnDate = moment(obj.returnDate, 'YYYY-MM-DD', true);
          
          return returnDate.isSameOrAfter(departDate);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Return date must be on or after the departure date';
        }
      },
    });
  };
}

const exampleDepartDate = moment().add(1, 'days').format('YYYY-MM-DD').toString();
const exampleReturnDate = moment(exampleDepartDate).add(7, 'days').format('YYYY-MM-DD').toString();

export class FlightSearchDto {
  @ApiProperty({ example: 'Kuala Lumpur' })
  @IsString()
  originQuery: string;

  @ApiProperty({ example: 'London' })
  @IsString()
  destinationQuery: string;

  @ApiProperty({ example: exampleDepartDate })
  @IsDateString()
  @IsDateFromToday({ message: 'Departure date must be from today onward' })
  departDate: string;

  @ApiProperty({ example: exampleReturnDate })
  @IsDateString()
  @IsDateFromToday({ message: 'Return date must be from today onward' })
  @IsReturnDateValid()
  returnDate: string;

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

  @ApiProperty({ example: 'MYR', required: false })
  @IsOptional()
  @IsString()
  currency?: string = 'MYR';

  @ApiProperty({ example: 'MY', required: false })
  @IsOptional()
  @IsString()
  market?: string = 'MY';
}