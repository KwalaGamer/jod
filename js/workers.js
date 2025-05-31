
document.addEventListener('DOMContentLoaded', function() {
    // Toggle mobile menu
    // Data Service Module (add at the top of workers.js)
// Modified DataService for localStorage-only operation
    const DataService = {
        async getWorkers() {
            return this.getWorkersFromLocalStorage();
        },

        async saveWorkers(workers) {
            this.saveWorkersToLocalStorage(workers);
            return true;
        },

        getWorkersFromLocalStorage() {
            const storedWorkers = localStorage.getItem('workers');
            return storedWorkers ? JSON.parse(storedWorkers) : [];
        },

        saveWorkersToLocalStorage(workers) {
            localStorage.setItem('workers', JSON.stringify(workers));
        },

        async deleteWorker(id) {
            const workers = this.getWorkersFromLocalStorage();
            const filtered = workers.filter(w => w.id !== id);
            this.saveWorkersToLocalStorage(filtered);
            return true;
        }
    };
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarLinks = document.querySelector('.navbar-links');
    
    navbarToggle.addEventListener('click', () => {
        navbarLinks.classList.toggle('active');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navbarToggle.contains(e.target) && !navbarLinks.contains(e.target)) {
            navbarLinks.classList.remove('active');
        }
    });
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeIcon = darkModeToggle.querySelector('i');
    
    darkModeToggle.addEventListener('click', () => {
        document.body.setAttribute('data-theme', 
            document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
        );
        
        // Save preference to localStorage
        localStorage.setItem('darkMode', 
            document.body.getAttribute('data-theme') === 'dark' ? 'enabled' : 'disabled'
        );
        
        // Update icon
        darkModeIcon.className = document.body.getAttribute('data-theme') === 'dark' ? 
            'fas fa-sun' : 'fas fa-moon';
    });
    
    // Initialize dark mode
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.setAttribute('data-theme', 'dark');
        darkModeIcon.className = 'fas fa-sun';
    }
    
    // User profile dropdown (would need additional HTML/CSS)
    const userProfile = document.querySelector('.user-profile');
    userProfile.addEventListener('click', () => {
        // Implement dropdown functionality here
        console.log('User profile clicked');
    });

    // DOM Elements
    const workerGrid = document.getElementById('workerGrid');
    const workerTableBody = document.getElementById('workerTableBody');
    const workerForm = document.getElementById('workerForm');
    const workerModal = document.getElementById('workerModal');
    const addWorkerBtn = document.getElementById('addWorkerBtn');
    const cancelWorkerBtn = document.getElementById('cancelWorker');
    const closeModalBtn = document.querySelector('.close');
    const workerSearch = document.getElementById('workerSearch');
    const gridViewBtn = document.getElementById('gridView');
    const listViewBtn = document.getElementById('listView');
    const totalWorkersEl = document.getElementById('totalWorkers');
    const activeWorkersEl = document.getElementById('activeWorkers');
    
    // Workers data
    let workers = [];
    let isEditing = false;
    let currentWorkerId = null;
    
    // Initialize
    loadWorkers();
    setupEventListeners();
    
    // Functions
    function setupEventListeners() {
        addWorkerBtn.addEventListener('click', openAddWorkerModal);
        cancelWorkerBtn.addEventListener('click', closeModal);
        closeModalBtn.addEventListener('click', closeModal);
        workerForm.addEventListener('submit', handleWorkerSubmit);
        workerSearch.addEventListener('input', filterWorkers);
        gridViewBtn.addEventListener('click', () => toggleView('grid'));
        listViewBtn.addEventListener('click', () => toggleView('list'));
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === workerModal) {
                closeModal();
            }
        });
    }
    
    async function loadWorkers() {
        try {
            workers = await DataService.getWorkers();
            updateWorkerStats();
            displayWorkers();
        } catch (error) {
            console.error('Error loading workers:', error);
            showNotification('Failed to load workers', 'error');
            workers = [];
            updateWorkerStats();
            displayWorkers();
        }
    }

    
    function updateWorkerStats() {
        totalWorkersEl.textContent = workers.length;
        
        // Count active workers (simple example - you might have a better way)
        const today = new Date().toISOString().split('T')[0];
        const activeCount = workers.filter(worker => {
            return worker.lastActive === today || worker.status === 'Active';
        }).length;
        
        activeWorkersEl.textContent = activeCount;
    }
    
    function displayWorkers() {
        workerGrid.innerHTML = '';
        workerTableBody.innerHTML = '';
        
        if (workers.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-state';
            emptyMessage.innerHTML = `
                <i class="fas fa-users-slash"></i>
                <h3>No Workers Found</h3>
                <p>Add your first worker to get started</p>
                <button id="addFirstWorker" class="btn-primary">Add Worker</button>
            `;
            workerGrid.appendChild(emptyMessage);
            
            document.getElementById('addFirstWorker').addEventListener('click', openAddWorkerModal);
            return;
        }
        
        workers.forEach(worker => {
            createWorkerCard(worker);
            createWorkerTableRow(worker);
        });
    }
    
    function createWorkerCard(worker) {
        const workerCard = document.createElement('div');
        workerCard.className = 'worker-card';
        
        // Determine status
        const isActive = worker.status === 'Active' || worker.lastActive === new Date().toISOString().split('T')[0];
        
        workerCard.innerHTML = `
            <div class="worker-photo">
                ${worker.photo ? 
                    `<img src="${worker.photo}" alt="${worker.name}">` : 
                    `<i class="fas fa-user"></i>`
                }
                <span class="worker-status ${isActive ? 'active' : 'inactive'}">
                    ${isActive ? 'Active' : 'Inactive'}
                </span>
            </div>
            <div class="worker-details">
                <h3 class="worker-name">${worker.name}</h3>
                <p class="worker-position">
                    <i class="fas fa-briefcase"></i> ${worker.position}
                </p>
                <div class="worker-info">
                    <div class="worker-info-item">
                        <i class="fas fa-phone"></i> ${worker.phone || 'N/A'}
                    </div>
                    <div class="worker-info-item">
                        <i class="fas fa-envelope"></i> ${worker.email || 'N/A'}
                    </div>
                    <div class="worker-info-item">
                        <i class="fas fa-dollar-sign"></i> ${worker.salary ? worker.salary.toFixed(2) : '0.00'}
                    </div>
                </div>
                <div class="worker-actions">
                    <button class="btn-icon edit-worker" data-id="${worker.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-worker" data-id="${worker.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        workerGrid.appendChild(workerCard);
        
        // Add event listeners to action buttons
        workerCard.querySelector('.edit-worker').addEventListener('click', () => editWorker(worker.id));
        workerCard.querySelector('.delete-worker').addEventListener('click', () => deleteWorker(worker.id));
    }
    
    function createWorkerTableRow(worker) {
        const row = document.createElement('tr');
        const isActive = worker.status === 'Active' || worker.lastActive === new Date().toISOString().split('T')[0];
        
        row.innerHTML = `
            <td>
                <div class="list-photo">
                    ${worker.photo ? 
                        `<img src="${worker.photo}" alt="${worker.name}">` : 
                        `<i class="fas fa-user"></i>`
                    }
                </div>
            </td>
            <td>${worker.name}</td>
            <td>${worker.position}</td>
            <td>${worker.phone || 'N/A'}</td>
            <td>
                <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}">
                    ${isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <button class="btn-icon edit-worker" data-id="${worker.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete-worker" data-id="${worker.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        workerTableBody.appendChild(row);
        
        // Add event listeners to action buttons
        row.querySelector('.edit-worker').addEventListener('click', () => editWorker(worker.id));
        row.querySelector('.delete-worker').addEventListener('click', () => deleteWorker(worker.id));
    }
    
    function openAddWorkerModal() {
        isEditing = false;
        currentWorkerId = null;
        document.getElementById('modalTitle').textContent = 'Add New Worker';
        workerForm.reset();
        document.getElementById('photoPreview').innerHTML = '';
        document.getElementById('workerJoinDate').valueAsDate = new Date();
        openModal();
    }
    
    function editWorker(id) {
        const worker = workers.find(w => w.id === id);
        if (!worker) return;
        
        isEditing = true;
        currentWorkerId = id;
        document.getElementById('modalTitle').textContent = 'Edit Worker';
        
        // Fill form with worker data
        document.getElementById('workerId').value = worker.id;
        document.getElementById('workerName').value = worker.name;
        document.getElementById('workerPosition').value = worker.position;
        document.getElementById('workerSalary').value = worker.salary;
        document.getElementById('workerPhone').value = worker.phone;
        document.getElementById('workerEmail').value = worker.email;
        document.getElementById('workerAddress').value = worker.address;
        document.getElementById('workerJoinDate').value = worker.joinDate;
        
        // Display photo if exists
        const photoPreview = document.getElementById('photoPreview');
        photoPreview.innerHTML = '';
        if (worker.photo) {
            const img = document.createElement('img');
            img.src = worker.photo;
            photoPreview.appendChild(img);
        }
        
        openModal();
    }
    
    async function handleWorkerSubmit(e) {
        e.preventDefault();
        
        const formData = {
            id: isEditing ? currentWorkerId : generateId(),
            name: document.getElementById('workerName').value,
            position: document.getElementById('workerPosition').value,
            salary: parseFloat(document.getElementById('workerSalary').value),
            phone: document.getElementById('workerPhone').value,
            email: document.getElementById('workerEmail').value,
            address: document.getElementById('workerAddress').value,
            joinDate: document.getElementById('workerJoinDate').value,
            lastActive: new Date().toISOString().split('T')[0],
            status: 'Active'
        };
        
        // Handle photo upload
        const photoInput = document.getElementById('workerPhoto');
        if (photoInput.files.length > 0) {
            const file = photoInput.files[0];
            formData.photo = await uploadPhoto(file);
        } else if (isEditing) {
            // Keep existing photo if not changed
            const existingWorker = workers.find(w => w.id === currentWorkerId);
            if (existingWorker && existingWorker.photo) {
                formData.photo = existingWorker.photo;
            }
        }
        
        try {
            if (isEditing) {
                // Update existing worker
                const index = workers.findIndex(w => w.id === currentWorkerId);
                if (index !== -1) {
                    workers[index] = formData;
                }
            } else {
                // Add new worker
                workers.push(formData);
            }
            
            // Save workers
            await DataService.saveWorkers(workers);
            
            updateWorkerStats();
            displayWorkers();
            closeModal();
            
            showNotification(
                isEditing ? 'Worker updated successfully' : 'Worker added successfully',
                'success'
            );
        } catch (error) {
            console.error('Error saving worker:', error);
            showNotification('Failed to save worker', 'error');
        }
    }

    
    function filterWorkers() {
        const searchTerm = workerSearch.value.toLowerCase();
        const filteredWorkers = workers.filter(worker => 
            worker.name.toLowerCase().includes(searchTerm) ||
            worker.position.toLowerCase().includes(searchTerm) ||
            (worker.phone && worker.phone.includes(searchTerm)) ||
            (worker.email && worker.email.toLowerCase().includes(searchTerm))
        );
        
        // Temporary display filtered workers
        if (searchTerm === '') {
            displayWorkers();
        } else {
            workerGrid.innerHTML = '';
            workerTableBody.innerHTML = '';
            
            filteredWorkers.forEach(worker => {
                createWorkerCard(worker);
                createWorkerTableRow(worker);
            });
        }
    }
    
    function toggleView(view) {
        if (view === 'grid') {
            // Show grid view
            workerGrid.classList.remove('hidden');
            workerList.classList.remove('active');
            
            // Update button states
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
        } else {
            // Show list view
            workerGrid.classList.add('hidden');
            workerList.classList.add('active');
            
            // Update button states
            gridViewBtn.classList.remove('active');
            listViewBtn.classList.add('active');
        }
    }
        
    function openModal() {
        workerModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        workerModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    function generateId() {
        return 'worker_' + Math.random().toString(36).substr(2, 9);
    }
    
    async function uploadPhoto(file) {
        // In a real app, you would upload to a server
        // For demo purposes, we'll create a local URL
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            reader.readAsDataURL(file);
        });
    }
    
    // Photo preview handler
    document.getElementById('workerPhoto').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoPreview = document.getElementById('photoPreview');
            photoPreview.innerHTML = '';
            const img = document.createElement('img');
            img.src = e.target.result;
            photoPreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
});

