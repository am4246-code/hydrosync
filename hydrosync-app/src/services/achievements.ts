export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Define the list of all possible achievements with their metadata
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

/**
 * Checks for and returns a list of achievements earned based on user's current and historical water intake data.
 * @param dailyIntake Current day's water intake in ounces.
 * @param weeklyData Array of objects containing daily intake amounts for recent days.
 * @param totalIntake Total lifetime water intake in ounces.
 * @param dailyGoal The user's daily water intake goal in ounces.
 * @returns An array of Achievement objects that the user has earned.
 */
export const checkAchievements = (
  dailyIntake: number,
  weeklyData: { date: string; amount_oz: number }[],
  totalIntake: number,
  dailyGoal: number
): Achievement[] => {
  const earned: Achievement[] = [];

  // --- Check individual achievements ---

  // Achievement: First Drink
  // Earned if total lifetime intake is greater than 0.
  if (totalIntake > 0) {
    earned.push(achievements.find(a => a.id === 'first-drink')!);
  }

  // Achievement: 1 Gallon Club (128 oz in a single day)
  // Earned if current daily intake reaches or exceeds 128 ounces.
  if (dailyIntake >= 128) {
    earned.push(achievements.find(a => a.id === '1-gallon-club')!);
  }

  // Achievement: Hydrator (1000 oz in total)
  // Earned if total lifetime intake reaches or exceeds 1000 ounces.
  if (totalIntake >= 1000) {
    earned.push(achievements.find(a => a.id === 'hydrator')!);
  }

  // Achievement: Master Hydrator (5000 oz in total)
  // Earned if total lifetime intake reaches or exceeds 5000 ounces.
  if (totalIntake >= 5000) {
    earned.push(achievements.find(a => a.id === 'master-hydrator')!);
  }

  // --- Check streak achievements ---

  let streak = 0;
  // Iterate backwards through weekly data to calculate the current consecutive streak
  for (let i = weeklyData.length - 1; i >= 0; i--) {
    if (weeklyData[i].amount_oz >= dailyGoal) {
      streak++; // Increment streak if daily goal was met
    } else {
      break; // Break streak if goal was not met
    }
  }

  // Award streak achievements based on calculated streak length
  if (streak >= 3) {
    earned.push(achievements.find(a => a.id === '3-day-streak')!);
  }
  if (streak >= 7) {
    earned.push(achievements.find(a => a.id === '7-day-streak')!);
  }
  if (streak >= 14) {
    earned.push(achievements.find(a => a.id === '14-day-streak')!);
  }

  // --- Check Perfect Week achievement ---

  // Requires at least 7 days of data to check for a perfect week
  if (weeklyData.length >= 7) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Get current day of the week (0 for Sunday, 6 for Saturday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek); // Calculate the date of the most recent Sunday

    // Filter weekly data to only include days from the current calendar week (Sunday to today)
    const weekData = weeklyData.filter(d => {
      const date = new Date(d.date);
      return date >= startOfWeek && date <= today;
    });

    // Award "Perfect Week" if data exists for all days of the week up to today
    // AND the daily goal was met for every single one of those days.
    // (dayOfWeek + 1) gives the number of days passed in the current week including today.
    if (weekData.length === dayOfWeek + 1 && weekData.every(d => d.amount_oz >= dailyGoal)) {
      earned.push(achievements.find(a => a.id === 'perfect-week')!);
    }
  }

  return earned; // Return all achievements earned in this check
};
