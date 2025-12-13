export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const achievements: Achievement[] = [
  {
    id: 'first-drink',
    name: 'First Drink',
    description: 'Logged your first water intake.',
    icon: '💧',
  },
  {
    id: '3-day-streak',
    name: '3-Day Streak',
    description: 'Drank your daily goal for 3 days in a row.',
    icon: '🥉',
  },
  {
    id: '7-day-streak',
    name: '7-Day Streak',
    description: 'Drank your daily goal for 7 days in a row.',
    icon: '🔥',
  },
  {
    id: '14-day-streak',
    name: '14-Day Streak',
    description: 'Drank your daily goal for 14 days in a row.',
    icon: '🏆',
  },
  {
    id: 'perfect-week',
    name: 'Perfect Week',
    description: 'Met your daily goal every day of a calendar week.',
    icon: '⭐',
  },
  {
    id: '1-gallon-club',
    name: '1 Gallon Club',
    description: 'Drank over a gallon (128 oz) in a single day.',
    icon: 'gallon', // Will use a custom icon for this
  },
  {
    id: 'hydrator',
    name: 'Hydrator',
    description: 'Drank 1000 oz of water in total.',
    icon: '🌊',
  },
  {
    id: 'master-hydrator',
    name: 'Master Hydrator',
    description: 'Drank 5000 oz of water in total.',
    icon: '👑',
  },
];

export const checkAchievements = (
  dailyIntake: number,
  weeklyData: { date: string; amount_oz: number }[],
  totalIntake: number,
  dailyGoal: number
): Achievement[] => {
  const earned: Achievement[] = [];

  // First Drink
  if (totalIntake > 0) {
    earned.push(achievements.find(a => a.id === 'first-drink')!);
  }

  // 1 Gallon Club
  if (dailyIntake >= 128) {
    earned.push(achievements.find(a => a.id === '1-gallon-club')!);
  }

  // Hydrator
  if (totalIntake >= 1000) {
    earned.push(achievements.find(a => a.id === 'hydrator')!);
  }

  // Master Hydrator
  if (totalIntake >= 5000) {
    earned.push(achievements.find(a => a.id === 'master-hydrator')!);
  }

  // Streaks
  let streak = 0;
  for (let i = weeklyData.length - 1; i >= 0; i--) {
    if (weeklyData[i].amount_oz >= dailyGoal) {
      streak++;
    } else {
      break;
    }
  }

  if (streak >= 3) {
    earned.push(achievements.find(a => a.id === '3-day-streak')!);
  }
  if (streak >= 7) {
    earned.push(achievements.find(a => a.id === '7-day-streak')!);
  }
  if (streak >= 14) {
    earned.push(achievements.find(a => a.id === '14-day-streak')!);
  }


  // Perfect Week (Sunday to Saturday)
  if (weeklyData.length >= 7) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    const weekData = weeklyData.filter(d => {
      const date = new Date(d.date);
      return date >= startOfWeek && date <= today;
    });

    if (weekData.length === dayOfWeek + 1 && weekData.every(d => d.amount_oz >= dailyGoal)) {
      earned.push(achievements.find(a => a.id === 'perfect-week')!);
    }
  }

  return earned;
};
