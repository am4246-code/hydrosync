import React from 'react';
import './WaterCupVisual.css';

interface WaterCupVisualProps {
  progressPercentage: number; // 0-100
}

const WaterCupVisual: React.FC<WaterCupVisualProps> = ({ progressPercentage }) => {
  const waterLevel = Math.min(Math.max(progressPercentage, 0), 100); // Ensure between 0 and 100

  return (
    <div className="water-cup-visual-container">
      <div className="cup-base"></div>
      <div className="cup-body">
        <div
          className="liquid-fill"
          style={{ height: `${waterLevel}%` }}
        ></div>
      </div>
      <div className="cup-label">{waterLevel.toFixed(0)}%</div>
    </div>
  );
};

export default WaterCupVisual;