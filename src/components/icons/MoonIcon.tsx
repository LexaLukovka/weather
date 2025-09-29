import { type FC, type SVGProps } from 'react';

interface WeatherIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const MoonIcon: FC<WeatherIconProps> = ({
  size = 24,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    className={className}
    {...props}
  >
    <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' fill='#FFD54F' />
  </svg>
);
