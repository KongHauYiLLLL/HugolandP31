import React from 'react';

interface GridOverlayProps {
  snapToGrid: boolean;
  gridSize?: number;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({ 
  snapToGrid, 
  gridSize = 20 
}) => {
  if (!snapToGrid) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 opacity-10"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: `${gridSize}px ${gridSize}px`
      }}
    />
  );
};