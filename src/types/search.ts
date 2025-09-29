import {
  type RefObject,
  type ChangeEvent,
  type KeyboardEvent,
  type FocusEvent,
} from 'react';

import { type CityOption, type SearchHistoryItem } from './weather';

export interface SearchInputProps {
  searchTerm: string;
  isLightTheme: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onSearchTermChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onFocus: (e: FocusEvent<HTMLInputElement>) => void;
  onBlur: (e: FocusEvent<HTMLInputElement>) => void;
  onLocationClick?: () => void;
}

export interface SearchDropdownProps {
  isVisible: boolean;
  loading: boolean;
  searchTerm: string;
  suggestions: CityOption[];
  searchHistory: SearchHistoryItem[];
  selectedIndex: number;
  selectedItemId: string | null;
  onCitySelect: (city: CityOption) => void;
  onHistorySelect: (historyItem: SearchHistoryItem) => void;
  onMouseEnterItem: (index: number) => void;
  dropdownRef: RefObject<HTMLDivElement | null>;
}

export interface CitySearchProps {
  isLightTheme?: boolean;
  className?: string;
}
