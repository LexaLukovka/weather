import { type FC, type ReactNode } from 'react';

import { Card } from '../layout';

interface WeatherDetailCardProps {
  title: string;
  children: ReactNode;
}

export const WeatherDetailCard: FC<WeatherDetailCardProps> = ({
  title,
  children,
}) => {
  return (
    <Card variant='small'>
      <div className='mb-2'>
        <p className='text-white/60 text-xs uppercase tracking-wider text-center md:text-left'>
          {title}
        </p>
      </div>
      <div className='text-center'>{children}</div>
    </Card>
  );
};
