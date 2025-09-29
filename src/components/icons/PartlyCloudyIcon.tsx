import { type FC, type SVGProps } from 'react';

interface WeatherIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const PartlyCloudyIcon: FC<WeatherIconProps> = ({
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
    <circle cx='8' cy='8' r='3.5' fill='#FFB300' />
    <g stroke='#FFA000' strokeWidth='1.5' strokeLinecap='round'>
      <path d='M8 1v2' />
      <path d='M13 3l-1 1' />
      <path d='M15 8h-2' />
      <path d='M13 13l-1-1' />
      <path d='M3 8h2' />
      <path d='M3 3l1 1' />
    </g>
    <path d='M18 13h-1.26A8 8 0 1 0 9 23h9a5 5 0 0 0 0-10z' fill='#64B5F6' />
  </svg>
);
