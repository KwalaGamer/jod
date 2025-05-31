document.addEventListener('DOMContentLoaded', function() {
  // Initialize all charts
  initSalesChart();
  initInventoryChart();
  initProductivityChart();
  
  // Add event listeners for time range selectors
  document.getElementById('salesTimeRange').addEventListener('change', updateSalesChart);
  document.getElementById('inventoryTimeRange').addEventListener('change', updateInventoryChart);
  document.getElementById('productivityTimeRange').addEventListener('change', updateProductivityChart);
});

// Sales Chart
let salesChart;
function initSalesChart() {
  const ctx = document.getElementById('salesChart').getContext('2d');
  
  salesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: generateDayLabels(30),
      datasets: [{
        label: 'Daily Sales',
        data: generateRandomData(30, 1000, 5000),
        backgroundColor: 'rgba(126, 87, 194, 0.2)',
        borderColor: 'rgba(126, 87, 194, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: getChartOptions('Sales ($)')
  });
}

// Inventory Chart
let inventoryChart;
function initInventoryChart() {
  const ctx = document.getElementById('inventoryChart').getContext('2d');
  
  inventoryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [{
        label: 'Finished Products',
        data: [120, 190, 170, 220, 250, 300, 280],
        backgroundColor: 'rgba(126, 87, 194, 0.7)',
        borderColor: 'rgba(126, 87, 194, 1)',
        borderWidth: 1
      }]
    },
    options: getChartOptions('Quantity')
  });
}

// Productivity Chart
let productivityChart;
function initProductivityChart() {
  const ctx = document.getElementById('productivityChart').getContext('2d');
  
  productivityChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'In Progress', 'Pending', 'Delayed'],
      datasets: [{
        data: [45, 20, 15, 10],
        backgroundColor: [
          'rgba(126, 87, 194, 0.8)',
          'rgba(126, 87, 194, 0.6)',
          'rgba(126, 87, 194, 0.4)',
          'rgba(126, 87, 194, 0.2)'
        ],
        borderColor: [
          'rgba(126, 87, 194, 1)',
          'rgba(126, 87, 194, 1)',
          'rgba(126, 87, 194, 1)',
          'rgba(126, 87, 194, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.raw}%`;
            }
          }
        }
      }
    }
  });
}

// Update functions for time range changes
function updateSalesChart() {
  const days = parseInt(this.value);
  salesChart.data.labels = generateDayLabels(days);
  salesChart.data.datasets[0].data = generateRandomData(days, 1000, 5000);
  salesChart.update();
}

function updateInventoryChart() {
  const type = this.value;
  let data;
  
  if (type === 'raw') {
    data = [80, 120, 90, 150, 200, 170, 130];
  } else if (type === 'finished') {
    data = [120, 190, 170, 220, 250, 300, 280];
  } else {
    data = [200, 310, 260, 370, 450, 470, 410];
  }
  
  inventoryChart.data.datasets[0].data = data;
  inventoryChart.update();
}

function updateProductivityChart() {
  const range = this.value;
  let data;
  
  if (range === 'week') {
    data = [25, 15, 10, 5];
  } else if (range === 'month') {
    data = [45, 20, 15, 10];
  } else {
    data = [60, 25, 10, 5];
  }
  
  productivityChart.data.datasets[0].data = data;
  productivityChart.update();
}

// Helper functions
function getChartOptions(title) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
        text: title
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };
}

function generateDayLabels(count) {
  const labels = [];
  for (let i = count; i > 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  return labels;
}

function generateRandomData(count, min, max) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return data;
}