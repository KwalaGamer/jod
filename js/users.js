document.addEventListener('DOMContentLoaded', function() {
  // Sample user data
  const userData = [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      lastActive: '2023-05-15 09:45:22',
      permissions: ['inventory', 'reports', 'users', 'settings']
    },
    {
      id: 2,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      lastActive: '2023-05-15 09:45:22',
      permissions: ['inventory', 'reports', 'users', 'settings']
    },
  ];

  // DOM Elements
  const usersGrid = document.getElementById('usersGrid');
  const addUserBtn = document.getElementById('addUserBtn');
  const userModal = document.getElementById('userModal');
  const closeModal = document.querySelector('.close');
  const cancelUser = document.getElementById('cancelUser');
  const userForm = document.getElementById('userForm');
  const modalTitle = document.getElementById('modalTitle');
  const searchInput = document.querySelector('.search-box input');
  const prevPageBtn = document.getElementById('prevUserPage');
  const nextPageBtn = document.getElementById('nextUserPage');

  // Current page state
  let currentPage = 1;
  const usersPerPage = 8;
  let filteredUsers = [...userData];
  let isEditing = false;
  let currentUserId = null;

  // Initialize users grid
  function renderUsers() {
    usersGrid.innerHTML = '';
    
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    if (paginatedUsers.length === 0) {
      usersGrid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-users-slash"></i>
          <h3>No users found</h3>
          <button class="btn btn-primary" id="addFirstUser">Add User</button>
        </div>
      `;
      document.getElementById('addFirstUser')?.addEventListener('click', openAddUserModal);
      return;
    }
    
    paginatedUsers.forEach(user => {
      const userCard = document.createElement('div');
      userCard.className = 'user-card';
      
      const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
      const statusClass = user.status === 'active' ? 'status-active' : 'status-inactive';
      
      userCard.innerHTML = `
        <div class="user-header">
          <div class="user-avatar">${initials}</div>
          <div class="user-info">
            <h3>${user.name}</h3>
            <p>${user.email}</p>
          </div>
        </div>
        <div class="user-details">
          <div class="detail-row">
            <span class="detail-label">Role:</span>
            <span class="detail-value">${user.role}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value ${statusClass}">${user.status}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Last Active:</span>
            <span class="detail-value">${user.lastActive}</span>
          </div>
        </div>
        <div class="user-actions">
          <button class="btn btn-outline edit-user" data-id="${user.id}">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-outline delete-user" data-id="${user.id}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      `;
      
      usersGrid.appendChild(userCard);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-user').forEach(btn => {
      btn.addEventListener('click', () => editUser(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-user').forEach(btn => {
      btn.addEventListener('click', () => deleteUser(btn.dataset.id));
    });
    
    updatePagination();
  }

  // Search users
  function searchUsers() {
    const searchTerm = searchInput.value.toLowerCase();
    
    filteredUsers = userData.filter(user => {
      return (
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm)
      );
    });
    
    currentPage = 1;
    renderUsers();
  }

  // Update pagination buttons
  function updatePagination() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    document.querySelector('.page-info').textContent = `Page ${currentPage} of ${totalPages}`;
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
  }

  // Modal functions
  function openAddUserModal() {
    isEditing = false;
    currentUserId = null;
    modalTitle.textContent = 'Add New User';
    userForm.reset();
    userModal.style.display = 'flex';
  }

  function editUser(userId) {
    const user = userData.find(u => u.id == userId);
    if (!user) return;
    
    isEditing = true;
    currentUserId = userId;
    modalTitle.textContent = 'Edit User';
    
    // Fill form with user data
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userStatus').value = user.status;
    
    // Clear all checkboxes first
    document.querySelectorAll('input[name="permissions"]').forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // Check the user's permissions
    user.permissions.forEach(permission => {
      const checkbox = document.querySelector(`input[name="permissions"][value="${permission}"]`);
      if (checkbox) checkbox.checked = true;
    });
    
    userModal.style.display = 'flex';
  }

  function closeUserModal() {
    userModal.style.display = 'none';
  }

  function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    // In a real app, you would make an API call here
    const index = userData.findIndex(u => u.id == userId);
    if (index !== -1) {
      userData.splice(index, 1);
      renderUsers();
      showNotification('User deleted successfully', 'success');
    }
  }

  // Handle form submission
  userForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
      id: isEditing ? currentUserId : userData.length + 1,
      name: document.getElementById('userName').value,
      email: document.getElementById('userEmail').value,
      role: document.getElementById('userRole').value,
      status: document.getElementById('userStatus').value,
      lastActive: new Date().toISOString().split('T')[0] + ' ' + 
                  new Date().toLocaleTimeString('en-US', {hour12: false}),
      permissions: Array.from(document.querySelectorAll('input[name="permissions"]:checked'))
                      .map(checkbox => checkbox.value)
    };
    
    if (isEditing) {
      // Update existing user
      const index = userData.findIndex(u => u.id == currentUserId);
      if (index !== -1) {
        userData[index] = formData;
      }
    } else {
      // Add new user
      userData.push(formData);
    }
    
    renderUsers();
    closeUserModal();
    showNotification(
      isEditing ? 'User updated successfully' : 'User added successfully',
      'success'
    );
  });

  // Event listeners
  addUserBtn.addEventListener('click', openAddUserModal);
  closeModal.addEventListener('click', closeUserModal);
  cancelUser.addEventListener('click', closeUserModal);
  searchInput.addEventListener('input', searchUsers);
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderUsers();
    }
  });
  nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderUsers();
    }
  });

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === userModal) {
      closeUserModal();
    }
  });

  // Initial render
  renderUsers();
});

// Notification function
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 
                   type === 'error' ? 'times-circle' : 
                   type === 'warning' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}