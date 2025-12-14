import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import WeeklyChart from '../components/WeeklyChart';
import LoadingPage from './LoadingPage';
import './HomePage.css';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import { getUserEmail } from '../services/user'; // Removed deleteAccount

import WaterTracker from '../components/WaterTracker';

import { checkAchievements, Achievement } from '../services/achievements';
import Achievements from '../components/Achievements';
import Quote from '../components/Quote';
import WaterCupVisual from '../components/WaterCupVisual';

interface Profile {
  name: string;
  daily_water_goal_oz: number;
  bottle_size_oz: number;
}

const HomePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dailyIntake, setDailyIntake] = useState(0);
  const [bottlesToAdd, setBottlesToAdd] = useState<number | ''>(1);
  const [addedBottles, setAddedBottles] = useState(0);
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null); // New state for user email
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        setError(null);
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name, daily_water_goal_oz, bottle_size_oz')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;
          setProfile(profileData);

          // Fetch user email
          const email = await getUserEmail(user.id);
          setUserEmail(email);

          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 6);
          const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

          const { data: intakeData, error: intakeError } = await supabase
            .from('daily_intake')
            .select('date, amount_oz')
            .eq('user_id', user.id)
            .gte('date', sevenDaysAgoStr)
            .lte('date', todayStr)
            .order('date', { ascending: true });

          if (intakeError && intakeError.code !== 'PGRST116') {
            throw intakeError;
          }

          if (intakeData) {
            const todayIntake = intakeData.find(d => d.date === todayStr);
            if (todayIntake) {
              setDailyIntake(todayIntake.amount_oz);
            }

            const totalIntake = intakeData.reduce((acc, curr) => acc + curr.amount_oz, 0);
            const newAchievements = checkAchievements(
              todayIntake?.amount_oz || 0,
              intakeData,
              totalIntake,
              profileData.daily_water_goal_oz
            );
            setEarnedAchievements(newAchievements);
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (addedBottles > 0) {
      const timer = setTimeout(() => setAddedBottles(0), 100); // Reset after a short delay
      return () => clearTimeout(timer);
    }
  }, [addedBottles]);

  const handleAddWater = async () => {
    if (!bottlesToAdd || !profile) return;
    const amountInOz = Number(bottlesToAdd) * profile.bottle_size_oz;
    const newIntake = dailyIntake + amountInOz;

    if (dailyIntake < profile.daily_water_goal_oz && newIntake >= profile.daily_water_goal_oz) {
      navigate('/congrats');
    }

    setDailyIntake(newIntake);
    setAddedBottles(Number(bottlesToAdd));

    const today = new Date().toISOString().split('T')[0];
    if (user) {
      await supabase.from('daily_intake').upsert(
        {
          user_id: user.id,
          date: today,
          amount_oz: newIntake,
        },
        { onConflict: 'user_id,date' }
      );
    }
  };
  
  // handleDeleteAccount function removed

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const progressPercentage = profile ? (dailyIntake / profile.daily_water_goal_oz) * 100 : 0;

  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <div className="header-left"></div>
        <h1>
          <img src="/nmn.png" alt="HydroSync logo" className="header-logo" />
          Welcome to HydroSync!
        </h1>
        <div className="header-right">
        </div>
      </header>

      <main className="dashboard">
        <section className="daily-tracker section-card">
          <h2>Today's Progress</h2>
          <p>Hello, {profile?.name}!</p>
          <div className="progress-summary">
            <p>Goal: <span className="highlight">{profile?.daily_water_goal_oz} oz</span></p>
            <p>Current: <span className="highlight">{dailyIntake} oz</span></p>
            {profile && dailyIntake < profile.daily_water_goal_oz && (
              <p>Remaining: <span className="highlight">{profile.daily_water_goal_oz - dailyIntake} oz</span></p>
            )}
            {profile && dailyIntake < profile.daily_water_goal_oz && (
              <p>Just <span className="highlight">{Math.ceil((profile.daily_water_goal_oz - dailyIntake) / profile.bottle_size_oz)}</span> more bottle(s)!</p>
            )}
            {profile && dailyIntake >= profile.daily_water_goal_oz ? (
              <p className="encouragement success">Goal achieved! Excellent hydration!</p>
            ) : (
              <p className="encouragement">Keep going, every sip counts!</p>
            )}
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="progress-text">{dailyIntake} / {profile?.daily_water_goal_oz} oz</p>
          <WaterCupVisual progressPercentage={progressPercentage} />
          <div className="add-water-controls">
            <input
              type="number"
              value={bottlesToAdd}
              onChange={(e) => setBottlesToAdd(parseInt(e.target.value) || '')}
              min="1"
              className="bottle-input"
            />
            <span> bottle(s) of {profile?.bottle_size_oz} oz</span>
            <button onClick={handleAddWater} className="add-button">Add</button>
          </div>
        </section>

        <div className="secondary-content">
          <section className="weekly-progress section-card">
            <h2>Weekly Progress</h2>
            <WeeklyChart />
          </section>

          <section className="achievements-section section-card">
            <h2>Achievements</h2>
            <Achievements earnedAchievements={earnedAchievements} />
          </section>

          <section className="quote-section section-card">
            <h2>Daily Wisdom</h2>
            <Quote />
          </section>

          <section className="settings-section section-card">
            <h2>Settings</h2>
            {userEmail && <p>Account Email: <strong>{userEmail}</strong></p>}
            {/* Delete Account button removed */}
            <button onClick={signOut} className="logout-button">Logout</button>
          </section>
        </div>
      </main>
      <WaterTracker bottles={addedBottles} />

      <footer className="homepage-footer">
        <p>&copy; 2023 Hydrosync. All rights reserved.</p>
        <p><Link to="/privacy-policy" className="privacy-policy-link">Privacy Policy</Link></p>
      </footer>
    </div>
  );
};

export default HomePage;

