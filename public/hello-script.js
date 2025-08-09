document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userName = localStorage.getItem('userName');
    
    if (!isLoggedIn) {
        // Redirect to login page if not logged in
        window.location.href = '/index.html';
        return;
    }

    // Update greeting with user name if available
    const greeting = document.querySelector('h1');
    if (userName && greeting) {
        greeting.textContent = `Hello, ${userName}!`;
    }

    const logoutBtn = document.getElementById('logout-btn');

    logoutBtn.addEventListener('click', () => {
        // Clear login state
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        
        // Redirect to login page
        window.location.href = '/index.html';
    });
});
