import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface EnhancedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  beautyMode?: boolean;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  variant = 'primary',
  size = 'md',
  beautyMode = false
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    const glow = glowRef.current;
    if (!button || !glow) return;

    const handleMouseEnter = () => {
      if (disabled) return;
      
      gsap.to(button, {
        scale: 1.05,
        duration: 0.2,
        ease: "power2.out"
      });

      if (beautyMode) {
        gsap.to(glow, {
          opacity: 0.8,
          scale: 1.2,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    };

    const handleMouseLeave = () => {
      if (disabled) return;
      
      gsap.to(button, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out"
      });

      if (beautyMode) {
        gsap.to(glow, {
          opacity: 0.3,
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    };

    const handleMouseDown = () => {
      if (disabled) return;
      
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        ease: "power2.out"
      });
    };

    const handleMouseUp = () => {
      if (disabled) return;
      
      gsap.to(button, {
        scale: 1.05,
        duration: 0.1,
        ease: "power2.out"
      });
    };

    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);
    button.addEventListener('mousedown', handleMouseDown);
    button.addEventListener('mouseup', handleMouseUp);

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
      button.removeEventListener('mousedown', handleMouseDown);
      button.removeEventListener('mouseup', handleMouseUp);
    };
  }, [disabled, beautyMode]);

  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white',
      secondary: 'bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white',
      danger: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white',
      success: 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white',
      warning: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white'
    };
    return variants[variant];
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };
    return sizes[size];
  };

  const getGlowColor = () => {
    const glowColors = {
      primary: 'bg-purple-500',
      secondary: 'bg-gray-500',
      danger: 'bg-red-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500'
    };
    return glowColors[variant];
  };

  return (
    <div className="relative inline-block">
      {/* Glow effect for beauty mode */}
      {beautyMode && (
        <div
          ref={glowRef}
          className={`absolute inset-0 ${getGlowColor()} rounded-lg blur-lg opacity-30 -z-10`}
          style={{ transform: 'scale(1)' }}
        />
      )}
      
      {/* Typing interface glow */}
      <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-400 rounded-full opacity-20 blur-md -z-20" />
      
      <button
        ref={buttonRef}
        onClick={onClick}
        disabled={disabled}
        className={`
          relative font-semibold rounded-lg transition-all duration-200 
          ${getVariantClasses()} 
          ${getSizeClasses()}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${beautyMode ? 'shadow-2xl border border-white/20' : 'shadow-lg'}
          ${className}
        `}
      >
        {children}
      </button>
    </div>
  );
};