import React, { useEffect } from 'react'; // Import useEffect
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './LoadingPage.css'; // We'll create this CSS file

const LoadingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/survey');
    }, 3000); // Redirect after 3 seconds (adjust as needed)

    return () => clearTimeout(timer); // Cleanup the timer
  }, [navigate]);

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