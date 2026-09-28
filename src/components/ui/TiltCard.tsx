import React, { useRef, useState } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

export function TiltCard({ children, className = '' }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ rotateX: 0, rotateY: 0, shadowX: 0, shadowY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Center coordinates
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    // Calculate rotation angles (max tilt degree of 12)
    const rotateY = (mouseX / (width / 2)) * 12;
    const rotateX = -(mouseY / (height / 2)) * 12;

    // Move subtle glow projection to coordinates
    const shadowY = (mouseY / (height / 2)) * 10;
    const shadowX = (mouseX / (width / 2)) * 10;

    setCoords({ rotateX, rotateY, shadowX, shadowY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ rotateX: 0, rotateY: 0, shadowX: 0, shadowY: 0 });
  };

  const style = {
    transform: isHovered
      ? `perspective(1000px) rotateX(${coords.rotateX}deg) rotateY(${coords.rotateY}deg) scale(1.025)`
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
    transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
    boxShadow: isHovered
      ? `${-coords.shadowX}px ${-coords.shadowY}px 25px -5px rgba(99, 102, 241, 0.15), 0 10px 15px -3px rgba(0, 0, 0, 0.3)`
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1.5px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={`relative will-change-transform cursor-pointer overflow-hidden rounded-2xl ${className}`}
    >
      {/* Glare effect inside the card */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none z-50 transition-opacity bg-radial from-white/10 to-transparent mix-blend-overlay"
          style={{
            transform: `translate(${coords.shadowX * 2}px, ${coords.shadowY * 2}px)`,
          }}
        />
      )}
      {children}
    </div>
  );
}
