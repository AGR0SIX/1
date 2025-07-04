import React from 'react';

interface BallProps {
  x: number;
  y: number;
}

const Ball: React.FC<BallProps> = ({ x, y }) => {
  return (
    <div
      className="absolute flex select-none transition-transform"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        width: '12px',
        height: '12px',
      }}
    >
      <div className="absolute inset-0 rounded-full blur-sm bg-white/20" />
      <div className="relative h-full w-full rounded-full bg-white shadow-sm" />
    </div>
  );
};

export default Ball;