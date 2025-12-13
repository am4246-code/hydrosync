import React from 'react';
import './WaterCups.css';

interface WaterCupsProps {
  bottles: number;
}

const WaterCups: React.FC<WaterCupsProps> = ({ bottles }) => {
  const cups = Array.from({ length: Math.floor(bottles) }, (_, i) => i);

  return (
    <div className="water-cups-container">
      {cups.map(i => (
        <div key={i} className="water-cup">
          <span role="img" aria-label="water-cup">
            &#x1F964;
          </span>
        </div>
      ))}
    </div>
  );
};

export default WaterCups;
