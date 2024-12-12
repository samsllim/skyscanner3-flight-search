import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import * as path from 'path';
import { lastValueFrom } from 'rxjs';

// Interface for the country configuration
export interface CountryConfig {
  country: string;
  market: string;
  locale: string;
  currencyTitle: string;
  currency: string;
  currencySymbol: string;
  site: string;
}

@Injectable()
export class LocationsService {
  private countriesConfig: CountryConfig[];

  constructor(private readonly httpService: HttpService) {
    // Load countries configuration from JSON file on service initialization
    this.loadCountriesConfig();
  }

  /**
   * Load countries configuration from local JSON file
   */
  private loadCountriesConfig() {
    try {
      const configPath = path.join(process.cwd(), 'src', 'data', 'countries-config.json');
      const rawData = fs.readFileSync(configPath, 'utf8');
      const parsedData = JSON.parse(rawData);
      this.countriesConfig = parsedData.data;
    } catch (error) {
      console.error('Error loading countries configuration:', error);
      this.countriesConfig = [];
    }
  }

  /**
   * Get IP geolocation using ipapi.co (free IP geolocation service)
   * @param ipAddress IP address to geolocate
   * @returns Country code (2-letter)
   */
  async getCountryFromIp(ipAddress?: string): Promise<string | null> {
    try {
      // If local or no IP provided, use a request to ipapi.co to get client IP
      const url = (ipAddress === '::1' || ipAddress === '127.0.0.1' || !ipAddress) 
        ? 'https://ipapi.co/json/' : `https://ipapi.co/${ipAddress}/json/`;

      const response = await lastValueFrom(
        this.httpService.get(url)
      );

      return response.data.country_code || null;
    } catch (error) {
      console.error('Error fetching IP geolocation:', error);
      return null;
    }
  }

  /**
   * Find country configuration by country code or name
   * @param identifier Country code (market) or full country name
   * @returns Country configuration
   */
  findCountryConfig(identifier: string): CountryConfig | null {
    if (!identifier) return null;

    // Normalize the identifier for case-insensitive search
    const normalizedId = identifier.trim().toLowerCase();

    return this.countriesConfig.find(
      config => 
        config.market.toLowerCase() === normalizedId || 
        config.country.toLowerCase() === normalizedId
    ) || null;
  }

  /**
   * Get full location details by IP address
   * @param ipAddress Optional IP address
   * @returns Location details including country configuration
   */
  async getLocationDetails(ipAddress?: string): Promise<{
    countryCode: string | null, 
    countryConfig: CountryConfig | null
  }> {
    // Get country code from IP
    const countryCode = await this.getCountryFromIp(ipAddress);
    
    // Find corresponding country configuration
    const countryConfig = countryCode 
      ? this.findCountryConfig(countryCode) 
      : null;

    return {
      countryCode,
      countryConfig
    };
  }

  /**
   * List all available countries
   * @returns Array of country configurations
   */
  listAllCountries(): CountryConfig[] {
    return this.countriesConfig;
  }
}