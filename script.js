document.addEventListener('DOMContentLoaded', () => {
    const addWaterBtn = document.getElementById('add-water-btn');
    const newGoalInput = document.getElementById('new-goal-input');
    const updateGoalBtn = document.getElementById('update-goal-btn');
    const quickAddBtns = document.querySelectorAll('.quick-add-btn');

    const numberOfBottlesInput = document.getElementById('number-of-bottles-input');
    const waterIconDisplay = document.getElementById('water-icon-display');
    const waterCupTemplate = document.getElementById('water-cup-template');
    const congratsPopup = document.getElementById('congrats-popup');
    const resetDailyBtn = document.getElementById('reset-daily-btn');

    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const goalIntakeDisplay = document.getElementById('goal-intake-display');

    const waterHistoryList = document.getElementById('water-history-list');

    const circularProgressFill = document.getElementById('circular-progress-fill');

    // Modal elements
    const recommendationModal = document.getElementById('recommendation-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalContinueBtn = document.getElementById('modal-continue-btn');
    const closeModalBtn = recommendationModal ? recommendationModal.querySelector('.close-button') : null;


    let goalIntake = 64;
    let currentIntake = 0;
    let isGoalAchieved = false;
    let waterEntries = [];
    let weeklyRecords = []; // New: Array to store weekly data
    const BOTTLE_SIZE_OZ = 16;

    // Initialize Confetti
    const confettiSettings = { target: 'confetti-canvas', size: 1.5, props: ['circle', 'triangle', 'line'], colors: [[165,104,246],[230,61,135],[0,199,228],[253,214,126]], clock: 25};
    const confetti = new ConfettiGenerator(confettiSettings);

    function switchTab(tabId) {
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');

        if (tabId === 'account-settings') {
            renderAccountInfo();
        } else if (tabId === 'main-tracker') {
            updateWeeklyProgress(); // Update weekly progress when tracker tab is active
            // Also need to initialize the chart here
            // renderWeeklyChart(); // This function does not exist yet
        }
    }

    function renderAccountInfo() {
        const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');
        if (!loggedInUserEmail) {
            document.getElementById('account-email').textContent = 'N/A';
            document.getElementById('account-name').textContent = 'N/A';
            document.getElementById('account-age').textContent = 'N/A';
            document.getElementById('account-weight').textContent = 'N/A';
            document.getElementById('account-exercise-level').textContent = 'N/A';
            document.getElementById('account-recommended-intake').textContent = 'N/A';
            showToast('No user logged in to display account info.', 'info');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const currentUser = users.find(user => user.email === loggedInUserEmail);

        if (currentUser) {
            document.getElementById('account-email').textContent = currentUser.email || 'N/A';
            if (currentUser.survey) {
                document.getElementById('account-name').textContent = currentUser.survey.name || 'N/A';
                document.getElementById('account-age').textContent = currentUser.survey.age || 'N/A';
                document.getElementById('account-weight').textContent = currentUser.survey.weight || 'N/A';
                document.getElementById('account-exercise-level').textContent = currentUser.survey.exerciseLevel || 'N/A';
                document.getElementById('account-recommended-intake').textContent = currentUser.survey.recommendedIntakeOz || 'N/A';
            } else {
                document.getElementById('account-name').textContent = 'N/A (Survey not completed)';
                document.getElementById('account-age').textContent = 'N/A (Survey not completed)';
                document.getElementById('account-weight').textContent = 'N/A (Survey not completed)';
                document.getElementById('account-exercise-level').textContent = 'N/A (Survey not completed)';
                document.getElementById('account-recommended-intake').textContent = 'N/A (Survey not completed)';
            }
        } else {
            document.getElementById('account-email').textContent = 'N/A (User data not found)';
            // Clear other fields or set to N/A
            document.getElementById('account-name').textContent = 'N/A';
            document.getElementById('account-age').textContent = 'N/A';
            document.getElementById('account-weight').textContent = 'N/A';
            document.getElementById('account-exercise-level').textContent = 'N/A';
            document.getElementById('account-recommended-intake').textContent = 'N/A';
            showToast('Logged in user data not found in local storage.', 'error');
        }
    }

    function getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function loadDailyData() {
        const storedData = localStorage.getItem('waterTrackerDailyData');
        const storedWeeklyData = JSON.parse(localStorage.getItem('waterTrackerWeeklyData')) || [];
        weeklyRecords = storedWeeklyData.filter(record => {
            const recordDate = new Date(record.date);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return recordDate >= sevenDaysAgo;
        });

        const todayDate = getTodayDate();
        let todayRecord = weeklyRecords.find(record => record.date === todayDate);

        if (todayRecord) {
            currentIntake = todayRecord.intake;
            goalIntake = todayRecord.goal;
            isGoalAchieved = todayRecord.isGoalAchieved;
            waterEntries = todayRecord.waterEntries || [];
        } else {
            // If no record for today, create a new one, keeping the goal from previous day if available
            currentIntake = 0;
            goalIntake = (storedData ? JSON.parse(storedData).goal : 64) || 64;
            isGoalAchieved = false;
            waterEntries = [];
            weeklyRecords.push({
                date: todayDate,
                intake: currentIntake,
                goal: goalIntake,
                isGoalAchieved: isGoalAchieved,
                waterEntries: waterEntries
            });
        }
        updateProgress();
        saveWeeklyData(); // Save updated weekly records after loading/initializing today's
    }

    function saveDailyData() {
        const todayDate = getTodayDate();
        let todayRecord = weeklyRecords.find(record => record.date === todayDate);

        if (todayRecord) {
            todayRecord.intake = currentIntake;
            todayRecord.goal = goalIntake;
            todayRecord.isGoalAchieved = isGoalAchieved;
            todayRecord.waterEntries = waterEntries;
        } else {
            // This case should ideally not happen if loadDailyData is called first
            weeklyRecords.push({
                date: todayDate,
                intake: currentIntake,
                goal: goalIntake,
                isGoalAchieved: isGoalAchieved,
                waterEntries: waterEntries
            });
        }
        localStorage.setItem('waterTrackerDailyData', JSON.stringify(todayRecord || {})); // Save current day's data separately
        saveWeeklyData(); // Save updated weekly records
    }

    function saveWeeklyData() {
        localStorage.setItem('waterTrackerWeeklyData', JSON.stringify(weeklyRecords));
    }

    function updateWeeklyProgress() {
        let totalWeeklyIntake = 0;
        let daysGoalMet = 0;
        const relevantRecords = weeklyRecords.filter(record => {
            const recordDate = new Date(record.date);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return recordDate >= sevenDaysAgo;
        }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date for chart

        relevantRecords.forEach(record => {
            totalWeeklyIntake += record.intake;
            if (record.isGoalAchieved) {
                daysGoalMet++;
            }
        });

        const averageDailyIntake = relevantRecords.length > 0 ? (totalWeeklyIntake / relevantRecords.length).toFixed(0) : 0;

        document.getElementById('weekly-total-intake').textContent = totalWeeklyIntake;
        document.getElementById('weekly-average-intake').textContent = averageDailyIntake;
        document.getElementById('weekly-goal-met-days').textContent = daysGoalMet;

        // Render weekly chart
        const weeklyChart = document.getElementById('weekly-chart');
        weeklyChart.innerHTML = ''; // Clear previous bars

        const maxIntakeForChart = Math.max(...relevantRecords.map(record => record.goal), 100); // Max of goal or 100oz as baseline

        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        relevantRecords.forEach(record => {
            const barContainer = document.createElement('div');
            barContainer.classList.add('weekly-bar-container');

            const bar = document.createElement('div');
            bar.classList.add('weekly-bar');
            const barHeight = (record.intake / maxIntakeForChart) * 100;
            bar.style.height = `${barHeight}%`;

            const barValue = document.createElement('div');
            barValue.classList.add('weekly-bar-value');
            barValue.textContent = `${record.intake}oz`;

            const date = new Date(record.date);
            const dayLabel = document.createElement('div');
            dayLabel.classList.add('weekly-bar-label');
            dayLabel.textContent = dayLabels[date.getDay()];

            barContainer.appendChild(barValue);
            barContainer.appendChild(bar);
            barContainer.appendChild(dayLabel);
            weeklyChart.appendChild(barContainer);
        });
    }


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

    function updateProgress() {
        let progressPercentage = 0;
        if (goalIntake > 0) {
            progressPercentage = Math.min((currentIntake / goalIntake) * 100, 100);
        }

        const percentage = progressPercentage;

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

        if (currentIntake >= goalIntake && goalIntake > 0 && !isGoalAchieved) {
            isGoalAchieved = true;
            saveDailyData();

            if (congratsPopup) {
                congratsPopup.style.display = 'block';
                confetti.render(); // Trigger confetti
                setTimeout(() => {
                    confetti.clear(); // Clear confetti after a delay
                    congratsPopup.style.display = 'none';
                }, 3000);
            }
        }
    }

    function initializeWaterTracker() {
        // Check for recommended intake from sessionStorage
        const recommendedIntake = sessionStorage.getItem('recommendedIntakeOz');
        if (recommendedIntake) {
            goalIntake = parseInt(recommendedIntake);
            sessionStorage.removeItem('recommendedIntakeOz'); // Clear it after use
            // No toast message here, as message will be shown in modal
        } else {
            loadDailyData(); // Load from localStorage if no new recommendation
        }

        goalIntakeDisplay.textContent = goalIntake;
        updateProgress();
        renderWaterHistory();
        switchTab('main-tracker');
        updateWeeklyProgress(); // Initialize weekly progress as well
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            switchTab(tabId);
        });
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
            showToast('Please enter a valid number of bottles.', 'error');
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
        updateWeeklyProgress(); // Update weekly progress after adding water
    });

    resetDailyBtn.addEventListener('click', () => {
        currentIntake = 0;
        isGoalAchieved = false;
        numberOfBottlesInput.value = '';
        waterIconDisplay.innerHTML = '';
        saveDailyData();
        updateProgress();
        renderWaterHistory();
        updateWeeklyProgress(); // Update weekly progress after reset
    });

    updateGoalBtn.addEventListener('click', () => {
        const newGoal = parseInt(newGoalInput.value);
        if (isNaN(newGoal) || newGoal <= 0) {
            showToast('Please enter a valid positive number for your new goal.', 'error');
            return;
        }
        goalIntake = newGoal;
        isGoalAchieved = false;
        saveDailyData();
        updateProgress();
        goalIntakeDisplay.textContent = goalIntake;
        newGoalInput.value = '';
        updateWeeklyProgress(); // Update weekly progress after goal change
    });

    quickAddBtns.forEach(button => {
        button.addEventListener('click', (e) => {
            const amountToAdd = parseInt(e.target.dataset.oz);
            if (isNaN(amountToAdd) || amountToAdd <= 0) {
                showToast('Invalid quick add amount.', 'error');
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
            updateWeeklyProgress(); // Update weekly progress after quick add
        });
    });

    // Handle recommendation modal display
    const recommendedIntakeForModal = sessionStorage.getItem('recommendedIntakeOz');
    if (recommendedIntakeForModal && recommendationModal && modalMessage) {
        modalMessage.textContent = `Based on your survey, you should aim to drink about ${recommendedIntakeForModal} oz of water per day.`;
        recommendationModal.style.display = 'block'; // Show the modal
        console.log('Modal shown');

        const hideModalAndProceed = () => {
            console.log('Hiding modal');
            recommendationModal.style.display = 'none';
            sessionStorage.removeItem('recommendedIntakeOz'); // Clear from sessionStorage after showing
        };

        if (modalContinueBtn) {
            modalContinueBtn.addEventListener('click', () => {
                console.log('Continue button clicked');
                hideModalAndProceed();
            });
        }
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                console.log('Close button clicked');
                hideModalAndProceed();
            });
        }
    }

    initializeWaterTracker();
});