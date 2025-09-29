import { type FC, type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'small' | 'medium' | 'large';
  animate?: boolean;
}

export const Card: FC<CardProps> = ({
  children,
  className = '',
  variant = 'medium',
  animate = false,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'small':
        return 'rounded-2xl p-3 md:p-4';
      case 'medium':
        return 'rounded-2xl p-4 md:p-6';
      case 'large':
        return 'rounded-3xl p-6 md:p-8';
      default:
        return 'rounded-2xl p-4 md:p-6';
    }
  };

  const animateClass = animate ? 'animate-slide-in' : '';

  return (
    <div
      className={`glass-morphism ${getVariantClasses()} ${animateClass} ${className}`}
    >
      {children}
    </div>
  );
};
