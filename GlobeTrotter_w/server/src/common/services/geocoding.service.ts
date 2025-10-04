import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly apiKey = process.env.GOOGLE_MAPS_API_KEY;
  private readonly baseUrl =
    'https://maps.googleapis.com/maps/api/geocode/json';

  async geocodeAddress(address: string): Promise<GeocodingResult | null> {
    if (!this.apiKey) {
      this.logger.warn(
        'Google Maps API key not configured, skipping geocoding',
      );
      return null;
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          address: address,
          key: this.apiKey,
        },
      });

      const data = response.data;

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        this.logger.warn(
          `Geocoding failed for address "${address}": ${data.status}`,
        );
        return null;
      }

      const result = data.results[0];

      // Fallback check for result structure
      if (!result || !result.geometry || !result.geometry.location) {
        this.logger.warn(`Invalid response structure for address "${address}"`);
        return {
          latitude: 0,
          longitude: 0,
          formattedAddress: result?.formatted_address || address,
        };
      }

      const location = result.geometry.location;

      // Fallback check for location coordinates
      if (
        typeof location.lat !== 'number' ||
        typeof location.lng !== 'number'
      ) {
        this.logger.warn(
          `Invalid coordinates for address "${address}": lat=${location.lat}, lng=${location.lng}`,
        );
        return {
          latitude: 0,
          longitude: 0,
          formattedAddress: result.formatted_address || address,
        };
      }

      return {
        latitude: Math.round(location.lat * 100) / 100, // Round to 2 decimal places
        longitude: Math.round(location.lng * 100) / 100, // Round to 2 decimal places
        formattedAddress: result.formatted_address,
      };
    } catch (error) {
      this.logger.error(
        `Geocoding error for address "${address}":`,
        error.message,
      );
      return null;
    }
  }

  async reverseGeocode(
    latitude: number,
    longitude: number,
  ): Promise<string | null> {
    if (!this.apiKey) {
      this.logger.warn(
        'Google Maps API key not configured, skipping reverse geocoding',
      );
      return null;
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          latlng: `${latitude},${longitude}`,
          key: this.apiKey,
        },
      });

      const data = response.data;

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        this.logger.warn(
          `Reverse geocoding failed for coordinates ${latitude},${longitude}: ${data.status}`,
        );
        return null;
      }

      return data.results[0].formatted_address;
    } catch (error) {
      this.logger.error(
        `Reverse geocoding error for coordinates ${latitude},${longitude}:`,
        error.message,
      );
      return null;
    }
  }
}
