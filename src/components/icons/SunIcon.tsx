import { type FC, type SVGProps } from 'react';

interface WeatherIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const SunIcon: FC<WeatherIconProps> = ({
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
    <g stroke='#FFA000' strokeWidth='2' strokeLinecap='round'>
      <path d='M12 1v3' />
      <path d='M12 20v3' />
      <path d='M23 12h-3' />
      <path d='M1 12h3' />
      <path d='M19.78 4.22l-2.12 2.12' />
      <path d='M6.34 17.66l-2.12 2.12' />
      <path d='M19.78 19.78l-2.12-2.12' />
      <path d='M6.34 6.34l-2.12-2.12' />
    </g>
    <circle cx='12' cy='12' r='5' fill='#FFB300' />
  </svg>
);
