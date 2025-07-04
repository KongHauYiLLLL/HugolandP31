import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface TypingInterfaceProps {
  children: React.ReactNode;
  className?: string;
  beautyMode?: boolean;
}

export const TypingInterface: React.FC<TypingInterfaceProps> = ({
  children,
  className = '',
  beautyMode = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const glow = glowRef.current;
    if (!container || !glow) return;

    // Animate the yellow glow
    gsap.to(glow, {
      opacity: 0.6,
      scale: 1.1,
      duration: 2,
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true
    });

    // Beauty mode additional effects
    if (beautyMode) {
      gsap.to(container, {
        boxShadow: "0 0 30px rgba(255, 255, 0, 0.3)",
        duration: 2,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true
      });
    }
  }, [beautyMode]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Yellow glow from top-left corner */}
      <div
        ref={glowRef}
        className="absolute -top-4 -left-4 w-16 h-16 bg-yellow-400 rounded-full opacity-30 blur-xl -z-10"
        style={{ transform: 'scale(1)' }}
      />
      
      {/* Additional beauty mode effects */}
      {beautyMode && (
        <>
          <div className="absolute -top-2 -left-2 w-12 h-12 bg-yellow-300 rounded-full opacity-20 blur-lg -z-10" />
          <div className="absolute -top-6 -left-6 w-20 h-20 bg-yellow-500 rounded-full opacity-10 blur-2xl -z-10" />
        </>
      )}
      
      {children}
    </div>
  );
};