document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    fetch('/login?t=' + new Date().getTime(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then(({ status, body }) => {
        if (status === 200) {
            showToast(body.message, 'success');
            sessionStorage.setItem('loggedInUserEmail', email);
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 2000);
        } else {
            showToast(body.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('An error occurred. Please try again.', 'error');
    });
});