import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../animations/FillingAnimation.css'; // Import the CSS for the animation

const LoadingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 3000); // 3-second delay

    return () => clearTimeout(timer); // Cleanup the timer
  }, [navigate]);

  return (
    <div className="loading-container">
      <div className="cup-wrapper">
        <div className="liquid"></div>
      </div>
      <h1 className="loading-text">Loading...</h1>
    </div>
  );
};

export default LoadingPage;
