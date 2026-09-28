import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import musicFile from '../../assets/images/clip_h8UpC5JbMU0_0-111_29abdcbe.mp3';

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const fadeIntervalRef = useRef<number | null>(null);

  // Smoothly fade in volume to target (0.02 / 2% - low as possible)
  const fadeIn = (audio: HTMLAudioElement, targetVolume = 0.02, durationMs = 2500) => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }
    audio.volume = 0.002;
    const stepInterval = 50;
    const totalSteps = durationMs / stepInterval;
    const volumeStep = targetVolume / totalSteps;

    fadeIntervalRef.current = window.setInterval(() => {
      if (!audioRef.current) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        return;
      }
      const nextVol = Math.min(targetVolume, audio.volume + volumeStep);
      audio.volume = nextVol;
      if (nextVol >= targetVolume) {
        audio.volume = targetVolume;
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      }
    }, stepInterval);
  };

  useEffect(() => {
    const audio = new Audio(musicFile);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    let hasStarted = false;

    // Start playing after 5 seconds
    const startTimer = setTimeout(() => {
      if (hasStarted) return;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            hasStarted = true;
            setIsPlaying(true);
            fadeIn(audio, 0.02, 2500); // 2% volume with gentle 2.5s fade-in
          })
          .catch((err) => {
            // Autoplay policy prevented playback until user interacts with the page
            console.log('[BackgroundMusic] Autoplay postponed pending user gesture:', err.message);
            
            const handleFirstGesture = () => {
              if (hasStarted) return;
              audio.play().then(() => {
                hasStarted = true;
                setIsPlaying(true);
                fadeIn(audio, 0.02, 2000);
              }).catch(() => {});

              window.removeEventListener('click', handleFirstGesture);
              window.removeEventListener('keydown', handleFirstGesture);
              window.removeEventListener('touchstart', handleFirstGesture);
            };

            window.addEventListener('click', handleFirstGesture, { once: true });
            window.addEventListener('keydown', handleFirstGesture, { once: true });
            window.addEventListener('touchstart', handleFirstGesture, { once: true });
          });
      }
    }, 5000);

    return () => {
      clearTimeout(startTimer);
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
    
    // If not playing yet, clicking the button starts it
    if (!isPlaying) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        fadeIn(audioRef.current!, 0.02, 1500);
      }).catch(() => {});
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <button
        onClick={toggleMute}
        title={isMuted ? 'Unmute Background Music' : 'Mute Background Music (2% Vol)'}
        aria-label="Toggle background music"
        className="group relative flex items-center gap-2 px-3 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800/95 border border-slate-700/80 hover:border-purple-500/50 backdrop-blur-md shadow-lg shadow-black/50 text-slate-300 hover:text-white transition-all duration-300 cursor-pointer text-xs"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Volume2 className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
            )}
          </div>
        )}
        <span className="hidden sm:inline font-medium text-[11px] text-slate-400 group-hover:text-slate-200">
          {isMuted ? 'BGM Muted' : 'Crystal BGM'}
        </span>
      </button>
    </div>
  );
}
