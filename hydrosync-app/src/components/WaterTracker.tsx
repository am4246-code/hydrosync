import React, { useEffect, useState } from 'react';
import './WaterTracker.css';

interface WaterTrackerProps {
  bottles: number;
}

const WaterTracker: React.FC<WaterTrackerProps> = ({ bottles }) => {
  const [waterIcons, setWaterIcons] = useState<number[]>([]);

  useEffect(() => {
    if (bottles > 0) {
      const newIcons = Array.from({ length: bottles }, (_, i) => i + Date.now());
      setWaterIcons(prevIcons => [...prevIcons, ...newIcons]);
    }
  }, [bottles]);

  const handleAnimationEnd = (id: number) => {
    setWaterIcons(prevIcons => prevIcons.filter(iconId => iconId !== id));
  };

  return (
    <div className="water-tracker-container">
      {waterIcons.map(id => (
        <div
          key={id}
          className="water-icon"
          style={{ left: `${Math.random() * 100}vw`, '--random': Math.random() } as React.CSSProperties}
          onAnimationEnd={() => handleAnimationEnd(id)}
        >
          💧
        </div>
      ))}
    </div>
  );
};

export default WaterTracker;
