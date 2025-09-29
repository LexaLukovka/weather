import { type FC, type SVGProps } from 'react';

interface WeatherIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const FogIcon: FC<WeatherIconProps> = ({
  size = 24,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
    {...props}
  >
    <path
      d='M3 15h18M3 12h18m-9-3h9M3 18h18'
      stroke='#9CA3AF'
      strokeWidth='2.5'
    />
    <path d='M3 9h6' stroke='#D1D5DB' strokeWidth='2' />
  </svg>
);
