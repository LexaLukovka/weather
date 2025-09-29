import { type FC, type SVGProps } from 'react';

interface WeatherIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const SnowIcon: FC<WeatherIconProps> = ({
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
      d='M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z'
      fill='#E2E8F0'
      stroke='#94A3B8'
    />
    <path
      d='M12 17v4m-2-1l4-2m0-2l-4-2m2-1v4'
      stroke='#E5E7EB'
      strokeWidth='2'
    />
    <circle cx='8' cy='19' r='1' fill='white' />
    <circle cx='16' cy='19' r='1' fill='white' />
    <circle cx='12' cy='21' r='1' fill='white' />
    <circle cx='10' cy='17' r='0.5' fill='white' />
    <circle cx='14' cy='17' r='0.5' fill='white' />
  </svg>
);