// Utility Functions
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

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

    // Data Service Module
const WorkerDataService = {
    // Initialize with sample data if empty
    async init() {
        const workers = this.getWorkers();
        if (workers.length === 0) {
            const sampleWorkers = [
                {
                    id: 'worker_1',
                    name: 'John Doe',
                    position: 'Manager',
                    salary: 5000,
                    phone: '123-456-7890',
                    email: 'john@example.com',
                    joinDate: '2023-01-15',
                    lastActive: new Date().toISOString().split('T')[0],
                    status: 'Active'
                },
                {
                    id: 'worker_2',
                    name: 'Jane Smith',
                    position: 'Supervisor',
                    salary: 4000,
                    phone: '987-654-3210',
                    email: 'jane@example.com',
                    joinDate: '2023-02-20',
                    lastActive: new Date().toISOString().split('T')[0],
                    status: 'Active'
                }
            ];
            this.saveWorkers(sampleWorkers);
        }
    },
        // Add this to WorkerDataService
    backupWorkers() {
        const workers = this.getWorkers();
        const blob = new Blob([JSON.stringify(workers)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workers_backup_${new Date().toISOString()}.json`;
        a.click();
    },

    restoreWorkers(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workers = JSON.parse(e.target.result);
                this.saveWorkers(workers);
                loadWorkers();
                showNotification('Workers restored successfully', 'success');
            } catch (error) {
                showNotification('Invalid backup file', 'error');
            }
        };
        reader.readAsText(file);
    },

    // Get all workers
    getWorkers() {
        const storedWorkers = localStorage.getItem('inventory_workers');
        return storedWorkers ? JSON.parse(storedWorkers) : [];
    },

    // Save all workers
    saveWorkers(workers) {
        localStorage.setItem('inventory_workers', JSON.stringify(workers));
    },

    // Add new worker
    addWorker(worker) {
        this.validateWorker(worker);
        const workers = this.getWorkers();
        workers.push(worker);
        this.saveWorkers(workers);
    },

    // Update existing worker
    updateWorker(updatedWorker) {
        const workers = this.getWorkers();
        const index = workers.findIndex(w => w.id === updatedWorker.id);
        if (index !== -1) {
            workers[index] = updatedWorker;
            this.saveWorkers(workers);
            return true;
        }
        return false;
    },

    // Delete worker
    deleteWorker(id) {
        const workers = this.getWorkers().filter(w => w.id !== id);
        this.saveWorkers(workers);
    },

    // Get worker by ID
    getWorker(id) {
        return this.getWorkers().find(w => w.id === id);
    }
};

// Initialize data service when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await WorkerDataService.init();
    loadWorkers();
    
    // Rest of your existing event listeners
    // ...
});

// Modified loadWorkers function
async function loadWorkers() {
    try {
        workers = WorkerDataService.getWorkers();
        updateWorkerStats();
        displayWorkers();
    } catch (error) {
        console.error('Error loading workers:', error);
        showNotification('Failed to load workers', 'error');
        workers = [];
        updateWorkerStats();
        displayWorkers();
    }
}

// Modified handleWorkerSubmit function
async function handleWorkerSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: isEditing ? currentWorkerId : generateId(),
        name: document.getElementById('workerName').value,
        position: document.getElementById('workerPosition').value,
        salary: parseFloat(document.getElementById('workerSalary').value),
        phone: document.getElementById('workerPhone').value,
        email: document.getElementById('workerEmail').value,
        address: document.getElementById('workerAddress').value,
        joinDate: document.getElementById('workerJoinDate').value,
        lastActive: new Date().toISOString().split('T')[0],
        status: 'Active'
    };
    
    // Handle photo upload
    const photoInput = document.getElementById('workerPhoto');
    if (photoInput.files.length > 0) {
        const file = photoInput.files[0];
        formData.photo = await uploadPhoto(file);
    } else if (isEditing) {
        // Keep existing photo if not changed
        const existingWorker = WorkerDataService.getWorker(currentWorkerId);
        if (existingWorker && existingWorker.photo) {
            formData.photo = existingWorker.photo;
        }
    }
    
    try {
        if (isEditing) {
            WorkerDataService.updateWorker(formData);
        } else {
            WorkerDataService.addWorker(formData);
        }
        
        loadWorkers(); // Refresh the display
        closeModal();
        
        showNotification(
            isEditing ? 'Worker updated successfully' : 'Worker added successfully',
            'success'
        );
    } catch (error) {
        console.error('Error saving worker:', error);
        showNotification('Failed to save worker', 'error');
    }
}

// Modified deleteWorker function
async function deleteWorker(id) {
    if (!confirm('Are you sure you want to delete this worker?')) return;
    
    try {
        WorkerDataService.deleteWorker(id);
        loadWorkers(); // Refresh the display
        showNotification('Worker deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting worker:', error);
        showNotification('Failed to delete worker', 'error');
    }
}

}