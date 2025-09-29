# Weather App

A modern, responsive weather application built with React, TypeScript, Tailwind CSS v4, and shadcn/ui. Get comprehensive weather information including 7-day forecasts, hourly data, and location services with an elegant, adaptive interface.

## Features

### Core Functionality

- **Advanced Weather Search**: Search for weather by city name with smart dropdown suggestions
- **Location Services**: Get weather for your current location automatically
- **Comprehensive Weather Data**:
  - Current temperature and "feels like" temperature
  - Weather description with dynamic weather icons
  - Daily temperature range (min/max)
  - Wind speed and wind gusts
  - Humidity, pressure, and UV index
  - Visibility and precipitation levels
  - Sunrise/sunset times and moon phase
- **7-Day Forecast**: Extended daily weather forecast with detailed conditions
- **24-Hour Forecast**: Hourly weather data with temperature trends
- **Smart Search History**: Track recent weather searches with timestamps
- **Interactive History**: Click on history items to quickly re-search
- **History Management**: Remove individual items or clear all history
- **Undo Actions**: Undo accidental deletions with toast notifications

### UI/UX Features

- **Dynamic Weather Themes**: Background and theme adapt to current weather conditions
- **Time-Based Themes**: Different visual themes for day/night conditions
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Collapsible Sidebar**: Toggle search history sidebar for focused viewing
- **Smooth Transitions**: Elegant animations and state transitions
- **Weather Icons**: Custom SVG icons for all weather conditions
- **Loading States**: Smooth loading animations and skeleton screens

### Technical Features

- **Real-time Updates**: Live weather data from WeatherAPI
- **Type Safety**: Full TypeScript implementation with strict mode
- **Comprehensive Testing**: 80+% of coverage and 49+ test files covering all components
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Persistent Storage**: Local storage for search history and preferences
- **Error Handling**: Robust error handling with user-friendly messages
- **Location Permissions**: Graceful handling of location access

## Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **WeatherAPI Key** (free) - [Sign up here](https://www.weatherapi.com/signup.aspx)

### Installation

Follow these steps to run the application on your local machine:

1. **Clone the repository**

   ```bash
   git clone https://github.com/LexaLukovka/weather.git
   cd weather
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**

   Copy the example environment file and add your API key:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and replace `your_api_key_here` with your actual WeatherAPI key:

   ```env
   VITE_WEATHERAPI_KEY=your_actual_api_key_here
   VITE_BASE_URL=https://api.weatherapi.com/v1
   ```

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open the application**

   Navigate to [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

To create an optimized production build:

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist/` directory. You can serve them with:

```bash
npm run preview
# or
yarn preview
```

### Environment Variables

| Variable              | Required | Description         | Default                         |
| --------------------- | -------- | ------------------- | ------------------------------- |
| `VITE_WEATHERAPI_KEY` | Yes      | Your WeatherAPI key | -                               |
| `VITE_BASE_URL`       | Yes      | WeatherAPI base URL | `https://api.weatherapi.com/v1` |

### Getting a WeatherAPI Key

