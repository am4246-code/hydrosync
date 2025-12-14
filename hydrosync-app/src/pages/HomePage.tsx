import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import WeeklyChart from '../components/WeeklyChart';
import LoadingPage from './LoadingPage';
import './HomePage.css';
import { useNavigate, Link } from 'react-router-dom'; // Added Link for navigation
import { getUserEmail } from '../services/user'; // Function to fetch user email

import WaterTracker from '../components/WaterTracker'; // Component for water tracking animation
import { checkAchievements, Achievement } from '../services/achievements'; // Logic for checking user achievements
import Achievements from '../components/Achievements'; // Component to display achievements
import Quote from '../components/Quote'; // Component to display daily quotes
import WaterCupVisual from '../components/WaterCupVisual'; // Visual representation of water intake progress

interface Profile {
  name: string;
  daily_water_goal_oz: number;
  bottle_size_oz: number;
}

const HomePage: React.FC = () => {
  const { user, signOut } = useAuth(); // Authentication context to get user and signOut function
  const [profile, setProfile] = useState<Profile | null>(null); // User's profile data
  const [dailyIntake, setDailyIntake] = useState(0); // Current day's water intake
  const [bottlesToAdd, setBottlesToAdd] = useState<number | ''>(1); // Number of bottles user wants to add
  const [addedBottles, setSetAddedBottles] = useState(0); // Tracks how many bottles were just added for animation
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]); // List of earned achievements
  const [loading, setLoading] = useState(true); // Loading state for initial data fetch
  const [error, setError] = useState<string | null>(null); // Error state for data fetching
  const [userEmail, setUserEmail] = useState<string | null>(null); // User's email linked to account
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Effect to fetch initial user data (profile, intake, achievements, email)
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        setError(null);
        try {
          // Fetch user profile from Supabase
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name, daily_water_goal_oz, bottle_size_oz')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;
          setProfile(profileData);

          // Fetch user email using the utility function
          const email = await getUserEmail(user.id);
          setUserEmail(email);

          // Calculate date range for weekly intake data
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 6);
          const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

          // Fetch daily intake data for the last 7 days
          const { data: intakeData, error: intakeError } = await supabase
            .from('daily_intake')
            .select('date, amount_oz')
            .eq('user_id', user.id)
            .gte('date', sevenDaysAgoStr)
            .lte('date', todayStr)
            .order('date', { ascending: true });

          // Handle specific Supabase error for no rows found gracefully
          if (intakeError && intakeError.code !== 'PGRST116') {
            throw intakeError;
          }

          if (intakeData) {
            // Update daily intake for today
            const todayIntake = intakeData.find(d => d.date === todayStr);
            if (todayIntake) {
              setDailyIntake(todayIntake.amount_oz);
            }

            // Calculate total intake and check for achievements
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
  }, [user]); // Re-run effect when user object changes

  // Effect to reset addedBottles state after a short delay for animation
  useEffect(() => {
    if (addedBottles > 0) {
      const timer = setTimeout(() => setSetAddedBottles(0), 100); // Reset after 100ms
      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [addedBottles]); // Re-run effect when addedBottles changes

  // Handler for adding water intake
  const handleAddWater = async () => {
    if (!bottlesToAdd || !profile) return; // Prevent action if no bottles to add or profile is missing

    const amountInOz = Number(bottlesToAdd) * profile.bottle_size_oz; // Calculate amount to add
    const newIntake = dailyIntake + amountInOz; // Update total daily intake

    // If goal is met with this addition, navigate to congrats page
    if (dailyIntake < profile.daily_water_goal_oz && newIntake >= profile.daily_water_goal_oz) {
      navigate('/congrats');
    }

    setDailyIntake(newIntake); // Update daily intake state
    setSetAddedBottles(Number(bottlesToAdd)); // Trigger water visual animation

    // Upsert (insert or update) the daily intake in Supabase
    const today = new Date().toISOString().split('T')[0];
    if (user) {
      await supabase.from('daily_intake').upsert(
        {
          user_id: user.id,
          date: today,
          amount_oz: newIntake,
        },
        { onConflict: 'user_id,date' } // Conflict on user_id and date means update existing row
      );
    }
  };
  
  // handleDeleteAccount function removed as per user request

  // Display loading page if data is still being fetched
  if (loading) {
    return <LoadingPage />;
  }

  // Display error message if data fetching failed
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Calculate progress percentage for progress bar and water cup visual
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
          {/* Summary of daily goal and progress */}
          <div className="progress-summary">
            <p>Goal: <span className="highlight">{profile?.daily_water_goal_oz} oz</span></p>
            <p>Current: <span className="highlight">{dailyIntake} oz</span></p>
            {/* Display remaining water if goal not met */}
            {profile && dailyIntake < profile.daily_water_goal_oz && (
              <p>Remaining: <span className="highlight">{profile.daily_water_goal_oz - dailyIntake} oz</span></p>
            )}
            {/* Display bottles remaining if goal not met */}
            {profile && dailyIntake < profile.daily_water_goal_oz && (
              <p>Just <span className="highlight">{Math.ceil((profile.daily_water_goal_oz - dailyIntake) / profile.bottle_size_oz)}</span> more bottle(s)!</p>
            )}
            {/* Dynamic encouragement message based on progress */}
            {profile && dailyIntake >= profile.daily_water_goal_oz ? (
              <p className="encouragement success">Goal achieved! Excellent hydration!</p>
            ) : (
              <p className="encouragement">Keep going, every sip counts!</p>
            )}
          </div>
          {/* Progress bar visual */}
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          {/* Text display of current vs. goal intake */}
          <p className="progress-text">{dailyIntake} / {profile?.daily_water_goal_oz} oz</p>
          {/* Water cup visual animation */}
          <WaterCupVisual progressPercentage={progressPercentage} />
          {/* Controls for adding water intake */}
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

        {/* Secondary content sections (Weekly Progress, Achievements, Quote, Settings) */}
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
            {/* Display user's linked email */}
            {userEmail && <p>Account Email: <strong>{userEmail}</strong></p>}
            {/* Delete Account button removed */}
            <button onClick={signOut} className="logout-button">Logout</button>
          </section>
        </div>
      </main>
      {/* Water tracking animation component */}
      <WaterTracker bottles={addedBottles} />

      <footer className="homepage-footer">
        <p>&copy; 2023 Hydrosync. All rights reserved.</p>
        <p><Link to="/privacy-policy" className="privacy-policy-link">Privacy Policy</Link></p>
      </footer>
    </div>
  );
};

export default HomePage;

