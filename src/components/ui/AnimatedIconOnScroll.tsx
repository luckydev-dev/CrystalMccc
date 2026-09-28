import React, { useEffect, useRef } from 'react';

interface AnimatedIconOnScrollProps {
  icon: any;
  className?: string;
  size?: number;
}

export function AnimatedIconOnScroll({ icon: Icon, className, size }: AnimatedIconOnScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<any>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Play the animation once when the icon scrolls into view
          iconRef.current?.startAnimation?.();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => {
        iconRef.current?.startAnimation?.();
      }}
      onMouseLeave={() => {
        iconRef.current?.stopAnimation?.();
      }}
      className={`animated-icon-container flex items-center justify-center ${className || ''} [&>div]:flex [&>div]:items-center [&>div]:justify-center [&_svg]:w-full [&_svg]:h-full`}
    >
      <Icon ref={iconRef} className={className} size={size} />
    </div>
  );
}


