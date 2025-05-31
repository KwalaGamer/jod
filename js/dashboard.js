document.addEventListener('DOMContentLoaded', function() {
    // Load stats
    loadDashboardStats();
    
    // Load recent logs
    loadRecentLogs();
});

function loadDashboardStats() {
    // In a real app, these would come from the server
    document.getElementById('totalProducts').textContent = '42';
    document.getElementById('totalRawItems').textContent = '18';
    document.getElementById('todaysSales').textContent = '5';
    document.getElementById('recentImports').textContent = '3';
}

function loadRecentLogs() {
    const logs = JSON.parse(localStorage.getItem('logs')) || [];
    const logsTable = document.getElementById('recentLogsTable').querySelector('tbody');
    logsTable.innerHTML = '';
    
    const recentLogs = logs.slice(0, 5);
    
    recentLogs.forEach(log => {
        const row = document.createElement('tr');
        
        const dateCell = document.createElement('td');
        dateCell.textContent = new Date(log.date).toLocaleString();
        row.appendChild(dateCell);
        
        const userCell = document.createElement('td');
        userCell.textContent = log.user;
        row.appendChild(userCell);
        
        const actionCell = document.createElement('td');
        actionCell.textContent = log.action;
        row.appendChild(actionCell);
        
        const detailsCell = document.createElement('td');
        detailsCell.textContent = log.details;
        row.appendChild(detailsCell);
        
        logsTable.appendChild(row);
    });
}