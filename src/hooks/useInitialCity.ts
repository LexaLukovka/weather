import { useEffect } from 'react';

import { useWeatherStore } from '../stores';

export const useInitialCity = () => {
  const { currentCity, searchWeather, loadingState } = useWeatherStore();

  useEffect(() => {
    if (currentCity && loadingState === 'idle') {
      searchWeather(currentCity);
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, []);
};
