document.getElementById('logout-btn').addEventListener('click', function() {
    sessionStorage.removeItem('loggedInUserEmail'); // Clear session data
    window.location.href = 'index.html'; // Redirect to the login page
});

document.getElementById('delete-account-btn').addEventListener('click', function() {
    const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');

    if (loggedInUserEmail) {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            let users = JSON.parse(localStorage.getItem('users')) || [];
            users = users.filter(user => user.email !== loggedInUserEmail);
            localStorage.setItem('users', JSON.stringify(users));
            sessionStorage.removeItem('loggedInUserEmail'); // Clear session data after deletion
            sessionStorage.setItem('accountDeleted', 'true'); // Set flag for login.js
            window.location.href = 'index.html'; // Redirect to the login page
        }
    } else {
        showToast('No user is currently logged in to delete.', 'info');
        // Optionally redirect to login page if user isn't logged in and tries to delete account
        window.location.href = 'index.html';
    }
});