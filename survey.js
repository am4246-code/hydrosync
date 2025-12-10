document.getElementById('survey-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = event.target.name.value;
    const age = parseInt(event.target.age.value);
    const weight = parseInt(event.target.weight.value);
    const exerciseLevel = event.target['exercise-level'].value;

    if (name.trim() === '' || isNaN(age) || age <= 0 || isNaN(weight) || weight <= 0 || exerciseLevel === '') {
        showToast('Please fill in all survey questions with valid values.', 'error');
        return;
    }

    console.log('Survey submitted:', { name, age, weight, exerciseLevel });

    // Calculate recommended water intake
    let recommendedIntakeOz = weight * 0.5; // General rule: half an ounce per pound

    // Adjust for exercise level
    let exerciseMinutes = 0;
    switch (exerciseLevel) {
        case 'sedentary':
            exerciseMinutes = 0;
            break;
        case 'lightly-active':
            exerciseMinutes = 30; // 30 minutes light exercise
            break;
        case 'moderately-active':
            exerciseMinutes = 60; // 60 minutes moderate exercise
            break;
            case 'very-active':
            exerciseMinutes = 90; // 90 minutes hard exercise
            break;
        case 'extra-active':
            exerciseMinutes = 120; // 120 minutes very hard exercise
            break;
    }

    // Add 12 ounces for every 30 minutes of exercise
    recommendedIntakeOz += (exerciseMinutes / 30) * 12;

    const recommendedIntakeLitres = (recommendedIntakeOz * 0.0295735).toFixed(2); // Convert to liters, 2 decimal places

    // Store survey data in localStorage for the logged-in user
    const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');
    if (loggedInUserEmail) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        let userIndex = users.findIndex(user => user.email === loggedInUserEmail);

        if (userIndex !== -1) {
            users[userIndex].survey = {
                name,
                age,
                weight,
                exerciseLevel,
                recommendedIntakeOz: recommendedIntakeOz.toFixed(0),
                recommendedIntakeLitres,
                surveyCompleted: true
            };
            localStorage.setItem('users', JSON.stringify(users));
            sessionStorage.setItem('recommendedIntakeOz', recommendedIntakeOz.toFixed(0)); // Store for main.html
            showToast('Survey submitted successfully!', 'success');
        } else {
            showToast('Error: Logged in user not found in local storage.', 'error');
        }
    } else {
        showToast('Error: No user logged in. Please log in again.', 'error');
        window.location.href = 'index.html'; // Redirect to login if no user is logged in
        return;
    }


    const submitButton = event.target.querySelector('button');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    setTimeout(() => {
        window.location.href = 'main.html';
    }, 1500);
});
