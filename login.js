document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = event.target.username.value;
    const password = event.target.password.value;

    if (email.trim() === '' || password.trim() === '') {
        showToast('Please enter both email and password.', 'error');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        sessionStorage.setItem('loggedInUserEmail', email);

        const loginButton = event.target.querySelector('button');
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';

        setTimeout(() => {
            showToast('Login successful!', 'success');
            if (user.survey && user.survey.surveyCompleted) {
                // If survey completed, set the recommended intake for main.html
                sessionStorage.setItem('recommendedIntakeOz', user.survey.recommendedIntakeOz);
                window.location.href = 'main.html';
            } else {
                window.location.href = 'survey.html';
            }
        }, 2000);
    } else {
        showToast('Invalid email or password.', 'error');
    }
});

// Clear fields if coming from account deletion
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('accountDeleted') === 'true') {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.username.value = ''; // Assuming 'username' is the email field
            loginForm.password.value = '';
        }
        sessionStorage.removeItem('accountDeleted'); // Clear the flag
    }
});