1. Go to [WeatherAPI Signup](https://www.weatherapi.com/signup.aspx)
2. Create a free account
3. Copy your API key from the dashboard
4. Add it to your `.env` file

The free tier includes:

- 1,000,000 calls/month
- Real-time weather
- 14-day forecast
- Search/Autocomplete API
- Astronomy data
- Time zone API

## Available Scripts

| Script                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Start development server with hot reload |
| `npm run build`         | Build for production                     |
| `npm run preview`       | Preview production build locally         |
| `npm run test`          | Run all tests in watch mode              |
| `npm run test:ui`       | Run tests with interactive UI            |
| `npm run test:coverage` | Generate test coverage report            |
| `npm run lint`          | Lint code with ESLint                    |
| `npm run format`        | Format code with Prettier                |
| `npm run typecheck`     | Check TypeScript types                   |

## Architecture

> **For detailed technical information**, see [TECHNICAL.md](./TECHNICAL.md) - comprehensive architecture documentation, design patterns, and implementation details.

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── weather/        # Weather display components
│   ├── search/         # Search and city selection
│   ├── layout/         # Layout and sidebar components
│   ├── icons/          # Custom weather SVG icons
│   └── __tests__/      # Component tests
├── hooks/              # Custom React hooks (14 hooks)
├── services/           # API services and external integrations
├── stores/             # Zustand state management
├── contexts/           # React contexts for weather data
├── types/              # TypeScript type definitions
├── constants/          # API configuration and constants
├── utils/              # Utility and helper functions
└── lib/                # Third-party library configurations
```

### Design Principles

#### Clean Architecture

- **Separation of Concerns**: Each layer has a single responsibility
- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Interface Segregation**: Small, focused interfaces
- **Single Responsibility**: Each class/function has one reason to change

#### SOLID Principles Implementation

1. **Single Responsibility Principle**
   - `WeatherApiService`: Only handles API communication
   - `WeatherStore`: Only manages weather state
   - Components: Only handle UI rendering and user interaction

2. **Open/Closed Principle**
   - Service layer is open for extension (can add new weather providers)
   - Closed for modification (existing API doesn't change)

3. **Liskov Substitution Principle**
   - `MockWeatherApiService` can replace `WeatherApiService` without breaking functionality
   - All weather data follows the same `WeatherData` interface

4. **Interface Segregation Principle**
   - Separate interfaces for different concerns (`WeatherData`, `SearchHistoryItem`, `WeatherError`)
   - Components only depend on the interfaces they need

5. **Dependency Inversion Principle**
   - Components depend on abstractions (store interfaces) not implementations
   - Services depend on interfaces, not concrete implementations

### Key Technologies

- **React 19**: Latest React with hooks, concurrent features, and improved performance
- **TypeScript 5.8**: Strict type safety with latest language features
- **Tailwind CSS v4**: Next-generation utility-first CSS framework
- **shadcn/ui**: Headless, accessible UI component library
- **Zustand**: Lightweight state management with persistence
- **Axios**: HTTP client for API requests with interceptors
- **Vitest**: Fast unit testing with native ESM support
- **Vite 7**: Lightning-fast build tool with HMR
- **WeatherAPI**: Professional weather data service

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (development)
npm test
```

## Troubleshooting

### Common Issues

#### API Key Issues

- **Error: "Invalid API key"** - Make sure your API key is correctly set in `.env`
- **Error: "Rate limit exceeded"** - Free tier limit reached, wait or upgrade plan

#### Build Issues

- **Module not found** - Run `npm install` to ensure all dependencies are installed
- **Port already in use** - Change port in `vite.config.ts` or kill process on port 5173

#### Environment Variables

- **Variables not loading** - Ensure `.env` file is in project root
- **Changes not reflecting** - Restart the dev server after changing `.env`

### Testing Strategy

This project follows **Test-Driven Development (TDD)** principles:

1. **Red**: Write failing tests first
2. **Green**: Write minimal code to pass tests
3. **Refactor**: Improve code while keeping tests green

#### Test Coverage

- **Unit Tests**: Individual functions and components
- **Integration Tests**: Component interactions and state management
- **Service Tests**: API layer and error handling
- **Store Tests**: State management logic

#### Current Coverage

**49+ test files** providing comprehensive coverage:

- **Component Tests**: All major UI components tested
- **Hook Tests**: Custom React hooks with edge cases
- **Service Tests**: API layer and error handling
- **Store Tests**: State management and persistence
- **Integration Tests**: Component interactions

### Test Files Structure

```
src/
├── components/
│   ├── ui/__tests__/           # UI component tests
│   ├── weather/__tests__/      # Weather component tests
│   ├── search/__tests__/       # Search component tests
│   └── layout/__tests__/       # Layout component tests
├── hooks/__tests__/            # Custom hook tests
├── services/__tests__/         # API service tests
├── stores/__tests__/           # State management tests
└── __tests__/                  # App-level tests
```

## Usage Guide

### Basic Usage

1. **Get Current Location Weather**
   - Allow location access when prompted
   - Automatically get weather for your current location
   - Location-based weather appears with a location indicator

2. **Search for Weather**
   - Type in the search box to see city suggestions
   - Click on a suggested city or press Enter
   - View comprehensive weather data including forecasts

3. **Explore Weather Details**
   - View current conditions with feels-like temperature
   - Check 24-hour hourly forecast
   - Browse 7-day daily forecast
   - See detailed metrics (UV, pressure, wind, etc.)

4. **Manage Search History**
   - Toggle sidebar to view recent searches
   - Click any history item to quickly re-search
   - Remove individual items or clear all history
   - Undo accidental deletions with toast notifications

### Advanced Features

#### Error Handling

- **City Not Found**: Clear error message with retry option
- **Network Issues**: Automatic error detection and user guidance
- **Rate Limiting**: Graceful handling of API limits

#### Accessibility

- **Keyboard Navigation**: Full app usable with keyboard only
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators and logical tab order

## Configuration

### Environment Variables

For production deployment with real weather data:

```env
# WeatherAPI Configuration (recommended)
VITE_WEATHER_API_KEY=your_weatherapi_key
VITE_WEATHER_API_URL=https://api.weatherapi.com/v1

# Development proxy (for CORS handling)
VITE_USE_PROXY=true
```

### API Setup

1. **Get WeatherAPI Key**
   - Visit [WeatherAPI](https://www.weatherapi.com/)
   - Create a free account (1,000 requests/day)
   - Get your API key from the dashboard

2. **Configure Environment**

   ```typescript
   // src/constants/api.ts
   export const API_CONFIG = {
     BASE_URL: process.env.VITE_WEATHER_API_URL || '/api/v1',
     API_KEY: process.env.VITE_WEATHER_API_KEY || 'your_api_key_here',
   };
   ```

3. **Production Deployment**
   - Set environment variables in your hosting platform
   - Update API_CONFIG.BASE_URL to use direct API URLs
   - Ensure CORS is properly configured

## Scripts

```bash
# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build

# Testing
npm run test          # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:ui       # Run tests with Vitest UI

# Code Quality
npm run lint          # Run ESLint with auto-fix
npm run lint:check    # Check linting without fixes
npm run format        # Format code with Prettier
npm run format:check  # Check formatting without changes
npm run typecheck     # Run TypeScript compiler checks
```

## Documentation

- **[TECHNICAL.md](./TECHNICAL.md)** - Detailed technical architecture, design patterns, and implementation guides
- **[Component Documentation](./src/components/)** - Individual component documentation with usage examples
- **[Hook Documentation](./src/hooks/)** - Custom React hooks with implementation details
- **[API Documentation](./src/services/)** - Service layer and API integration documentation

## Contributing

### Development Workflow

1. **Make your changes**
2. **Run tests**
   ```bash
   npm test -- --run
   npm run lint
   ```
3. **Build to verify**
   ```bash
   npm run build
   ```

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Enforced code style
- **Test Coverage**: Maintain >90% coverage
- **Clean Architecture**: Follow SOLID principles

## Troubleshooting

### Common Issues

#### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Test Failures

```bash
# Run tests in verbose mode
npm test -- --reporter=verbose
```

## Demo & Live Features

The app uses **WeatherAPI** for real-time weather data, providing:

- **Live Weather Data**: Current conditions from global weather stations
- **7-Day Forecasts**: Extended weather predictions
- **Hourly Data**: 24-hour detailed forecasts
- **Location Services**: GPS-based weather detection
- **Global Coverage**: Weather data for cities worldwide

**Try these features:**

- Search for any city name (e.g., "London", "Tokyo", "New York")
- Allow location access for automatic weather detection
- Explore detailed forecasts and weather metrics
- Test error handling with invalid city names

## Acknowledgments

- **shadcn/ui**: Beautiful, accessible component library
- **Tailwind CSS v4**: Next-generation utility-first CSS framework
- **Zustand**: Lightweight and powerful state management
- **Vitest**: Fast and modern testing framework
- **WeatherAPI**: Reliable weather data service
- **React 19**: Latest React with improved performance
- **Vite**: Lightning-fast build tool and development server

---
