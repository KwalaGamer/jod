document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    if (document.getElementById('workerChart')) {
        initWorkerChart();
    }
    
    if (document.getElementById('customerChart')) {
        initCustomerChart();
    }
});

function initWorkerChart() {
    const ctx = document.getElementById('workerChart').getContext('2d');
    
    // Sample data - in a real app, this would come from the server
    const workerData = {
        labels: ['John', 'Sarah', 'Mike', 'Emily', 'David'],
        datasets: [{
            label: 'Items Consumed',
            data: [12, 19, 8, 15, 10],
            backgroundColor: [
                'rgba(106, 13, 173, 0.7)',
                'rgba(74, 0, 114, 0.7)',
                'rgba(156, 39, 176, 0.7)',
                'rgba(123, 31, 162, 0.7)',
                'rgba(186, 104, 200, 0.7)'
            ],
            borderColor: [
                'rgba(106, 13, 173, 1)',
                'rgba(74, 0, 114, 1)',
                'rgba(156, 39, 176, 1)',
                'rgba(123, 31, 162, 1)',
                'rgba(186, 104, 200, 1)'
            ],
            borderWidth: 1
        }]
    };
    
    new Chart(ctx, {
        type: 'bar',
        data: workerData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initCustomerChart() {
    const ctx = document.getElementById('customerChart').getContext('2d');
    
    // Sample data - in a real app, this would come from the server
    const customerData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Sales',
            data: [1200, 1900, 800, 1500, 1000, 1800],
            backgroundColor: 'rgba(106, 13, 173, 0.2)',
            borderColor: 'rgba(106, 13, 173, 1)',
            borderWidth: 1,
            tension: 0.4,
            fill: true
        }]
    };
    
    new Chart(ctx, {
        type: 'line',
        data: customerData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}