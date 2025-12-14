import React from 'react';
import './WaterCupVisual.css';

interface WaterCupVisualProps {
  progressPercentage: number; // Expected value between 0 and 100
}

const WaterCupVisual: React.FC<WaterCupVisualProps> = ({ progressPercentage }) => {
  // Ensure the water level is clamped between 0% and 100%
  // This prevents the liquid from overflowing or going below the cup visually.
  const waterLevel = Math.min(Math.max(progressPercentage, 0), 100);

  return (
    <div className="water-cup-visual-container">
      <div className="cup-base"></div> {/* Visual element for the base of the cup */}
      <div className="cup-body"> {/* Visual element for the main body of the cup */}
        <div
          className="liquid-fill"
          // Dynamically set the height of the liquid based on the calculated waterLevel percentage
          style={{ height: `${waterLevel}%` }}
        ></div>
      </div>
      {/* Display the percentage of water filled, rounded to nearest whole number */}
      <div className="cup-label">{waterLevel.toFixed(0)}%</div>
    </div>
  );
};

export default WaterCupVisual;