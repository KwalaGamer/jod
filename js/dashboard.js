// Global variables
let salesChart, inventoryChart;
let refreshInterval;
const DATA_REFRESH_RATE = 30000; // 30 seconds

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
  // Initialize charts
  initCharts();
  
  // Load initial data
  loadDashboardData();
  
  // Set up auto-refresh
  setupAutoRefresh();
  
  // Event listeners
  document.getElementById('refreshBtn').addEventListener('click', loadDashboardData);
  document.getElementById('clearLogsBtn').addEventListener('click', clearLogs);
  document.getElementById('salesTimeRange').addEventListener('change', updateSalesChart);
  document.getElementById('inventoryFilter').addEventListener('change', updateInventoryChart);
  
  // Quick action buttons
  document.getElementById('addProductBtn').addEventListener('click', () => logAction('Add Product clicked'));
  document.getElementById('addWorkerBtn').addEventListener('click', () => logAction('Add Worker clicked'));
  document.getElementById('newSaleBtn').addEventListener('click', () => logAction('New Sale clicked'));
  document.getElementById('generateReportBtn').addEventListener('click', () => logAction('Generate Report clicked'));
});

// Initialize charts
function initCharts() {
  const salesCtx = document.getElementById('salesChart').getContext('2d');
  const inventoryCtx = document.getElementById('inventoryChart').getContext('2d');
  
  salesChart = new Chart(salesCtx, {
    type: 'line',
    data: { labels: [], datasets: [] },
    options: getChartOptions('Sales ($)')
  });
  
  inventoryChart = new Chart(inventoryCtx, {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: getChartOptions('Quantity')
  });
}

// Load all dashboard data
async function loadDashboardData() {
  try {
    // Update last updated time
    updateLastUpdated();
    
    // Fetch all data in parallel
    const [salesData, inventoryData, logs] = await Promise.all([
      fetchData('/api/sales'),
      fetchData('/api/inventory'),
      fetchData('/api/logs')
    ]);
    
    // Update charts
    updateSalesChart(null, salesData);
    updateInventoryChart(null, inventoryData);
    
    // Update logs
    displayLogs(logs);
    
    // Log successful refresh
    logAction('Dashboard refreshed');
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showNotification('Failed to load data', 'error');
  }
}

// Update sales chart
function updateSalesChart(event, data) {
  const timeRange = event ? event.target.value : document.getElementById('salesTimeRange').value;
  
  // If no data provided, fetch it
  if (!data) {
    fetchData(`/api/sales?days=${timeRange}`)
      .then(data => updateSalesChart(null, data))
      .catch(console.error);
    return;
  }
  
  // Update chart
  salesChart.data.labels = data.labels;
  salesChart.data.datasets = [{
    label: 'Sales',
    data: data.values,
    backgroundColor: 'rgba(126, 87, 194, 0.2)',
    borderColor: 'rgba(126, 87, 194, 1)',
    borderWidth: 2,
    tension: 0.4,
    fill: true
  }];
  salesChart.update();
}

// Update inventory chart
function updateInventoryChart(event, data) {
  const filter = event ? event.target.value : document.getElementById('inventoryFilter').value;
  
  // If no data provided, fetch it
  if (!data) {
    fetchData('/api/inventory')
      .then(data => updateInventoryChart(null, data))
      .catch(console.error);
    return;
  }
  
  // Apply filter
  let displayData = data;
  if (filter === 'low') {
    displayData = data.filter(item => item.quantity < item.threshold);
  }
  
  // Update chart
  inventoryChart.data.labels = displayData.map(item => item.name);
  inventoryChart.data.datasets = [{
    label: 'Inventory',
    data: displayData.map(item => item.quantity),
    backgroundColor: displayData.map(item => 
      item.quantity < item.threshold ? 'rgba(236, 64, 122, 0.7)' : 'rgba(126, 87, 194, 0.7)'
    ),
    borderColor: 'rgba(126, 87, 194, 1)',
    borderWidth: 1
  }];
  inventoryChart.update();
}

// Display logs
function displayLogs(logs) {
  const container = document.getElementById('logsContainer');
  container.innerHTML = logs.map(log => `
    <div class="log-entry">
      <span class="log-time">${new Date(log.timestamp).toLocaleString()}</span>
      <span>${log.message}</span>
    </div>
  `).join('');
}

// Clear logs
async function clearLogs() {
  try {
    await fetch('/api/logs', { method: 'DELETE' });
    document.getElementById('logsContainer').innerHTML = '';
    logAction('Logs cleared');
  } catch (error) {
    console.error('Error clearing logs:', error);
    showNotification('Failed to clear logs', 'error');
  }
}

// Log an action
async function logAction(message) {
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    // Refresh logs display
    fetchData('/api/logs').then(displayLogs);
  } catch (error) {
    console.error('Error logging action:', error);
  }
}

// Helper function to fetch data
async function fetchData(endpoint) {
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
}

// Update last updated time
function updateLastUpdated() {
  document.getElementById('lastUpdated').textContent = 
    `Last updated: ${new Date().toLocaleTimeString()}`;
}

// Set up auto-refresh
function setupAutoRefresh() {
  refreshInterval = setInterval(loadDashboardData, DATA_REFRESH_RATE);
}

// Chart options
function getChartOptions(title) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
      x: { grid: { display: false } }
    }
  };
}

// Show notification
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}