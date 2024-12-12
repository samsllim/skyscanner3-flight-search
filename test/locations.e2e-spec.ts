import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';

import { LocationsService, CountryConfig } from '../src/modules/locations/locations.service';
import { LocationController } from '../src/modules/locations/locations.controller';

// Mock data for testing
const mockCountriesConfig: CountryConfig[] = [
  {
    country: 'United States',
    market: 'US',
    locale: 'en-US',
    currencyTitle: 'US Dollar',
    currency: 'USD',
    currencySymbol: '$',
    site: 'www.skyscanner.com'
  },
  {
    country: 'United Kingdom',
    market: 'UK',
    locale: 'en-GB',
    currencyTitle: 'British Pound',
    currency: 'GBP',
    currencySymbol: '£',
    site: 'www.skyscanner.net'
  }
];

describe('LocationsService', () => {
  let service: LocationsService;
  let httpService: HttpService;

  // Mock filesystem and path modules
  const mockFs = {
    readFileSync: jest.fn()
  };

  const mockPath = {
    join: jest.fn().mockReturnValue('/mock/path/to/countries-config.json')
  };

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();
    mockFs.readFileSync.mockReturnValue(JSON.stringify({ data: mockCountriesConfig }));

    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        LocationsService,
        {
          provide: 'fs',
          useValue: mockFs
        },
        {
          provide: 'path',
          useValue: mockPath
        }
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
    httpService = module.get<HttpService>(HttpService);
  });

  // Test findCountryConfig method
  describe('findCountryConfig', () => {
    it('should find country config by market code', () => {
      const config = service.findCountryConfig('US');
      expect(config).toEqual(mockCountriesConfig[0]);
    });

    it('should find country config by country name', () => {
      const config = service.findCountryConfig('United Kingdom');
      expect(config).toEqual(mockCountriesConfig[1]);
    });

    it('should return null for unknown country', () => {
      const config = service.findCountryConfig('Unknown Country');
      expect(config).toBeNull();
    });
  });

  // Test getCountryFromIp method
  describe('getCountryFromIp', () => {
    it('should return country code for valid IP', async () => {
      // Mock HTTP service response
      const mockResponse = {
        data: { country_code: 'US' }
      };
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse) as any);

      const result = await service.getCountryFromIp('8.8.8.8');
      expect(result).toBe('US');
    });
  });

  // Test getLocationDetails method
  describe('getLocationDetails', () => {
    it('should return location details for valid IP', async () => {
      // Mock IP geolocation
      jest.spyOn(service, 'getCountryFromIp').mockResolvedValue('US');

      const result = await service.getLocationDetails('8.8.8.8');
      expect(result).toEqual({
        countryCode: 'US',
        countryConfig: mockCountriesConfig[0]
      });
    });

    it('should handle unknown country', async () => {
      // Mock IP geolocation with unknown country
      jest.spyOn(service, 'getCountryFromIp').mockResolvedValue('XX');

      const result = await service.getLocationDetails('8.8.8.8');
      expect(result).toEqual({
        countryCode: 'XX',
        countryConfig: null
      });
    });
  });
});

// Controller Test Suite
describe('LocationController', () => {
  let controller: LocationController;
  let service: LocationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [LocationController],
      providers: [
        {
          provide: LocationsService,
          useValue: {
            getLocationDetails: jest.fn()
          }
        }
      ],
    }).compile();

    controller = module.get<LocationController>(LocationController);
    service = module.get<LocationsService>(LocationsService);
  });

  it('should detect location', async () => {
    const mockLocationDetails = {
      countryCode: 'US',
      countryConfig: mockCountriesConfig[0]
    };

    jest.spyOn(service, 'getLocationDetails').mockResolvedValue(mockLocationDetails);

    const result = await controller.detectLocation('8.8.8.8');
    expect(result).toEqual(mockLocationDetails);
    expect(service.getLocationDetails).toHaveBeenCalledWith('8.8.8.8');
  });
});