import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import './WeeklyChart.css';

interface DailyIntake {
  date: string;
  amount_oz: number;
}

const WeeklyChart: React.FC = () => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<DailyIntake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      if (user) {
        setLoading(true);
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6); // Get data for the last 7 days

        const { data, error } = await supabase
          .from('water_intake')
          .select('date, amount_oz')
          .eq('user_id', user.id)
          .gte('date', sevenDaysAgo.toISOString().split('T')[0])
          .lte('date', today.toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (error) {
          console.error('Error fetching weekly data:', error);
        } else {
          // Fill in missing days with 0 intake
          const filledData = [];
          for (let i = 0; i < 7; i++) {
            const date = new Date(sevenDaysAgo);
            date.setDate(sevenDaysAgo.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            const found = data.find(d => d.date === dateString);
            filledData.push(found || { date: dateString, amount_oz: 0 });
          }
          setWeeklyData(filledData);
        }
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, [user]);

  if (loading) {
    return <p>Loading weekly data...</p>;
  }

  const maxIntake = Math.max(...weeklyData.map(d => d.amount_oz), 1); // Avoid division by zero

  return (
    <div className="weekly-chart-container">
      {weeklyData.map(item => (
        <div key={item.date} className="chart-bar-wrapper">
          <div className="chart-bar">
            <div
              className="chart-bar-fill"
              style={{ height: `${(item.amount_oz / maxIntake) * 100}%` }}
              title={`${item.amount_oz} oz`}
            ></div>
          </div>
          <span className="chart-label">{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
        </div>
      ))}
    </div>
  );
};

export default WeeklyChart;
