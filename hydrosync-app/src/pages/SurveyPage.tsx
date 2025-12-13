import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import './SurveyPage.css';

const SurveyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [activityLevel, setActivityLevel] = useState('');
  const [bottleSize, setBottleSize] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [calculatedGoal, setCalculatedGoal] = useState(0);

  const calculateWaterIntake = (
    userWeight: number,
    userAge: number,
    userGender: string,
    userActivityLevel: string
  ): number => {
    let intake = userWeight * 0.67;
    if (userAge < 30) intake += 5;
    else if (userAge > 55) intake -= 5;

    switch (userActivityLevel) {
      case 'medium': intake += 12; break;
      case 'high': intake += 24; break;
      default: break;
    }
    return Math.round(intake);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!user || !name || !gender || !age || !weight || !activityLevel || !bottleSize) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const dailyGoal = calculateWaterIntake(weight as number, age as number, gender, activityLevel);
    setCalculatedGoal(dailyGoal);

    try {
      const { error: insertError } = await supabase.from('profiles').upsert(
        {
          id: user.id,
          name: name,
          gender: gender,
          age: age,
          weight: weight,
          activity_level: activityLevel,
          daily_water_goal_oz: dailyGoal,
          bottle_size_oz: bottleSize,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (insertError) throw insertError;
      setSurveyCompleted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="survey-container">
      <div className="survey-box">
        {surveyCompleted ? (
          <div className="survey-success">
            <h2>Thank You, {name}!</h2>
            <p>Based on your information, your recommended daily water intake is:</p>
            <p className="success-goal">{calculatedGoal} oz</p>
            <p>You can always adjust this in your account settings.</p>
            <button onClick={() => navigate('/home')} className="dashboard-button">
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            <h2>Tell Us About Yourself</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label htmlFor="gender">Gender</label>
                <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} required>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="input-group">
                <label htmlFor="age">Age</label>
                <input type="number" id="age" value={age} onChange={(e) => setAge(parseInt(e.target.value) || '')} required />
              </div>
              <div className="input-group">
                <label htmlFor="weight">Weight (lbs)</label>
                <input type="number" id="weight" value={weight} onChange={(e) => setWeight(parseInt(e.target.value) || '')} required />
              </div>
              <div className="input-group">
                <label htmlFor="activityLevel">Activity Level</label>
                <select id="activityLevel" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} required>
                  <option value="">Select Activity Level</option>
                  <option value="low">Low (Sedentary)</option>
                  <option value="medium">Medium (Moderate Exercise 3-5 days/week)</option>
                  <option value="high">High (Intense Exercise 6-7 days/week)</option>
                </select>
              </div>
              <div className="input-group">
                <label htmlFor="bottleSize">Water Bottle Size (oz)</label>
                <input type="number" id="bottleSize" value={bottleSize} onChange={(e) => setBottleSize(parseInt(e.target.value) || '')} required />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button type="submit" disabled={loading}>
                {loading ? 'Calculating...' : 'Submit Survey'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SurveyPage;
