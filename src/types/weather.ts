export interface WeatherCondition {
  text: string;
  icon: string;
}

interface WeatherConditionWithCode extends WeatherCondition {
  code: number;
}

export interface LocationInfo {
  city: string;
  country: string;
}

export interface HourlyForecastItem {
  time: string;
  temp_c: number;
  condition: WeatherCondition;
}

export interface DailyForecastItem {
  date: string;
  day: string;
  maxTemp: number;
  minTemp: number;
  condition: WeatherCondition;
}

export interface WeatherData extends LocationInfo {
  id: string;
  temperature: number;
  description: string;
  minTemperature: number;
  maxTemperature: number;
  windSpeed: number;
  humidity: number;
  icon: string;
  timestamp: number;
  localtime?: string;
  isCurrentLocation?: boolean;
  sunrise?: string;
  sunset?: string;
  uv?: number;
  visibility?: number;
  pressure?: number;
  feelsLike?: number;
  moonPhase?: string;
  moonIllumination?: number;
  precipitation?: number;
  windGust?: number;
  hourlyForecast?: HourlyForecastItem[];
  dailyForecast?: DailyForecastItem[];
}

export interface ApiLocation {
  name: string;
  country: string;
  localtime: string;
}

export interface ApiCurrent {
  last_updated_epoch: number;
  temp_c: number;
  condition: WeatherConditionWithCode;
  wind_kph: number;
  humidity: number;
  feelslike_c: number;
}

export interface ApiAstro {
  sunrise: string;
  sunset: string;
  moon_phase: string;
  moon_illumination: number;
}

export interface ApiHourlyForecast {
  time_epoch: number;
  time: string;
  temp_c: number;
  condition: WeatherConditionWithCode;
  pressure_mb: number;
  gust_kph: number;
}

export interface ApiForecastDay {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    totalprecip_mm: number;
    avgvis_km: number;
    condition: WeatherConditionWithCode;
    uv: number;
  };
  astro: ApiAstro;
  hour: ApiHourlyForecast[];
}

export interface ForecastApiResponse {
  location: ApiLocation;
  current: ApiCurrent;
  forecast: {
    forecastday: ApiForecastDay[];
  };
}

export interface CityOption {
  name: string;
  country: string;
  countryCode: string;
  state?: string;
  lat?: number;
  lng?: number;
}

export interface SearchHistoryItem extends LocationInfo {
  id: string;
  searchedAt: number;
  isRemoved?: boolean;
}

export interface WeatherError {
  message: string;
  code?: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
