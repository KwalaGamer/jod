// Sample users data (in a real app, this would come from a server)
const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'manager', password: 'manager123', role: 'manager' },
    { username: 'staff', password: 'staff123', role: 'staff' }
];

// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                localStorage.setItem('currentUser', user.username);
                localStorage.setItem('userRole', user.role);
                addLog('login', `${user.username} logged in`);
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid username or password');
            }
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            const currentUser = localStorage.getItem('currentUser');
            addLog('logout', `${currentUser} logged out`);
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userRole');
            window.location.href = 'index.html';
        });
    }
});

// Check if user is logged in
function checkAuth() {
    if (!localStorage.getItem('currentUser') && !window.location.pathname.includes('index.html')) {
        window.location.href = 'index.html';
    }
}

// Add log entry
function addLog(action, details) {
    const logs = JSON.parse(localStorage.getItem('logs')) || [];
    const newLog = {
        date: new Date().toISOString(),
        user: localStorage.getItem('currentUser') || 'system',
        action,
        details
    };
    logs.unshift(newLog);
    localStorage.setItem('logs', JSON.stringify(logs));
    
    // In a real app, this would be sent to the server
    fetch('/api/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            filename: 'logs.json',
            data: logs
        })
    });
}

// Initialize auth check
checkAuth();