import { type FC } from 'react';

import { SidebarWithToggle, WeatherMain, ErrorBoundary } from './components';
import { UI_CONSTANTS } from './constants';
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
  const { sidebarOpen, handleToggleSidebar } = useSidebarState(
    UI_CONSTANTS.SIDEBAR_DEBOUNCE_DELAY
  );
  const { backgroundClass, isLightTheme, textContrastClass } =
    useWeatherTheme(currentWeather);

  return (
    <ErrorBoundary>
      <div
        className={`min-h-screen ${backgroundClass} ${textContrastClass} transition-all`}
        style={{
          transitionDuration: `${UI_CONSTANTS.THEME_TRANSITION_DURATION}ms`,
        }}
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
