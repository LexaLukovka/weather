import { type FC, type SVGProps } from 'react';

interface WeatherIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const RainIcon: FC<WeatherIconProps> = ({
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
    <path d='M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z' fill='#78909C' />

    <g fill='#42A5F5'>
      <circle cx='8' cy='18' r='1' />
      <circle cx='12' cy='20' r='1' />
      <circle cx='16' cy='18' r='1' />
      <circle cx='10' cy='22' r='0.8' />
      <circle cx='14' cy='21' r='0.8' />
    </g>
  </svg>
);
