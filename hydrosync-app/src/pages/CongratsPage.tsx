import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CongratsPage.css';

const CongratsPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="congrats-container">
      <div className="congrats-card">
        <h1>Congratulations!</h1>
        <p>You've reached your goal for today!</p>
        <p>Remember; stay hydrated to reach your ultimate goal!</p>
      </div>
    </div>
  );
};

export default CongratsPage;
