import React from 'react';
import './LoadingPage.css'; // We'll create this CSS file

const LoadingPage: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="water-cup">
        <div className="water"></div>
      </div>
      <p>Loading HydroSync...</p>
    </div>
  );
};

export default LoadingPage;