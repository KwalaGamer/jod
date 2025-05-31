document.addEventListener('DOMContentLoaded', function() {
  // Sample log data
  const logData = [
    {
      timestamp: '2023-05-15 09:30:22',
      action: 'Product Added',
      user: 'admin@example.com',
      details: 'Added "Premium Widget" to inventory',
      status: 'success'
    },
    {
      timestamp: '2023-05-15 10:15:43',
      action: 'Inventory Update',
      user: 'manager@example.com',
      details: 'Updated stock for "Basic Widget"',
      status: 'success'
    },
    {
      timestamp: '2023-05-14 14:22:10',
      action: 'User Login Failed',
      user: 'unknown@example.com',
      details: 'Failed login attempt',
      status: 'error'
    },
    {
      timestamp: '2023-05-14 11:05:33',
      action: 'Report Generated',
      user: 'staff@example.com',
      details: 'Generated monthly sales report',
      status: 'success'
    },
    {
      timestamp: '2023-05-13 16:45:18',
      action: 'System Backup',
      user: 'system',
      details: 'Completed nightly backup',
      status: 'success'
    }
  ];

  // DOM Elements
  const logsTableBody = document.getElementById('logsTableBody');
  const logFilter = document.getElementById('logFilter');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const searchInput = document.querySelector('.search-box input');

  // Current page state
  let currentPage = 1;
  const logsPerPage = 10;
  let filteredLogs = [...logData];

  // Initialize logs table
  function renderLogs() {
    logsTableBody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * logsPerPage;
    const endIndex = startIndex + logsPerPage;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    if (paginatedLogs.length === 0) {
      logsTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">No logs found</td>
        </tr>
      `;
      return;
    }
    
    paginatedLogs.forEach(log => {
      const row = document.createElement('tr');
      
      let statusClass = '';
      if (log.status === 'success') statusClass = 'status-success';
      else if (log.status === 'error') statusClass = 'status-error';
      else if (log.status === 'warning') statusClass = 'status-warning';
      
      row.innerHTML = `
        <td>${log.timestamp}</td>
        <td>${log.action}</td>
        <td>${log.user}</td>
        <td>${log.details}</td>
        <td><span class="log-status ${statusClass}">${log.status}</span></td>
      `;
      
      logsTableBody.appendChild(row);
    });
    
    updatePagination();
  }

  // Filter logs based on selected filter
  function filterLogs() {
    const filterValue = logFilter.value.toLowerCase();
    
    if (filterValue === 'all') {
      filteredLogs = [...logData];
    } else {
      filteredLogs = logData.filter(log => {
        return log.action.toLowerCase().includes(filterValue) || 
               log.details.toLowerCase().includes(filterValue);
      });
    }
    
    currentPage = 1;
    renderLogs();
  }

  // Search logs
  function searchLogs() {
    const searchTerm = searchInput.value.toLowerCase();
    
    filteredLogs = logData.filter(log => {
      return (
        log.action.toLowerCase().includes(searchTerm) ||
        log.user.toLowerCase().includes(searchTerm) ||
        log.details.toLowerCase().includes(searchTerm) ||
        log.timestamp.toLowerCase().includes(searchTerm)
      );
    });
    
    currentPage = 1;
    renderLogs();
  }

  // Update pagination buttons
  function updatePagination() {
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    document.querySelector('.page-info').textContent = `Page ${currentPage} of ${totalPages}`;
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
  }

  // Event listeners
  logFilter.addEventListener('change', filterLogs);
  searchInput.addEventListener('input', searchLogs);
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderLogs();
    }
  });
  nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderLogs();
    }
  });

  // Initial render
  renderLogs();
});