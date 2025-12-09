const SUPABASE_URL = 'https://cabztuguhbcyzpatctzs.supabase.co'; // REPLACE WITH YOUR ACTUAL SUPABASE URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhYnp0dWd1aGJjeXpwYXRjdHpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMzU1OTEsImV4cCI6MjA4MDgxMTU5MX0.T1qsPE1mjhhnQrLTm5RSxVp7XNspFP-5MFD-zkJ-GmM'; // REPLACE WITH YOUR ACTUAL SUPABASE ANON KEY

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const bufferingContainer = document.getElementById('buffering-container');
    const authContainer = document.getElementById('auth-container');
    const surveyContainer = document.getElementById('survey-container');
    const mainContainer = document.getElementById('main-container');
    const personalizedMessageContainer = document.getElementById('personalized-message-container');

    const loginScreen = document.getElementById('login-screen');
    const signupScreen = document.getElementById('signup-screen');

    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const surveyBtn = document.getElementById('survey-btn');
    const addWaterBtn = document.getElementById('add-water-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const newGoalInput = document.getElementById('new-goal-input');
    const updateGoalBtn = document.getElementById('update-goal-btn');
    const quickAddBtns = document.querySelectorAll('.quick-add-btn');

    const numberOfBottlesInput = document.getElementById('number-of-bottles-input');
    const waterIconDisplay = document.getElementById('water-icon-display');
    const waterCupTemplate = document.getElementById('water-cup-template');
    const waterFill = document.querySelector('#buffering-container .water');
    const congratsPopup = document.getElementById('congrats-popup');
    const resetDailyBtn = document.getElementById('reset-daily-btn');

    // Tab elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const goalIntakeDisplay = document.getElementById('goal-intake-display');

    // Account elements
    const accountEmailSpan = document.getElementById('account-email');
    const accountUserIdSpan = document.getElementById('account-user-id');
    const notificationToggle = document.getElementById('notification-toggle');

    // Homepage Enhancement elements
    const welcomeMessageEl = document.getElementById('welcome-message');
    const todaySummaryEl = document.getElementById('today-summary');
    const waterHistoryList = document.getElementById('water-history-list');

    // Circular Progress Bar elements
    const circularProgressContainer = document.getElementById('circular-progress-container');
    const circularProgressFill = document.getElementById('circular-progress-fill');
    const circularProgressText = document.getElementById('circular-progress-text');

    let goalIntake = 0;
    let currentIntake = 0;
    let isGoalAchieved = false;
    let waterEntries = [];
    const BOTTLE_SIZE_OZ = 16;

    // --- Dynamic Welcome Message ---
    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    }

    // --- Notification Preference Functions ---
    function saveNotificationPreference(enabled) {
        localStorage.setItem('notificationsEnabled', enabled);
    }

    function loadNotificationPreference() {
        const storedPref = localStorage.getItem('notificationsEnabled');
        return storedPref === 'true' || storedPref === null; // Default to true if not set
    }

    // --- Tab Switching Logic ---
    function switchTab(tabId) {
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
    }

    // --- Utility Functions for Date and Storage ---
    function getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function loadDailyData() {
        const storedData = localStorage.getItem('waterTrackerDailyData');
        if (storedData) {
            const data = JSON.parse(storedData);
            if (data.date === getTodayDate()) {
                currentIntake = data.intake;
                goalIntake = data.goal;
                isGoalAchieved = data.isGoalAchieved || false;
                waterEntries = data.waterEntries || [];
            } else {
                currentIntake = 0;
                goalIntake = data.goal || 0;
                isGoalAchieved = false;
                waterEntries = [];
            }
        } else {
            currentIntake = 0;
            goalIntake = 0;
            isGoalAchieved = false;
            waterEntries = [];
        }
        updateProgress();
    }

    function saveDailyData() {
        const data = {
            date: getTodayDate(),
            intake: currentIntake,
            goal: goalIntake,
            isGoalAchieved: isGoalAchieved,
            waterEntries: waterEntries
        };
        localStorage.setItem('waterTrackerDailyData', JSON.stringify(data));
    }

    function hasLoggedProgressToday() {
        return currentIntake > 0;
    }

    function isMobileDevice() {
        return /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
    }

    function requestNotificationPermission() {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
            return;
        }

        if (Notification.permission === "default") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("Notification permission granted.");
                } else {
                    console.log("Notification permission denied.");
                }
            });
        }
    }

    let notificationInterval;

    function displayWaterReminderNotification() {
        if (Notification.permission === "granted" && !hasLoggedProgressToday()) {
            new Notification("Hydrosync Reminder", {
                body: "You haven't logged your progress today! Don't forget to drink more water."
            });
        }
    }

    function scheduleHourlyNotification() {
        if (notificationInterval) {
            clearInterval(notificationInterval);
        }

        if (isMobileDevice() && Notification.permission === "granted" && loadNotificationPreference()) {
            displayWaterReminderNotification();
            notificationInterval = setInterval(() => {
                displayWaterReminderNotification();
            }, 60 * 60 * 1000);
        }
    }

    // Function to render recent water entries
    function renderWaterHistory() {
        waterHistoryList.innerHTML = '';
        if (waterEntries.length === 0) {
            const noEntryItem = document.createElement('li');
            noEntryItem.textContent = 'No water logged yet today.';
            waterHistoryList.appendChild(noEntryItem);
            return;
        }
        const recentEntries = waterEntries.slice(-5).reverse();
        recentEntries.forEach(entry => {
            const listItem = document.createElement('li');
            listItem.textContent = `${entry.amount} oz at ${entry.timestamp}`;
            waterHistoryList.appendChild(listItem);
        });
    }

    // Function to update today's summary message
    function updateTodaySummary() {
        let summaryMessage = '';
        const progressPercentage = goalIntake > 0 ? (currentIntake / goalIntake) : 0;
        const hour = new Date().getHours();

        if (isGoalAchieved) {
            summaryMessage = "Fantastic! You've already hit your goal today!";
        } else if (progressPercentage >= 1) {
             summaryMessage = "Excellent! You've reached your daily goal!";
        }
        else if (progressPercentage > 0.75 && hour < 20) {
            summaryMessage = "Almost there! Keep going to hit your goal!";
        } else if (progressPercentage > 0.5 && hour < 18) {
            summaryMessage = "Great progress! You're over halfway to your goal.";
        } else if (progressPercentage > 0.25 && hour < 15) {
            summaryMessage = "Good start! Keep sipping throughout the day.";
        } else if (progressPercentage === 0 && hour > 10) {
            summaryMessage = "Time to drink up! No water logged yet today.";
        } else {
            summaryMessage = "Start hydrating! Your body will thank you.";
        }
        todaySummaryEl.textContent = summaryMessage;
    }

    // Function to update progress bar and related displays
    function updateProgress() {
        let progressPercentage = 0;
        if (goalIntake > 0) {
            progressPercentage = Math.min((currentIntake / goalIntake) * 100, 100);
        }

        const percentage = progressPercentage;

        if (waterFill) {
            waterFill.style.height = `${percentage}%`;
        }
        
        if (percentage > 0) {
            const degrees = percentage * 3.6;
            circularProgressFill.style.background = `conic-gradient(#6dd5ed 0deg, #2193b0 ${degrees}deg, #e0e6ec ${degrees}deg, #e0e6ec 360deg)`;
        } else {
            circularProgressFill.style.background = '#e0e6ec';
        }

        const currentIntakeEl = document.getElementById('current-intake');
        const goalIntakeEl = document.getElementById('goal-intake');
        if (currentIntakeEl) {
            currentIntakeEl.textContent = currentIntake;
        }
        if (goalIntakeEl) {
            goalIntakeEl.textContent = goalIntake;
        }

        updateTodaySummary();

        if (currentIntake >= goalIntake && goalIntake > 0 && !isGoalAchieved) {
            isGoalAchieved = true;
            saveDailyData();
            
            if (typeof confetti !== 'undefined') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#007bff', '#ffffff', '#a8e0ff']
                });
            }
            
            if (congratsPopup) {
                congratsPopup.style.display = 'block';
                setTimeout(() => {
                    congratsPopup.style.display = 'none';
                }, 3000);
            }
        }
    }

    // Function to render weekly progress (dummy data for now)
    function renderWeeklyProgress() {
        const weeklyProgressGraphContainer = document.getElementById('weekly-progress-graph-container');
        weeklyProgressGraphContainer.innerHTML = '';

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const maxGraphHeight = 150;

        for (let i = 6; i >= 0; i--) {
            const day = new Date();
            day.setDate(today.getDate() - i);
            day.setHours(0, 0, 0, 0);

            const dayName = daysOfWeek[day.getDay()];
            let displayIntake;
            let displayGoal;

            const isToday = (day.getTime() === today.getTime());

            if (isToday) {
                displayIntake = currentIntake;
                displayGoal = goalIntake;
            } else {
                displayGoal = goalIntake > 0 ? goalIntake : 128;
                const randomFactor = Math.random();
                if (randomFactor < 0.3) {
                    displayIntake = Math.floor(displayGoal * (0.3 + Math.random() * 0.4));
                } else if (randomFactor < 0.7) {
                    displayIntake = Math.floor(displayGoal * (0.8 + Math.random() * 0.4));
                } else {
                    displayIntake = Math.floor(displayGoal * (1.1 + Math.random() * 0.5));
                }
            }
            
            const percentage = Math.min((displayIntake / displayGoal) * 100, 100);

            const graphBarWrapper = document.createElement('div');
            graphBarWrapper.classList.add('graph-bar-wrapper');

            const barValue = document.createElement('span');
            barValue.classList.add('bar-value');
            barValue.textContent = `${displayIntake}oz`;

            const graphBar = document.createElement('div');
            graphBar.classList.add('graph-bar');
            graphBar.style.height = `${(percentage / 100) * maxGraphHeight}px`;

            const barLabel = document.createElement('span');
            barLabel.classList.add('bar-label');
            barLabel.textContent = dayName;

            graphBarWrapper.appendChild(barValue);
            graphBarWrapper.appendChild(graphBar);
            graphBarWrapper.appendChild(barLabel);

            weeklyProgressGraphContainer.appendChild(graphBarWrapper);
        }
    }

    // --- Initialize Water Tracker on Load ---
    function initializeWaterTracker() {
        loadDailyData();
        goalIntakeDisplay.textContent = goalIntake;
        welcomeMessageEl.textContent = getGreeting() + '!';
        
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                accountEmailSpan.textContent = user.email;
                accountUserIdSpan.textContent = user.id;
            } else {
                accountEmailSpan.textContent = 'N/A';
                accountUserIdSpan.textContent = 'N/A';
            }
        });

        updateProgress();
        renderWaterHistory();
        renderWeeklyProgress();
        switchTab('main-tracker');
    }

    // --- Event Listeners and Initial Setup ---
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            switchTab(tabId);
            if (tabId === 'weekly-stats') {
                renderWeeklyProgress();
            }
        });
    });

    if (notificationToggle) {
        notificationToggle.checked = loadNotificationPreference();
        notificationToggle.addEventListener('change', () => {
            const isEnabled = notificationToggle.checked;
            saveNotificationPreference(isEnabled);
            if (isMobileDevice()) {
                if (isEnabled) {
                    requestNotificationPermission();
                    scheduleHourlyNotification();
                } else {
                    if (notificationInterval) {
                        clearInterval(notificationInterval);
                    }
                }
            }
        });
    }

    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginScreen.style.display = 'none';
        signupScreen.style.display = 'block';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupScreen.style.display = 'none';
        loginScreen.style.display = 'block';
    });

    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.error('Login error (Supabase):', error);
                alert(`Login failed: ${error.message}`);
            } else {
                authContainer.style.display = 'none';
                bufferingContainer.style.display = 'flex';

                setTimeout(() => {
                    checkSessionAndRedirect();
                }, 1000);
            }
        } catch (err) {
            console.error('Unexpected error during login:', err);
            alert('An unexpected error occurred. Please try again.');
        }
    });

    signupBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;

        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (error) {
                console.error('Signup error:', error);
                alert(`Signup failed: ${error.message}`);
            } else {
                if (data.user) { // User created
                    authContainer.style.display = 'none';
                    bufferingContainer.style.display = 'flex'; // Display buffering container
                    setTimeout(() => {
                        checkSessionAndRedirect();
                    }, 1000);
                } else {
                    alert('An unexpected error occurred during signup.');
                }
            }
        } catch (err) {
            console.error('Unexpected error during signup:', err);
            alert('An unexpected error occurred. Please try again.');
        }
    });

    surveyBtn.addEventListener('click', async () => {
        const name = document.getElementById('name').value;
        const gender = document.getElementById('gender').value;
        const age = parseInt(document.getElementById('age').value);
        const weight = parseInt(document.getElementById('weight').value);
        const exercise = document.getElementById('exercise').value;

        if (!name || !gender || !age || !weight || !exercise) {
            alert('Please fill out all survey fields.');
            return;
        }

        let baseIntake = weight * 0.5;
        if (age < 30) baseIntake += 8;
        if (gender === 'male') baseIntake += 8;
        switch (exercise) {
            case 'light':
                baseIntake += 8;
                break;
            case 'moderate':
                baseIntake += 16;
                break;
            case 'intense':
                baseIntake += 24;
                break;
        }

        goalIntake = Math.round(baseIntake);
        isGoalAchieved = false;
        saveDailyData();

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error } = await supabase
                .from('users')
                .upsert({ 
                    id: user.id, 
                    has_completed_survey: true, 
                    daily_goal_oz: goalIntake,
                    name: name
                }, { onConflict: 'id' });

            if (error) {
                console.error('Error updating user survey status:', error);
                alert('An error occurred saving your survey data. Please try again.');
                return;
            }
        }

        const personalizedMessageEl = document.getElementById('personalized-message');
        personalizedMessageEl.textContent = `Hello ${name}! Your daily water intake goal is ${goalIntake} oz.`;

        surveyContainer.style.display = 'none';
        personalizedMessageContainer.style.display = 'block';

        setTimeout(() => {
            personalizedMessageContainer.style.display = 'none';
            checkSessionAndRedirect();
        }, 3000);
    });

    numberOfBottlesInput.addEventListener('input', () => {
        const numBottles = parseInt(numberOfBottlesInput.value);
        waterIconDisplay.innerHTML = '';

        if (numBottles > 0) {
            for (let i = 0; i < numBottles; i++) {
                const icon = waterCupTemplate.cloneNode(true);
                icon.style.display = 'inline-block';
                icon.classList.add('water-icon');
                waterIconDisplay.appendChild(icon);
            }
        }
    });

    addWaterBtn.addEventListener('click', () => {
        const numBottles = parseInt(numberOfBottlesInput.value);
        if (isNaN(numBottles) || numBottles <= 0) {
            alert('Please enter a valid number of bottles.');
            return;
        }

        const addedAmount = numBottles * BOTTLE_SIZE_OZ;
        currentIntake += addedAmount;
        
        waterEntries.push({
            amount: addedAmount,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        });
        if (waterEntries.length > 10) {
            waterEntries = waterEntries.slice(-10);
        }

        saveDailyData();
        numberOfBottlesInput.value = '';
        waterIconDisplay.innerHTML = '';
        updateProgress();
        renderWaterHistory();
    });

    resetDailyBtn.addEventListener('click', () => {
        currentIntake = 0;
        isGoalAchieved = false;
        numberOfBottlesInput.value = '';
        waterIconDisplay.innerHTML = '';
        saveDailyData();
        updateProgress();
        renderWaterHistory();
    });

    updateGoalBtn.addEventListener('click', () => {
        const newGoal = parseInt(newGoalInput.value);
        if (isNaN(newGoal) || newGoal <= 0) {
            alert('Please enter a valid positive number for your new goal.');
            return;
        }
        goalIntake = newGoal;
        isGoalAchieved = false;
        saveDailyData();
        updateProgress();
        goalIntakeDisplay.textContent = goalIntake;
        newGoalInput.value = '';

        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (user) {
                const { error } = await supabase
                    .from('users')
                    .update({ daily_goal_oz: newGoal })
                    .eq('id', user.id);
                if (error) {
                    console.error('Error updating daily goal in Supabase:', error);
                }
            }
        });
    });

    quickAddBtns.forEach(button => {
        button.addEventListener('click', (e) => {
            const amountToAdd = parseInt(e.target.dataset.oz);
            if (isNaN(amountToAdd) || amountToAdd <= 0) {
                alert('Invalid quick add amount.');
                return;
            }
            currentIntake += amountToAdd;
            waterEntries.push({
                amount: amountToAdd,
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            });
            if (waterEntries.length > 10) {
                waterEntries = waterEntries.slice(-10);
            }
            saveDailyData();
            updateProgress();
            renderWaterHistory();
        });
    });

    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Logout error:', error);
            alert('An error occurred during logout. Please try again.');
        } else {
            localStorage.removeItem('waterTrackerDailyData');
            currentIntake = 0;
            goalIntake = 0;
            isGoalAchieved = false;
            waterEntries = [];
            
            numberOfBottlesInput.value = '';
            waterIconDisplay.innerHTML = '';
            
            mainContainer.style.display = 'none';
            surveyContainer.style.display = 'none';
            personalizedMessageContainer.style.display = 'none';
            authContainer.style.display = 'block';

            if (notificationInterval) {
                clearInterval(notificationInterval);
            }
            renderWaterHistory();
        }
    });

    async function checkSessionAndRedirect() {
        bufferingContainer.style.display = 'flex';
        authContainer.style.display = 'none';
        surveyContainer.style.display = 'none';
        mainContainer.style.display = 'none';
        personalizedMessageContainer.style.display = 'none';

        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('has_completed_survey, daily_goal_oz')
                .eq('id', user.id)
                .single();

            if (userError && userError.code !== 'PGRST116') {
                console.error("Error fetching user survey status:", userError);
                bufferingContainer.style.display = 'none';
                authContainer.style.display = 'block';
                return;
            }

            if (userData && userData.has_completed_survey) {
                setTimeout(() => {
                    bufferingContainer.style.display = 'none';
                    mainContainer.style.display = 'block';
                    goalIntake = userData.daily_goal_oz || goalIntake; 
                    initializeWaterTracker(); // Call here!
                    if (isMobileDevice() && loadNotificationPreference()) {
                        requestNotificationPermission();
                        scheduleHourlyNotification();
                    }
                }, 500); // Keep buffering screen visible for 0.5 seconds
            } else {
                setTimeout(() => {
                    bufferingContainer.style.display = 'none';
                    surveyContainer.style.display = 'block';
                }, 500); // Keep buffering screen visible for 0.5 seconds
            }
        } else {
            setTimeout(() => {
                bufferingContainer.style.display = 'none';
                authContainer.style.display = 'block';
            }, 500); // Keep buffering screen visible for 0.5 seconds
        }
    }

    // Initial check when the DOM is fully loaded
    checkSessionAndRedirect();
});
