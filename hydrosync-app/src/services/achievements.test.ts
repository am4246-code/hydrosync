import { checkAchievements, achievements } from './achievements';

describe('checkAchievements', () => {
  const dailyGoal = 64; // Example daily goal

  test('should award "First Drink" if total intake is greater than 0', () => {
    const earned = checkAchievements(10, [], 10, dailyGoal);
    expect(earned).toContainEqual(achievements.find(a => a.id === 'first-drink'));
  });

  test('should not award "First Drink" if total intake is 0', () => {
    const earned = checkAchievements(0, [], 0, dailyGoal);
    expect(earned).not.toContainEqual(achievements.find(a => a.id === 'first-drink'));
  });

  test('should award "1 Gallon Club" if daily intake is 128 oz or more', () => {
    const earned = checkAchievements(128, [], 200, dailyGoal);
    expect(earned).toContainEqual(achievements.find(a => a.id === '1-gallon-club'));
  });

  test('should not award "1 Gallon Club" if daily intake is less than 128 oz', () => {
    const earned = checkAchievements(127, [], 200, dailyGoal);
    expect(earned).not.toContainEqual(achievements.find(a => a.id === '1-gallon-club'));
  });

  test('should award "Hydrator" if total intake is 1000 oz or more', () => {
    const earned = checkAchievements(50, [], 1000, dailyGoal);
    expect(earned).toContainEqual(achievements.find(a => a.id === 'hydrator'));
  });

  test('should not award "Hydrator" if total intake is less than 1000 oz', () => {
    const earned = checkAchievements(50, [], 999, dailyGoal);
    expect(earned).not.toContainEqual(achievements.find(a => a.id === 'hydrator'));
  });

  test('should award "Master Hydrator" if total intake is 5000 oz or more', () => {
    const earned = checkAchievements(50, [], 5000, dailyGoal);
    expect(earned).toContainEqual(achievements.find(a => a.id === 'master-hydrator'));
  });

  test('should not award "Master Hydrator" if total intake is less than 5000 oz', () => {
    const earned = checkAchievements(50, [], 4999, dailyGoal);
    expect(earned).not.toContainEqual(achievements.find(a => a.id === 'master-hydrator'));
  });

  // Streaks testing
  test('should award "3-Day Streak" for 3 consecutive days meeting goal', () => {
    const weeklyData = [
      { date: '2025-12-10', amount_oz: dailyGoal },
      { date: '2025-12-11', amount_oz: dailyGoal },
      { date: '2025-12-12', amount_oz: dailyGoal }, // Today
    ];
    const earned = checkAchievements(dailyGoal, weeklyData, 3 * dailyGoal, dailyGoal);
    expect(earned).toContainEqual(achievements.find(a => a.id === '3-day-streak'));
    expect(earned).not.toContainEqual(achievements.find(a => a.id === '7-day-streak'));
  });

  test('should award "7-Day Streak" for 7 consecutive days meeting goal', () => {
    const weeklyData = [
      { date: '2025-12-06', amount_oz: dailyGoal },
      { date: '2025-12-07', amount_oz: dailyGoal },
      { date: '2025-12-08', amount_oz: dailyGoal },
      { date: '2025-12-09', amount_oz: dailyGoal },
      { date: '2025-12-10', amount_oz: dailyGoal },
      { date: '2025-12-11', amount_oz: dailyGoal },
      { date: '2025-12-12', amount_oz: dailyGoal }, // Today
    ];
    const earned = checkAchievements(dailyGoal, weeklyData, 7 * dailyGoal, dailyGoal);
    expect(earned).toContainEqual(achievements.find(a => a.id === '7-day-streak'));
    expect(earned).not.toContainEqual(achievements.find(a => a.id === '14-day-streak'));
  });

  test('should not award "3-Day Streak" if streak is broken', () => {
    const weeklyData = [
      { date: '2025-12-10', amount_oz: dailyGoal },
      { date: '2025-12-11', amount_oz: dailyGoal - 10 }, // Broken streak
      { date: '2025-12-12', amount_oz: dailyGoal },
    ];
    const earned = checkAchievements(dailyGoal, weeklyData, 3 * dailyGoal - 10, dailyGoal);
    expect(earned).not.toContainEqual(achievements.find(a => a.id === '3-day-streak'));
  });

  // Perfect Week testing (requires mocking Date)
  test('should award "Perfect Week" if all days of current week meet goal', () => {
    const today = new Date('2025-12-13T12:00:00.000Z'); // Saturday
    jest.spyOn(global, 'Date').mockImplementation(() => today as unknown as string);

    const weeklyData = [
      { date: '2025-12-07', amount_oz: dailyGoal }, // Sunday
      { date: '2025-12-08', amount_oz: dailyGoal },
      { date: '2025-12-09', amount_oz: dailyGoal },
      { date: '2025-12-10', amount_oz: dailyGoal },
      { date: '2025-12-11', amount_oz: dailyGoal },
      { date: '2025-12-12', amount_oz: dailyGoal },
      { date: '2025-12-13', amount_oz: dailyGoal }, // Saturday (today)
    ];

    const earned = checkAchievements(dailyGoal, weeklyData, weeklyData.length * dailyGoal, dailyGoal);
    expect(earned).toContainEqual(achievements.find(a => a.id === 'perfect-week'));
    jest.restoreAllMocks();
  });

  test('should not award "Perfect Week" if one day of current week does not meet goal', () => {
    const today = new Date('2025-12-13T12:00:00.000Z'); // Saturday
    jest.spyOn(global, 'Date').mockImplementation(() => today as unknown as string);

    const weeklyData = [
      { date: '2025-12-07', amount_oz: dailyGoal },
      { date: '2025-12-08', amount_oz: dailyGoal },
      { date: '2025-12-09', amount_oz: dailyGoal - 5 }, // Missed goal
      { date: '2025-12-10', amount_oz: dailyGoal },
      { date: '2025-12-11', amount_oz: dailyGoal },
      { date: '2025-12-12', amount_oz: dailyGoal },
      { date: '2025-12-13', amount_oz: dailyGoal },
    ];

    const earned = checkAchievements(dailyGoal, weeklyData, (weeklyData.length * dailyGoal) - 5, dailyGoal);
    expect(earned).not.toContainEqual(achievements.find(a => a.id === 'perfect-week'));
    jest.restoreAllMocks();
  });

  test('should return multiple achievements if multiple conditions are met', () => {
    const today = new Date('2025-12-13T12:00:00.000Z'); // Saturday
    jest.spyOn(global, 'Date').mockImplementation(() => today as unknown as string);

    const weeklyData = [
      { date: '2025-12-07', amount_oz: dailyGoal },
      { date: '2025-12-08', amount_oz: dailyGoal },
      { date: '2025-12-09', amount_oz: dailyGoal },
      { date: '2025-12-10', amount_oz: dailyGoal },
      { date: '2025-12-11', amount_oz: dailyGoal },
      { date: '2025-12-12', amount_oz: dailyGoal },
      { date: '2025-12-13', amount_oz: 150 }, // 1 Gallon Club + Daily Goal
    ];

    const totalIntake = (weeklyData.length - 1) * dailyGoal + 150; // Total intake for Hydrator/Master Hydrator

    const earned = checkAchievements(150, weeklyData, totalIntake, dailyGoal);
    expect(earned).toContainEqual(achievements.find(a => a.id === 'first-drink'));
    expect(earned).toContainEqual(achievements.find(a => a.id === '1-gallon-club'));
    expect(earned).toContainEqual(achievements.find(a => a.id === 'perfect-week'));
    expect(earned).toContainEqual(achievements.find(a => a.id === '7-day-streak')); // Assuming totalIntake is enough for Hydrator/Master Hydrator too.
    jest.restoreAllMocks();
  });
});