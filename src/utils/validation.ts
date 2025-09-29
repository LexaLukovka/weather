import { z } from 'zod';

import { type ForecastApiResponse } from '../types';

export const ForecastApiResponseSchema = z.object({
  location: z.object({
    name: z.string(),
    country: z.string(),
    localtime: z.string(),
  }),
  current: z.object({
    temp_c: z.number(),
    condition: z.object({
      text: z.string(),
      icon: z.string(),
      code: z.number().optional(),
    }),
    wind_kph: z.number(),
    humidity: z.number(),
    feelslike_c: z.number(),
    last_updated_epoch: z.number(),
  }),
  forecast: z.object({
    forecastday: z.array(
      z.object({
        date: z.string(),
        day: z.object({
          maxtemp_c: z.number(),
          mintemp_c: z.number(),
          condition: z.object({
            text: z.string(),
            icon: z.string(),
            code: z.number().optional(),
          }),
          uv: z.number(),
          avgvis_km: z.number(),
          totalprecip_mm: z.number(),
        }),
        astro: z.object({
          sunrise: z.string(),
          sunset: z.string(),
          moon_phase: z.string(),
          moon_illumination: z.union([z.string(), z.number()]),
        }),
        hour: z.array(
          z.object({
            time: z.string(),
            time_epoch: z.number(),
            temp_c: z.number(),
            condition: z.object({
              text: z.string(),
              icon: z.string(),
              code: z.number().optional(),
            }),
            pressure_mb: z.number(),
            gust_kph: z.number(),
          })
        ),
      })
    ),
  }),
});

/**
 * Validates WeatherAPI response data against expected schema using Zod
 * @param data - Raw API response data (unknown type for safety)
 * @returns Validated and typed ForecastApiResponse object
 * @throws {Error} Throws descriptive error if validation fails
 */
export function validateApiResponse(data: ForecastApiResponse): ForecastApiResponse {
  try {
    ForecastApiResponseSchema.parse(data);
    return data;
  } catch (error) {
    if (error instanceof z.ZodError) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('API Response validation failed:', error.issues);
      }
      throw new Error(
        `Invalid API response format: ${error.issues
          .map(e => e.message)
          .join(', ')}`
      );
    }
    throw error;
  }
}
export function validateEnvironment(): void {
  if (import.meta.env.PROD && !import.meta.env.VITE_BASE_URL) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(
        'VITE_BASE_URL is not set in production environment. This may cause API calls to fail.'
      );
    }
  }
}
