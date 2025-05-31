// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarLinks = document.querySelector('.navbar-links');
    
    if (navbarToggle && navbarLinks) {
        navbarToggle.addEventListener('click', () => {
            navbarLinks.classList.toggle('active');
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbarToggle.contains(e.target) && !navbarLinks.contains(e.target)) {
                navbarLinks.classList.remove('active');
            }
        });
    }
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
        
        // Initialize dark mode
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.setAttribute('data-theme', 'dark');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
    
    // User profile dropdown
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            userProfile.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            userProfile.classList.remove('active');
        });
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
        });
    }
    
    // Highlight current page in navigation
    highlightCurrentPage();
});

function toggleDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (document.body.getAttribute('data-theme') === 'dark') {
        document.body.setAttribute('data-theme', 'light');
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('darkMode', 'disabled');
    } else {
        document.body.setAttribute('data-theme', 'dark');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('darkMode', 'enabled');
    }
}

function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const navLinks = document.querySelectorAll('.navbar-links a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
}
// Check if user is authenticated
// if (!localStorage.getItem('authToken') && !window.location.pathname.includes('dashboard.html')) {
//     window.location.href = 'dashboard.html';
// }

// After successful login
localStorage.setItem('userName', user.name);
localStorage.setItem('userAvatar', user.avatarUrl);

// In nav.js
const userName = localStorage.getItem('userName');
const userAvatar = localStorage.getItem('userAvatar');
if (userName) document.querySelector('.username').textContent = userName;
if (userAvatar) document.querySelector('.user-profile img').src = userAvatar;

// Check if user is logged in and update UI
function updateNavbar() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');

    if (currentUser) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        userInfo.style.display = 'block';
        document.getElementById('usernameDisplay').textContent = currentUser.username;
        
        // Show/hide menu items based on permissions
        const adminItems = document.querySelectorAll('.admin-only');
        adminItems.forEach(item => {
            item.style.display = currentUser.role === 'admin' ? 'block' : 'none';
        });
    } else {
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        userInfo.style.display = 'none';
    }
}

// Initialize navbar when page loads
document.addEventListener('DOMContentLoaded', updateNavbar);

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}