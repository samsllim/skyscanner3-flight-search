import { Test, TestingModule } from '@nestjs/testing';
import { FlightsService } from '../src/modules/flights/flights.service';
import { FlightsController } from '../src/modules/flights/flights.controller';
import { FlightSearchDto, CabinClass } from '../src/modules/flights/dto/flight-search.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

const mockFlightsService = {
  searchFlights: jest.fn(),
};

describe('FlightsController', () => {
  let controller: FlightsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlightsController],
      providers: [
        {
          provide: FlightsService,
          useValue: mockFlightsService,
        },
      ],
    }).compile();

    controller = module.get<FlightsController>(FlightsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Validation', () => {
    it('should validate valid FlightSearchDto successfully', async () => {
      const dto = plainToInstance(FlightSearchDto, {
        originQuery: 'Kuala Lumpur',
        destinationQuery: 'London',
        departDate: '2024-12-13',
        returnDate: '2024-12-20',
        adults: 1,
        children: 0,
        infants: 0,
        cabinClass: 'economy',
        currency: 'MYR',
        market: 'MY',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if returnDate is earlier than departDate', async () => {
      const dto = plainToInstance(FlightSearchDto, {
        originQuery: 'Kuala Lumpur',
        destinationQuery: 'London',
        departDate: '2024-12-13',
        returnDate: '2024-12-10',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isReturnDateValid).toBe(
        'Return date must be on or after the departure date',
      );
    });

    it('should fail if departDate is in the past', async () => {
      const dto = plainToInstance(FlightSearchDto, {
        originQuery: 'Kuala Lumpur',
        destinationQuery: 'London',
        departDate: '2023-12-01', // A date in the past
        returnDate: '2024-12-10',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isDateFromToday).toBe(
        'Departure date must be from today onward',
      );
    });
  });

  describe('searchFlights', () => {
    it('should call service with correct data', async () => {
      const dto: FlightSearchDto = {
        originQuery: 'Kuala Lumpur',
        destinationQuery: 'London',
        departDate: '2024-12-13',
        returnDate: '2024-12-20',
        adults: 1,
        children: 0,
        infants: 0,
        cabinClass: CabinClass.ECONOMY,
        currency: 'MYR',
        market: 'MY',
      };

      mockFlightsService.searchFlights.mockResolvedValueOnce([{ price: 1000 }]);

      const result = await controller.searchFlights(dto);

      expect(mockFlightsService.searchFlights).toHaveBeenCalledWith(dto);
      expect(result.data).toEqual([{ price: 1000 }]);
    });
  });
});
