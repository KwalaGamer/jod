document.addEventListener('DOMContentLoaded', function() {
    // Initialize workers
    loadWorkers();
    
    // Add worker button
    const addWorkerBtn = document.getElementById('addWorkerBtn');
    if (addWorkerBtn) {
        addWorkerBtn.addEventListener('click', function() {
            openWorkerModal();
        });
    }
    
    // Form submission
    const workerForm = document.getElementById('workerForm');
    if (workerForm) {
        workerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveWorker();
        });
    }
    
    // Search functionality
    const workerSearch = document.getElementById('workerSearch');
    if (workerSearch) {
        workerSearch.addEventListener('input', function() {
            filterWorkers();
        });
    }
    
    // Filter functionality
    const workerFilter = document.getElementById('workerFilter');
    if (workerFilter) {
        workerFilter.addEventListener('change', function() {
            filterWorkers();
        });
    }
    
    // Modal close buttons
    const closeModal = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancelWorkerBtn');
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            closeWorkerModal();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            closeWorkerModal();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('workerModal');
        if (event.target === modal) {
            closeWorkerModal();
        }
    });
});

function loadWorkers() {
    const workersGrid = document.getElementById('workersGrid');
    workersGrid.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading workers...</p>
        </div>
    `;
    
    // Try to load from server first
    fetch('/api/load?filename=workers.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(workers => {
            displayWorkers(workers);
        })
        .catch(error => {
            console.error('Failed to load from server, using localStorage:', error);
            // Fallback to localStorage if server fails
            const workers = JSON.parse(localStorage.getItem('workers')) || [];
            displayWorkers(workers);
        });
}

function displayWorkers(workers) {
    const workersGrid = document.getElementById('workersGrid');
    
    if (workers.length === 0) {
        workersGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-hard-hat"></i>
                <h3>No Workers Found</h3>
                <p>You haven't added any workers yet.</p>
                <button id="addFirstWorkerBtn" class="btn-primary">
                    <i class="fas fa-plus"></i> Add Your First Worker
                </button>
            </div>
        `;
        
        const addFirstBtn = document.getElementById('addFirstWorkerBtn');
        if (addFirstBtn) {
            addFirstBtn.addEventListener('click', openWorkerModal);
        }
        return;
    }
    
    workersGrid.innerHTML = '';
    
    workers.forEach(worker => {
        const workerCard = document.createElement('div');
        workerCard.className = 'worker-card';
        workerCard.dataset.id = worker.id;
        
        const initials = worker.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const statusClass = worker.status === 'active' ? 'active' : 
                          worker.status === 'on_leave' ? 'on-leave' : 'inactive';
        
        workerCard.innerHTML = `
            <div class="worker-avatar ${statusClass}" style="background-color: ${getRandomColor()}">
                ${initials}
            </div>
            <div class="worker-info">
                <h3>${worker.name}</h3>
                <p class="worker-position"><i class="fas fa-briefcase"></i> ${worker.position}</p>
                <p><i class="fas fa-phone"></i> ${worker.phone}</p>
                ${worker.email ? `<p><i class="fas fa-envelope"></i> ${worker.email}</p>` : ''}
                ${worker.hireDate ? `<p><i class="fas fa-calendar-alt"></i> Hired: ${new Date(worker.hireDate).toLocaleDateString()}</p>` : ''}
            </div>
            <div class="worker-meta">
                <span class="worker-status ${statusClass}">
                    ${worker.status.replace('_', ' ').toUpperCase()}
                </span>
                <div class="worker-actions">
                    <button class="btn-icon edit-worker" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-worker" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners to action buttons
        workerCard.querySelector('.edit-worker').addEventListener('click', () => {
            openWorkerModal(worker);
        });
        
        workerCard.querySelector('.delete-worker').addEventListener('click', () => {
            deleteWorker(worker.id);
        });
        
        workersGrid.appendChild(workerCard);
    });
}

function openWorkerModal(worker = null) {
    const modal = document.getElementById('workerModal');
    const form = document.getElementById('workerForm');
    const modalTitle = document.getElementById('workerModalTitle');
    
    if (worker) {
        // Edit mode
        modalTitle.textContent = 'Edit Worker';
        document.getElementById('workerId').value = worker.id;
        document.getElementById('workerName').value = worker.name;
        document.getElementById('workerPosition').value = worker.position;
        document.getElementById('workerPhone').value = worker.phone;
        document.getElementById('workerEmail').value = worker.email || '';
        document.getElementById('workerHireDate').value = worker.hireDate || '';
        document.getElementById('workerStatus').value = worker.status || 'active';
        document.getElementById('workerAddress').value = worker.address || '';
        document.getElementById('workerNotes').value = worker.notes || '';
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Worker';
        form.reset();
        document.getElementById('workerId').value = '';
        document.getElementById('workerHireDate').value = new Date().toISOString().split('T')[0];
    }
    
    modal.style.display = 'flex';
}

function closeWorkerModal() {
    document.getElementById('workerModal').style.display = 'none';
}

function saveWorker() {
    const form = document.getElementById('workerForm');
    const workerId = document.getElementById('workerId').value;
    const isEditMode = workerId !== '';
    
    const workerData = {
        id: isEditMode ? workerId : Date.now().toString(),
        name: document.getElementById('workerName').value.trim(),
        position: document.getElementById('workerPosition').value.trim(),
        phone: document.getElementById('workerPhone').value.trim(),
        email: document.getElementById('workerEmail').value.trim(),
        hireDate: document.getElementById('workerHireDate').value,
        status: document.getElementById('workerStatus').value,
        address: document.getElementById('workerAddress').value.trim(),
        notes: document.getElementById('workerNotes').value.trim(),
        dateAdded: isEditMode ? undefined : new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };
    
    // Validate required fields
    if (!workerData.name || !workerData.position || !workerData.phone) {
        showNotification('Please fill all required fields (Name, Position and Phone)', 'error');
        return;
    }
    
    // Try to save to server first
    fetch('/api/load?filename=workers.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(workers => {
            let updatedWorkers;
            
            if (isEditMode) {
                updatedWorkers = workers.map(w => 
                    w.id === workerId ? { ...w, ...workerData } : w
                );
            } else {
                updatedWorkers = [...workers, workerData];
            }
            
            return fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: 'workers.json',
                    data: updatedWorkers
                })
            });
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to save to server');
            return response.json();
        })
        .then(() => {
            // Update local storage as fallback
            const localWorkers = JSON.parse(localStorage.getItem('workers')) || [];
            let localUpdatedWorkers;
            
            if (isEditMode) {
                localUpdatedWorkers = localWorkers.map(w => 
                    w.id === workerId ? { ...w, ...workerData } : w
                );
            } else {
                localUpdatedWorkers = [...localWorkers, workerData];
            }
            
            localStorage.setItem('workers', JSON.stringify(localUpdatedWorkers));
            
            const action = isEditMode ? 'update' : 'add';
            addLog(`worker_${action}`, `${isEditMode ? 'Updated' : 'Added'} worker: ${workerData.name}`);
            
            loadWorkers();
            closeWorkerModal();
            
            showNotification(`Worker ${isEditMode ? 'updated' : 'added'} successfully!`, 'success');
        })
        .catch(error => {
            console.error('Error saving to server, using localStorage:', error);
            // Fallback to localStorage
            const workers = JSON.parse(localStorage.getItem('workers')) || [];
            let updatedWorkers;
            
            if (isEditMode) {
                updatedWorkers = workers.map(w => 
                    w.id === workerId ? { ...w, ...workerData } : w
                );
            } else {
                updatedWorkers = [...workers, workerData];
            }
            
            localStorage.setItem('workers', JSON.stringify(updatedWorkers));
            
            const action = isEditMode ? 'update' : 'add';
            addLog(`worker_${action}`, `${isEditMode ? 'Updated' : 'Added'} worker: ${workerData.name}`);
            
            loadWorkers();
            closeWorkerModal();
            
            showNotification(`Worker ${isEditMode ? 'updated' : 'added'} (saved locally)!`, 'success');
        });
}

function deleteWorker(workerId) {
    if (!confirm('Are you sure you want to delete this worker? This action cannot be undone.')) return;
    
    // Try to delete from server first
    fetch('/api/load?filename=workers.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(workers => {
            const workerToDelete = workers.find(w => w.id === workerId);
            const updatedWorkers = workers.filter(w => w.id !== workerId);
            return Promise.all([
                fetch('/api/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        filename: 'workers.json',
                        data: updatedWorkers
                    })
                }),
                workerToDelete
            ]);
        })
        .then(([response, workerToDelete]) => {
            if (!response.ok) throw new Error('Failed to save to server');
            return workerToDelete;
        })
        .then(workerToDelete => {
            // Update local storage as fallback
            const workers = JSON.parse(localStorage.getItem('workers')) || [];
            const updatedWorkers = workers.filter(w => w.id !== workerId);
            localStorage.setItem('workers', JSON.stringify(updatedWorkers));
            
            addLog('worker_delete', `Deleted worker: ${workerToDelete.name}`);
            loadWorkers();
            
            showNotification('Worker deleted successfully!', 'success');
        })
        .catch(error => {
            console.error('Error deleting from server, using localStorage:', error);
            // Fallback to localStorage
            const workers = JSON.parse(localStorage.getItem('workers')) || [];
            const workerToDelete = workers.find(w => w.id === workerId);
            const updatedWorkers = workers.filter(w => w.id !== workerId);
            localStorage.setItem('workers', JSON.stringify(updatedWorkers));
            
            if (workerToDelete) {
                addLog('worker_delete', `Deleted worker: ${workerToDelete.name}`);
            }
            loadWorkers();
            
            showNotification('Worker deleted (saved locally)!', 'success');
        });
}

function filterWorkers() {
    const searchTerm = document.getElementById('workerSearch').value.toLowerCase();
    const filterValue = document.getElementById('workerFilter').value;
    
    fetch('/api/load?filename=workers.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(workers => {
            let filtered = workers;
            
            // Apply search filter
            if (searchTerm) {
                filtered = filtered.filter(worker => 
                    worker.name.toLowerCase().includes(searchTerm) ||
                    (worker.email && worker.email.toLowerCase().includes(searchTerm)) ||
                    worker.phone.toLowerCase().includes(searchTerm) ||
                    worker.position.toLowerCase().includes(searchTerm)
                );
            }
            
            // Apply dropdown filter
            if (filterValue === 'active') {
                filtered = filtered.filter(worker => worker.status === 'active');
            } else if (filterValue === 'inactive') {
                filtered = filtered.filter(worker => worker.status === 'inactive');
            }
            
            displayWorkers(filtered);
        })
        .catch(() => {
            const workers = JSON.parse(localStorage.getItem('workers')) || [];
            displayWorkers(workers);
        });
}

// ... (previous code remains the same until saveWorker function)

function saveWorker() {
    const form = document.getElementById('workerForm');
    const workerId = document.getElementById('workerId').value;
    const isEditMode = workerId !== '';

    const workerData = {
        id: isEditMode ? workerId : Date.now().toString(),
        name: document.getElementById('workerName').value.trim(),
        position: document.getElementById('workerPosition').value.trim(),
        phone: document.getElementById('workerPhone').value.trim(),
        email: document.getElementById('workerEmail').value.trim(),
        hireDate: document.getElementById('workerHireDate').value || new Date().toISOString().split('T')[0],
        status: document.getElementById('workerStatus').value,
        address: document.getElementById('workerAddress').value.trim(),
        notes: document.getElementById('workerNotes').value.trim(),
        dateAdded: isEditMode ? undefined : new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };

    // Validate required fields
    if (!workerData.name || !workerData.position || !workerData.phone) {
        showNotification('Please fill all required fields (Name, Position and Phone)', 'error');
        return;
    }

    // First try to get current workers from localStorage as fallback
    let currentWorkers = JSON.parse(localStorage.getItem('workers')) || [];
    
    // Try to save to server first
    fetch('/api/load?filename=workers.json')
        .then(response => {
            if (response.ok) return response.json();
            throw new Error('Network response was not ok');
        })
        .then(workers => {
            currentWorkers = workers; // Use server data if available
            let updatedWorkers;
            
            if (isEditMode) {
                updatedWorkers = currentWorkers.map(w => 
                    w.id === workerId ? { ...w, ...workerData } : w
                );
            } else {
                updatedWorkers = [...currentWorkers, workerData];
            }
            
            return fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: 'workers.json',
                    data: updatedWorkers
                })
            });
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to save to server');
            
            // Update local storage in either case
            let localUpdatedWorkers;
            if (isEditMode) {
                localUpdatedWorkers = currentWorkers.map(w => 
                    w.id === workerId ? { ...w, ...workerData } : w
                );
            } else {
                localUpdatedWorkers = [...currentWorkers, workerData];
            }
            
            localStorage.setItem('workers', JSON.stringify(localUpdatedWorkers));
            
            const action = isEditMode ? 'update' : 'add';
            addLog(`worker_${action}`, `${isEditMode ? 'Updated' : 'Added'} worker: ${workerData.name}`);
            
            loadWorkers();
            closeWorkerModal();
            
            showNotification(`Worker ${isEditMode ? 'updated' : 'added'} successfully!`, 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            // Fallback to localStorage
            let updatedWorkers;
            if (isEditMode) {
                updatedWorkers = currentWorkers.map(w => 
                    w.id === workerId ? { ...w, ...workerData } : w
                );
            } else {
                updatedWorkers = [...currentWorkers, workerData];
            }
            
            localStorage.setItem('workers', JSON.stringify(updatedWorkers));
            
            const action = isEditMode ? 'update' : 'add';
            addLog(`worker_${action}`, `${isEditMode ? 'Updated' : 'Added'} worker: ${workerData.name}`);
            
            loadWorkers();
            closeWorkerModal();
            
            showNotification(`Worker ${isEditMode ? 'updated' : 'added'} (saved locally)!`, 'success');
        });
}

// ... (rest of the code remains the same)