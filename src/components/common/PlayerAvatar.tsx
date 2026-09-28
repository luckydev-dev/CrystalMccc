import React, { useState, useEffect } from 'react';

interface PlayerAvatarProps {
  username?: string | null;
  alt?: string;
  className?: string;
  size?: number;
}

export function PlayerAvatar({ username, alt, className = 'w-full h-full object-cover', size = 64 }: PlayerAvatarProps) {
  const cleanName = (username || '').trim() || 'Steve';
  const [retryStage, setRetryStage] = useState(0);

  // Reset retry stage whenever username changes
  useEffect(() => {
    setRetryStage(0);
  }, [username]);

  const sources = [
    `https://mc-heads.net/avatar/${encodeURIComponent(cleanName)}`,
    `https://minotar.net/helm/${encodeURIComponent(cleanName)}/100.png`,
    `https://mc-heads.net/avatar/Steve`,
  ];

  const handleError = () => {
    setRetryStage((prev) => prev + 1);
  };

  // If all external sources fail, render an authentic 8x8 SVG Steve face offline
  if (retryStage >= sources.length) {
    return (
      <svg
        viewBox="0 0 8 8"
        className={className}
        style={{ imageRendering: 'pixelated' }}
        role="img"
        aria-label={alt || cleanName}
      >
        {/* Hair base */}
        <rect width="8" height="8" fill="#4a321e" />
        {/* Face skin */}
        <rect x="1" y="2" width="6" height="5" fill="#b78257" />
        {/* Hair top-sides */}
        <rect x="1" y="2" width="6" height="1" fill="#4a321e" />
        {/* Eyes white */}
        <rect x="1" y="4" width="2" height="1" fill="#ffffff" />
        <rect x="5" y="4" width="2" height="1" fill="#ffffff" />
        {/* Pupils blue */}
        <rect x="2" y="4" width="1" height="1" fill="#2b4b8a" />
        <rect x="5" y="4" width="1" height="1" fill="#2b4b8a" />
        {/* Nose */}
        <rect x="3" y="5" width="2" height="1" fill="#915934" />
        {/* Mouth/Beard */}
        <rect x="2" y="6" width="4" height="1" fill="#583119" />
      </svg>
    );
  }

  return (
    <img
      src={sources[retryStage]}
      alt={alt || `${cleanName}'s avatar`}
      className={className}
      style={{ imageRendering: 'pixelated' }}
      loading="lazy"
      onError={handleError}
    />
  );
}
