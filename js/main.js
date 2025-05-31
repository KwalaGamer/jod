// Toggle dark mode
document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('toggleDarkMode');
    const darkModeStyle = document.getElementById('darkModeStyle');
    
    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        darkModeStyle.removeAttribute('disabled');
    }
    
    darkModeToggle.addEventListener('click', function() {
        if (darkModeStyle.disabled) {
            darkModeStyle.removeAttribute('disabled');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            darkModeStyle.setAttribute('disabled', 'true');
            localStorage.setItem('darkMode', 'disabled');
        }
    });
    
    // Set current user if logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && document.getElementById('currentUser')) {
        document.getElementById('currentUser').textContent = currentUser;
    }
});