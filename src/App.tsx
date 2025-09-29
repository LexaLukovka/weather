import { type FC } from 'react';

import { SidebarWithToggle, WeatherMain } from './components';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WeatherProvider } from './contexts/WeatherProvider';
import {
  useSidebarState,
  useWeatherTheme,
  useWeatherRetry,
  useInitialCity,
} from './hooks';
import { useWeatherStore } from './stores';

const App: FC = () => {
  const { currentWeather, error } = useWeatherStore();

  useInitialCity();
  const handleRetry = useWeatherRetry();
  const { sidebarOpen, handleToggleSidebar } = useSidebarState(150);
  const { backgroundClass, isLightTheme, textContrastClass } =
    useWeatherTheme(currentWeather);

  return (
    <ErrorBoundary>
      <div
        className={`min-h-screen ${backgroundClass} ${textContrastClass} transition-all duration-1000`}
      >
        <div className='flex flex-row h-screen'>
          <SidebarWithToggle
            isOpen={sidebarOpen}
            onToggle={handleToggleSidebar}
          />

          <WeatherProvider>
            <WeatherMain
              error={error}
              onRetry={handleRetry}
              sidebarOpen={sidebarOpen}
              isLightTheme={isLightTheme}
            />
          </WeatherProvider>
        </div>
      </div>
    </ErrorBoundary>
  );
};

App.displayName = 'App';

export default App;
