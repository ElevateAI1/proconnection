
import React from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface ScrollAnimationWrapperProps {
  children: React.ReactNode;
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'fade-scale';
  delay?: number;
  className?: string;
}

export const ScrollAnimationWrapper: React.FC<ScrollAnimationWrapperProps> = ({
  children,
  animation = 'fade-up',
  delay = 0,
  className = ''
}) => {
  const { ref, isVisible } = useScrollAnimation();

  const getAnimationClass = () => {
    switch (animation) {
      case 'fade-left':
        return 'fade-element-left';
      case 'fade-right':
        return 'fade-element-right';
      case 'fade-scale':
        return 'fade-element-scale';
      default:
        return 'fade-element';
    }
  };

  return (
    <div
      ref={ref}
      className={`${getAnimationClass()} ${isVisible ? 'visible' : ''} ${className}`}
      style={{
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};
