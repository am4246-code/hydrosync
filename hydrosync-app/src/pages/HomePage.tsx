import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import WeeklyChart from '../components/WeeklyChart';
import LoadingPage from './LoadingPage';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';
import { deleteAccount } from '../services/user';

import WaterTracker from '../components/WaterTracker';

import { checkAchievements, Achievement } from '../services/achievements';
import Achievements from '../components/Achievements';
import Quote from '../components/Quote';

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

  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action is irreversible.')) {
      try {
        await deleteAccount();
        alert('Account deleted successfully.');
        signOut();
      } catch (error: any) {
        alert(`Failed to delete account: ${error.message}`);
      }
    }
  };

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
        <div style={{ flex: 1 }}></div>
        <h1>
          <img src="/nmn.png" alt="HydroSync logo" className="header-logo" />
          HydroSync
        </h1>
        <div style={{ flex: 1 }}></div>
        <button onClick={signOut} className="logout-button">Logout</button>
      </header>

      <main className="dashboard">
        <section className="daily-tracker section-card">
          <h2>Today's Progress</h2>
          <p>Hello, {profile?.name}! Your goal is {profile?.daily_water_goal_oz} oz.</p>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <p>{dailyIntake} / {profile?.daily_water_goal_oz} oz</p>
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

        <section className="weekly-progress section-card">
          <h2>Weekly Progress</h2>
          <WeeklyChart />
        </section>

        <section className="quote-section">
          <Quote />
        </section>
        
        <section className="achievements-section section-card">
          <Achievements earnedAchievements={earnedAchievements} />
        </section>

        <section className="settings-section section-card">
          <h2>Settings</h2>
          <button onClick={toggleTheme} className="theme-toggle-button">
            {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          </button>
          <button onClick={handleDeleteAccount} className="delete-account-button">Delete Account</button>
        </section>
      </main>
      <WaterTracker bottles={addedBottles} />
    </div>
  );
};

export default HomePage;

