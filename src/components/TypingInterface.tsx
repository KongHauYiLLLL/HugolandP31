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
  const beautyGlow1Ref = useRef<HTMLDivElement>(null);
  const beautyGlow2Ref = useRef<HTMLDivElement>(null);
  const beautyGlow3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const glow = glowRef.current;
    const beautyGlow1 = beautyGlow1Ref.current;
    const beautyGlow2 = beautyGlow2Ref.current;
    const beautyGlow3 = beautyGlow3Ref.current;
    
    if (!container || !glow) return;

    // Animate the main yellow glow
    gsap.to(glow, {
      opacity: 0.6,
      scale: 1.1,
      duration: 2,
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true
    });

    // Beauty mode additional effects
    if (beautyMode && beautyGlow1 && beautyGlow2 && beautyGlow3) {
      // Floating orbs animation
      gsap.to(beautyGlow1, {
        x: 20,
        y: -15,
        opacity: 0.8,
        scale: 1.2,
        duration: 3,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true
      });

      gsap.to(beautyGlow2, {
        x: -15,
        y: 20,
        opacity: 0.6,
        scale: 0.8,
        duration: 4,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1
      });

      gsap.to(beautyGlow3, {
        x: 10,
        y: -25,
        opacity: 0.7,
        scale: 1.1,
        duration: 2.5,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
        delay: 0.5
      });

      // Container glow effect
      gsap.to(container, {
        boxShadow: "0 0 40px rgba(255, 255, 0, 0.4), 0 0 80px rgba(138, 43, 226, 0.3), 0 0 120px rgba(75, 0, 130, 0.2)",
        duration: 3,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true
      });
    }
  }, [beautyMode]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Main yellow glow from top-left corner */}
      <div
        ref={glowRef}
        className="absolute -top-4 -left-4 w-16 h-16 bg-yellow-400 rounded-full opacity-30 blur-xl -z-10"
        style={{ transform: 'scale(1)' }}
      />
      
      {/* Beauty mode additional effects */}
      {beautyMode && (
        <>
          {/* Primary beauty glow */}
          <div
            ref={beautyGlow1Ref}
            className="absolute -top-2 -left-2 w-12 h-12 bg-yellow-300 rounded-full opacity-20 blur-lg -z-10"
          />
          <div
            ref={beautyGlow2Ref}
            className="absolute -top-6 -left-6 w-20 h-20 bg-yellow-500 rounded-full opacity-10 blur-2xl -z-10"
          />
          
          {/* Additional floating orbs */}
          <div
            ref={beautyGlow3Ref}
            className="absolute -top-8 -right-8 w-14 h-14 bg-purple-400 rounded-full opacity-15 blur-xl -z-10"
          />
          
          {/* Corner accents */}
          <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-indigo-400 rounded-full opacity-20 blur-lg -z-10 animate-pulse" />
          <div className="absolute -bottom-2 -left-8 w-8 h-8 bg-pink-400 rounded-full opacity-15 blur-md -z-10 animate-pulse" style={{ animationDelay: '1s' }} />
          
          {/* Sparkle effects */}
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white rounded-full opacity-60 animate-ping -z-10" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-cyan-300 rounded-full opacity-80 animate-ping -z-10" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-yellow-300 rounded-full opacity-70 animate-ping -z-10" style={{ animationDelay: '2s' }} />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-yellow-500/5 rounded-lg -z-10" />
        </>
      )}
      
      {children}
    </div>
  );
};