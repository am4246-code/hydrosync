import React from 'react';
import { Achievement } from '../services/achievements';
import './Achievements.css';

interface AchievementsProps {
  earnedAchievements: Achievement[];
}

const Achievements: React.FC<AchievementsProps> = ({ earnedAchievements }) => {
  return (
    <div className="achievements-container">
      <h3>Achievements</h3>
      <div className="achievements-list">
        {earnedAchievements.map(achievement => (
          <div key={achievement.id} className="achievement-badge" title={achievement.description}>
            <span className="achievement-icon">
              {achievement.icon === 'gallon' ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M5 12a7 7 0 0 1 7-7" />
                  <path d="M19 12a7 7 0 0 0-7-7" />
                  <path d="M5 12a7 7 0 0 0 7 7h7" />
                  <path d="M12 19a7 7 0 0 0 7-7" />
                  <path d="M5 12a7 7 0 0 1 7 7" />
                </svg>
              ) : (
                achievement.icon
              )}
            </span>
            <span className="achievement-name">{achievement.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
