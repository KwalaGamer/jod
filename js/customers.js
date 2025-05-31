document.addEventListener('DOMContentLoaded', function() {
    // Initialize customers
    loadCustomers();
    
    // Add customer button
    const addCustomerBtn = document.getElementById('addCustomerBtn');
    if (addCustomerBtn) {
        addCustomerBtn.addEventListener('click', function() {
            openCustomerModal();
        });
    }
    
    // Form submission
    const customerForm = document.getElementById('customerForm');
    if (customerForm) {
        customerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveCustomer();
        });
    }
    
    // Search functionality
    const customerSearch = document.getElementById('customerSearch');
    if (customerSearch) {
        customerSearch.addEventListener('input', function() {
            filterCustomers();
        });
    }
    
    // Filter functionality
    const customerFilter = document.getElementById('customerFilter');
    if (customerFilter) {
        customerFilter.addEventListener('change', function() {
            filterCustomers();
        });
    }
    
    // Modal close buttons
    const closeModal = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancelCustomerBtn');
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            closeCustomerModal();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            closeCustomerModal();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('customerModal');
        if (event.target === modal) {
            closeCustomerModal();
        }
    });
});

function loadCustomers() {
    const customersGrid = document.getElementById('customersGrid');
    customersGrid.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading customers...</p>
        </div>
    `;
    
    // Try to load from server first
    fetch('/api/load?filename=customers.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(customers => {
            displayCustomers(customers);
        })
        .catch(error => {
            console.error('Failed to load from server, using localStorage:', error);
            // Fallback to localStorage if server fails
            const customers = JSON.parse(localStorage.getItem('customers')) || [];
            displayCustomers(customers);
        });
}

function displayCustomers(customers) {
    const customersGrid = document.getElementById('customersGrid');
    
    if (customers.length === 0) {
        customersGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-slash"></i>
                <h3>No Customers Found</h3>
                <p>You haven't added any customers yet.</p>
                <button id="addFirstCustomerBtn" class="btn-primary">
                    <i class="fas fa-plus"></i> Add Your First Customer
                </button>
            </div>
        `;
        
        const addFirstBtn = document.getElementById('addFirstCustomerBtn');
        if (addFirstBtn) {
            addFirstBtn.addEventListener('click', openCustomerModal);
        }
        return;
    }
    
    customersGrid.innerHTML = '';
    
    customers.forEach(customer => {
        const customerCard = document.createElement('div');
        customerCard.className = 'customer-card';
        customerCard.dataset.id = customer.id;
        
        const initials = customer.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        customerCard.innerHTML = `
            <div class="customer-avatar" style="background-color: ${getRandomColor()}">
                ${initials}
            </div>
            <div class="customer-info">
                <h3>${customer.name}</h3>
                <p><i class="fas fa-phone"></i> ${customer.phone}</p>
                ${customer.email ? `<p><i class="fas fa-envelope"></i> ${customer.email}</p>` : ''}
                ${customer.address ? `<p><i class="fas fa-map-marker-alt"></i> ${customer.address}</p>` : ''}
            </div>
            <div class="customer-meta">
                <span class="customer-since">Since ${new Date(customer.dateAdded).toLocaleDateString()}</span>
                <div class="customer-actions">
                    <button class="btn-icon edit-customer" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-customer" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners to action buttons
        customerCard.querySelector('.edit-customer').addEventListener('click', () => {
            openCustomerModal(customer);
        });
        
        customerCard.querySelector('.delete-customer').addEventListener('click', () => {
            deleteCustomer(customer.id);
        });
        
        customersGrid.appendChild(customerCard);
    });
}

function openCustomerModal(customer = null) {
    const modal = document.getElementById('customerModal');
    const form = document.getElementById('customerForm');
    const modalTitle = document.getElementById('modalTitle');
    
    if (customer) {
        // Edit mode
        modalTitle.textContent = 'Edit Customer';
        document.getElementById('customerId').value = customer.id;
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerPhone').value = customer.phone;
        document.getElementById('customerEmail').value = customer.email || '';
        document.getElementById('customerAddress').value = customer.address || '';
        document.getElementById('customerNotes').value = customer.notes || '';
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Customer';
        form.reset();
        document.getElementById('customerId').value = '';
    }
    
    modal.style.display = 'flex';
}

function closeCustomerModal() {
    document.getElementById('customerModal').style.display = 'none';
}

function saveCustomer() {
    const form = document.getElementById('customerForm');
    const customerId = document.getElementById('customerId').value;
    const isEditMode = customerId !== '';
    
    const customerData = {
        id: isEditMode ? customerId : Date.now().toString(),
        name: document.getElementById('customerName').value.trim(),
        phone: document.getElementById('customerPhone').value.trim(),
        email: document.getElementById('customerEmail').value.trim(),
        address: document.getElementById('customerAddress').value.trim(),
        notes: document.getElementById('customerNotes').value.trim(),
        dateAdded: isEditMode ? undefined : new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };
    
    // Validate required fields
    if (!customerData.name || !customerData.phone) {
        alert('Please fill all required fields (Name and Phone)');
        return;
    }
    
    // Try to save to server first
    fetch('/api/load?filename=customers.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(customers => {
            let updatedCustomers;
            
            if (isEditMode) {
                updatedCustomers = customers.map(c => 
                    c.id === customerId ? { ...c, ...customerData } : c
                );
            } else {
                updatedCustomers = [...customers, customerData];
            }
            
            return fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: 'customers.json',
                    data: updatedCustomers
                })
            });
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to save to server');
            return response.json();
        })
        .then(() => {
            // Update local storage as fallback
            const localCustomers = JSON.parse(localStorage.getItem('customers')) || [];
            let localUpdatedCustomers;
            
            if (isEditMode) {
                localUpdatedCustomers = localCustomers.map(c => 
                    c.id === customerId ? { ...c, ...customerData } : c
                );
            } else {
                localUpdatedCustomers = [...localCustomers, customerData];
            }
            
            localStorage.setItem('customers', JSON.stringify(localUpdatedCustomers));
            
            const action = isEditMode ? 'update' : 'add';
            addLog(`customer_${action}`, `${isEditMode ? 'Updated' : 'Added'} customer: ${customerData.name}`);
            
            loadCustomers();
            closeCustomerModal();
            
            showNotification(`Customer ${isEditMode ? 'updated' : 'added'} successfully!`, 'success');
        })
        .catch(error => {
            console.error('Error saving to server, using localStorage:', error);
            // Fallback to localStorage
            const customers = JSON.parse(localStorage.getItem('customers')) || [];
            let updatedCustomers;
            
            if (isEditMode) {
                updatedCustomers = customers.map(c => 
                    c.id === customerId ? { ...c, ...customerData } : c
                );
            } else {
                updatedCustomers = [...customers, customerData];
            }
            
            localStorage.setItem('customers', JSON.stringify(updatedCustomers));
            
            const action = isEditMode ? 'update' : 'add';
            addLog(`customer_${action}`, `${isEditMode ? 'Updated' : 'Added'} customer: ${customerData.name}`);
            
            loadCustomers();
            closeCustomerModal();
            
            showNotification(`Customer ${isEditMode ? 'updated' : 'added'} (saved locally)!`, 'success');
        });
}

function deleteCustomer(customerId) {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;
    
    // Try to delete from server first
    fetch('/api/load?filename=customers.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(customers => {
            const customerToDelete = customers.find(c => c.id === customerId);
            const updatedCustomers = customers.filter(c => c.id !== customerId);
            return Promise.all([
                fetch('/api/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        filename: 'customers.json',
                        data: updatedCustomers
                    })
                }),
                customerToDelete
            ]);
        })
        .then(([response, customerToDelete]) => {
            if (!response.ok) throw new Error('Failed to save to server');
            return customerToDelete;
        })
        .then(customerToDelete => {
            // Update local storage as fallback
            const customers = JSON.parse(localStorage.getItem('customers')) || [];
            const updatedCustomers = customers.filter(c => c.id !== customerId);
            localStorage.setItem('customers', JSON.stringify(updatedCustomers));
            
            addLog('customer_delete', `Deleted customer: ${customerToDelete.name}`);
            loadCustomers();
            
            showNotification('Customer deleted successfully!', 'success');
        })
        .catch(error => {
            console.error('Error deleting from server, using localStorage:', error);
            // Fallback to localStorage
            const customers = JSON.parse(localStorage.getItem('customers')) || [];
            const customerToDelete = customers.find(c => c.id === customerId);
            const updatedCustomers = customers.filter(c => c.id !== customerId);
            localStorage.setItem('customers', JSON.stringify(updatedCustomers));
            
            if (customerToDelete) {
                addLog('customer_delete', `Deleted customer: ${customerToDelete.name}`);
            }
            loadCustomers();
            
            showNotification('Customer deleted (saved locally)!', 'success');
        });
}

function filterCustomers() {
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
    const filterValue = document.getElementById('customerFilter').value;
    
    fetch('/api/load?filename=customers.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(customers => {
            let filtered = customers;
            
            // Apply search filter
            if (searchTerm) {
                filtered = filtered.filter(customer => 
                    customer.name.toLowerCase().includes(searchTerm) ||
                    (customer.email && customer.email.toLowerCase().includes(searchTerm)) ||
                    customer.phone.toLowerCase().includes(searchTerm)
                );
            }
            
            // Apply dropdown filter
            if (filterValue === 'recent') {
                filtered = filtered.sort((a, b) => 
                    new Date(b.dateAdded) - new Date(a.dateAdded)
                ).slice(0, 10);
            } else if (filterValue === 'active') {
                // This would need actual purchase data to be meaningful
                filtered = filtered.filter(customer => customer.lastPurchase);
            }
            
            displayCustomers(filtered);
        })
        .catch(() => {
            const customers = JSON.parse(localStorage.getItem('customers')) || [];
            displayCustomers(customers);
        });
}

function getRandomColor() {
    const colors = [
        '#6a0dad', '#4a0072', '#9c27b0', '#7b1fa2', '#ab47bc',
        '#5c6bc0', '#3949ab', '#303f9f', '#283593', '#1a237e'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <p>${message}</p>
        <span class="close-notification">&times;</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
    
    // Manual close
    notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    });
}