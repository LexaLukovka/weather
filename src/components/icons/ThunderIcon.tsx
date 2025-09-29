import { type FC, type SVGProps } from 'react';

interface WeatherIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const ThunderIcon: FC<WeatherIconProps> = ({
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
      fill='#6B7280'
      stroke='#4B5563'
    />
    <path
      d='M13 11l-4 6h4l-2 4 4-6h-4l2-4z'
      fill='#FDE047'
      stroke='#EAB308'
      strokeWidth='1.5'
    />
  </svg>
);
