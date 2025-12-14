import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface SosButtonProps {
  onTrigger: () => void;
  className?: string;
  large?: boolean;
}

export const SosButton: React.FC<SosButtonProps> = ({ onTrigger, className = '', large = false }) => {
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  
  const DURATION = 3000; // 3 seconds

  const startPress = () => {
    setPressing(true);
    const startTime = Date.now();
    
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(100, (elapsed / DURATION) * 100);
      setProgress(p);

      if (elapsed >= DURATION) {
        completePress();
      }
    }, 50);
  };

  const endPress = () => {
    setPressing(false);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const completePress = () => {
    endPress();
    onTrigger();
    // Haptic feedback if available
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <button
      className={`relative overflow-hidden flex flex-col items-center justify-center transition-all select-none touch-none ${
        large 
          ? 'w-48 h-48 rounded-full bg-red-600 text-white shadow-xl' 
          : 'w-12 h-12 rounded-full bg-red-600 text-white shadow-md'
      } ${pressing ? 'scale-95' : ''} ${className}`}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
    >
      {/* Background fill animation */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-red-800 transition-none"
        style={{ height: `${progress}%`, opacity: 0.5 }}
      />
      
      {pressing && (
        <div className="absolute inset-0 rounded-full border-4 border-white animate-pulse-ring"></div>
      )}

      <AlertTriangle size={large ? 64 : 24} className="z-10 relative mb-1" />
      {large && <span className="z-10 relative font-bold text-xl tracking-wider">S.O.S</span>}
      {large && pressing && <span className="z-10 relative text-xs mt-2 font-mono">Maintenir 3s</span>}
    </button>
  );
};