document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = event.target.email.value; // Changed from username to email
    const password = event.target.password.value;
    const confirmPassword = event.target['confirm-password'].value;

    if (email.trim() === '' || password.trim() === '' || confirmPassword.trim() === '') {
        showToast('Please fill in all fields.', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        return;
    }

    // Get existing users from localStorage or initialize an empty array
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if an account with this email already exists
    const emailExists = users.some(user => user.email === email);

    if (emailExists) {
        showToast('An account with this email already exists. Please login or use a different email.', 'error');
        return;
    }

    // Add the new user to the array
    users.push({ email, password });
    localStorage.setItem('users', JSON.stringify(users));

    console.log('Signing up with:', { email, password });
    
    const signupButton = event.target.querySelector('button');
    signupButton.disabled = true;
    signupButton.textContent = 'Signing up...';

    setTimeout(() => {
        console.log('Sign-up successful!');
        showToast('Sign-up successful! You can now complete the survey.', 'success');
        window.location.href = 'survey.html';
    }, 2000);
});

