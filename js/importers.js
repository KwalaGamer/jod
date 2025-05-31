document.addEventListener('DOMContentLoaded', function() {
    // Initialize importers
    loadImporters();
    
    // Tab functionality
    setupImporterTabs();
    
    // Add importer button
    const addImporterBtn = document.getElementById('addImporterBtn');
    if (addImporterBtn) {
        addImporterBtn.addEventListener('click', function() {
            openImporterModal();
        });
    }
    
    // Form submission
    const importerForm = document.getElementById('importerForm');
    if (importerForm) {
        importerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveImporter();
        });
    }
    
    // Stock Import Form submission
    const stockImportForm = document.getElementById('stockImportForm');
    if (stockImportForm) {
        stockImportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            recordStockImport();
        });
    }
    
    // Modal close buttons
    const closeModal = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancelImporterBtn');
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            closeImporterModal();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            closeImporterModal();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('importerModal');
        if (event.target === modal) {
            closeImporterModal();
        }
    });
});

function setupImporterTabs() {
    const tabs = document.querySelectorAll('.importer-tabs .tab-button');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Hide all tab contents and deactivate all tabs
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.importer-tabs .tab-button').forEach(t => t.classList.remove('active'));
            
            // Activate current tab
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId).classList.add('active');
            
            // Load content for the active tab
            if (this.id === 'stockImportTab') {
                loadStockImportTab();
            }
        });
    });
}

function loadStockImportTab() {
    const tabContent = document.getElementById('stock-import-tab');
    const formContainer = tabContent.querySelector('.import-form-container');
    const historyContainer = tabContent.querySelector('.import-history');
    const loader = tabContent.querySelector('.full-page-loader');
    
    // Show loader while loading
    formContainer.style.display = 'none';
    historyContainer.style.display = 'none';
    loader.style.display = 'flex';
    
    // Load required data
    Promise.all([
        loadProductsForImport(),
        loadImportersForImport(),
        loadImportHistory()
    ]).then(() => {
        // Hide loader and show content
        loader.style.display = 'none';
        formContainer.style.display = 'block';
        historyContainer.style.display = 'block';
    }).catch(error => {
        console.error('Error loading stock import tab:', error);
        loader.style.display = 'none';
        formContainer.style.display = 'block';
        historyContainer.style.display = 'block';
        showNotification('Error loading data. Using local storage.', 'error');
    });
}

function loadImporters() {
    const importersGrid = document.getElementById('importersGrid');
    importersGrid.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading importers...</p>
        </div>
    `;
    
    // Try to load from server first
    fetch('/api/load?filename=importers.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(importers => {
            displayImporters(importers);
        })
        .catch(error => {
            console.error('Failed to load from server, using localStorage:', error);
            // Fallback to localStorage if server fails
            try {
                const importers = JSON.parse(localStorage.getItem('importers')) || [];
                displayImporters(importers);
            } catch (e) {
                console.error('Error parsing localStorage data:', e);
                displayImporters([]);
            }
        });
}

function displayImporters(importers) {
    const importersGrid = document.getElementById('importersGrid');
    
    // if (!importers || importers.length === 0) {
    //     importersGrid.innerHTML = `
    //         <div class="empty-state">
    //             <i class="fas fa-truck"></i>
    //             <h3>No Importers Found</h3>
    //             <p>You haven't added any importers yet.</p>
    //             <button id="addFirstImporterBtn" class="btn-primary">
    //                 <i class="fas fa-plus"></i> Add Your First Importer
    //             </button>
    //         </div>
    //     `;
        
    //     const addFirstBtn = document.getElementById('addFirstImporterBtn');
    //     if (addFirstBtn) {
    //         addFirstBtn.addEventListener('click', openImporterModal);
    //     }
    //     return;
    // }
    
    importersGrid.innerHTML = '';
    
    importers.forEach(importer => {
        const importerCard = document.createElement('div');
        importerCard.className = 'importer-card';
        importerCard.dataset.id = importer.id;
        
        const statusClass = importer.status === 'active' ? 'active' : 'inactive';
        
        importerCard.innerHTML = `
            <div class="importer-logo ${statusClass}">
                <i class="fas fa-truck"></i>
            </div>
            <div class="importer-info">
                <h3>${importer.name}</h3>
                <p class="importer-country"><i class="fas fa-globe"></i> ${importer.country}</p>
                <p><i class="fas fa-user"></i> ${importer.contactPerson}</p>
                <p><i class="fas fa-phone"></i> ${importer.phone}</p>
                ${importer.email ? `<p><i class="fas fa-envelope"></i> ${importer.email}</p>` : ''}
                ${importer.leadTime ? `<p><i class="fas fa-clock"></i> Lead Time: ${importer.leadTime} days</p>` : ''}
            </div>
            <div class="importer-meta">
                <span class="importer-status ${statusClass}">
                    ${importer.status.toUpperCase()}
                </span>
                <div class="importer-actions">
                    <button class="btn-icon edit-importer" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-importer" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners to action buttons
        importerCard.querySelector('.edit-importer').addEventListener('click', () => {
            openImporterModal(importer);
        });
        
        importerCard.querySelector('.delete-importer').addEventListener('click', () => {
            deleteImporter(importer.id);
        });
        
        importersGrid.appendChild(importerCard);
    });
}

function openImporterModal(importer = null) {
    const modal = document.getElementById('importerModal');
    const form = document.getElementById('importerForm');
    const modalTitle = document.getElementById('importerModalTitle');
    
    if (importer) {
        // Edit mode
        modalTitle.textContent = 'Edit Importer';
        document.getElementById('importerId').value = importer.id;
        document.getElementById('importerName').value = importer.name;
        document.getElementById('importerContactPerson').value = importer.contactPerson;
        document.getElementById('importerPhone').value = importer.phone;
        document.getElementById('importerEmail').value = importer.email || '';
        document.getElementById('importerCountry').value = importer.country;
        document.getElementById('importerAddress').value = importer.address || '';
        document.getElementById('importerStatus').value = importer.status || 'active';
        document.getElementById('importerLeadTime').value = importer.leadTime || '';
        document.getElementById('importerNotes').value = importer.notes || '';
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Importer';
        form.reset();
        document.getElementById('importerId').value = '';
    }
    
    modal.style.display = 'flex';
}

function closeImporterModal() {
    document.getElementById('importerModal').style.display = 'none';
}

function saveImporter() {
    const form = document.getElementById('importerForm');
    const importerId = document.getElementById('importerId').value;
    const isEditMode = importerId !== '';
    
    const importerData = {
        id: isEditMode ? importerId : Date.now().toString(),
        name: document.getElementById('importerName').value.trim(),
        contactPerson: document.getElementById('importerContactPerson').value.trim(),
        phone: document.getElementById('importerPhone').value.trim(),
        email: document.getElementById('importerEmail').value.trim(),
        country: document.getElementById('importerCountry').value.trim(),
        address: document.getElementById('importerAddress').value.trim(),
        status: document.getElementById('importerStatus').value,
        leadTime: document.getElementById('importerLeadTime').value,
        notes: document.getElementById('importerNotes').value.trim(),
        dateAdded: isEditMode ? undefined : new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };
    
    // Validate required fields
    if (!importerData.name || !importerData.contactPerson || !importerData.phone || !importerData.country) {
        showNotification('Please fill all required fields (Company Name, Contact Person, Phone and Country)', 'error');
        return;
    }
    
    // Try to save to server first
    fetch('/api/load?filename=importers.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(importers => {
            let updatedImporters;
            
            if (isEditMode) {
                updatedImporters = importers.map(i => 
                    i.id === importerId ? { ...i, ...importerData } : i
                );
            } else {
                updatedImporters = [...importers, importerData];
            }
            
            return fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: 'importers.json',
                    data: updatedImporters
                })
            });
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to save to server');
            return response.json();
        })
        .then(() => {
            // Update local storage as fallback
            const localImporters = JSON.parse(localStorage.getItem('importers')) || [];
            let localUpdatedImporters;
            
            if (isEditMode) {
                localUpdatedImporters = localImporters.map(i => 
                    i.id === importerId ? { ...i, ...importerData } : i
                );
            } else {
                localUpdatedImporters = [...localImporters, importerData];
            }
            
            localStorage.setItem('importers', JSON.stringify(localUpdatedImporters));
            
            const action = isEditMode ? 'update' : 'add';
            addLog(`importer_${action}`, `${isEditMode ? 'Updated' : 'Added'} importer: ${importerData.name}`);
            
            loadImporters();
            closeImporterModal();
            
            showNotification(`Importer ${isEditMode ? 'updated' : 'added'} successfully!`, 'success');
        })
        .catch(error => {
            console.error('Error saving to server, using localStorage:', error);
            // Fallback to localStorage
            const importers = JSON.parse(localStorage.getItem('importers')) || [];
            let updatedImporters;
            
            if (isEditMode) {
                updatedImporters = importers.map(i => 
                    i.id === importerId ? { ...i, ...importerData } : i
                );
            } else {
                updatedImporters = [...importers, importerData];
            }
            
            localStorage.setItem('importers', JSON.stringify(updatedImporters));
            
            const action = isEditMode ? 'update' : 'add';
            addLog(`importer_${action}`, `${isEditMode ? 'Updated' : 'Added'} importer: ${importerData.name}`);
            
            loadImporters();
            closeImporterModal();
            
            showNotification(`Importer ${isEditMode ? 'updated' : 'added'} (saved locally)!`, 'success');
        });
}

function deleteImporter(importerId) {
    if (!confirm('Are you sure you want to delete this importer? This action cannot be undone.')) return;
    
    // Try to delete from server first
    fetch('/api/load?filename=importers.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(importers => {
            const importerToDelete = importers.find(i => i.id === importerId);
            const updatedImporters = importers.filter(i => i.id !== importerId);
            return Promise.all([
                fetch('/api/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        filename: 'importers.json',
                        data: updatedImporters
                    })
                }),
                importerToDelete
            ]);
        })
        .then(([response, importerToDelete]) => {
            if (!response.ok) throw new Error('Failed to save to server');
            return importerToDelete;
        })
        .then(importerToDelete => {
            // Update local storage as fallback
            const importers = JSON.parse(localStorage.getItem('importers')) || [];
            const updatedImporters = importers.filter(i => i.id !== importerId);
            localStorage.setItem('importers', JSON.stringify(updatedImporters));
            
            addLog('importer_delete', `Deleted importer: ${importerToDelete.name}`);
            loadImporters();
            
            showNotification('Importer deleted successfully!', 'success');
        })
        .catch(error => {
            console.error('Error deleting from server, using localStorage:', error);
            // Fallback to localStorage
            const importers = JSON.parse(localStorage.getItem('importers')) || [];
            const importerToDelete = importers.find(i => i.id === importerId);
            const updatedImporters = importers.filter(i => i.id !== importerId);
            localStorage.setItem('importers', JSON.stringify(updatedImporters));
            
            if (importerToDelete) {
                addLog('importer_delete', `Deleted importer: ${importerToDelete.name}`);
            }
            loadImporters();
            
            showNotification('Importer deleted (saved locally)!', 'success');
        });
}

function filterImporters() {
    const searchTerm = document.getElementById('importerSearch').value.toLowerCase();
    const filterValue = document.getElementById('importerFilter').value;
    
    fetch('/api/load?filename=importers.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(importers => {
            let filtered = importers;
            
            // Apply search filter
            if (searchTerm) {
                filtered = filtered.filter(importer => 
                    importer.name.toLowerCase().includes(searchTerm) ||
                    (importer.email && importer.email.toLowerCase().includes(searchTerm)) ||
                    importer.phone.toLowerCase().includes(searchTerm) ||
                    importer.contactPerson.toLowerCase().includes(searchTerm) ||
                    importer.country.toLowerCase().includes(searchTerm)
                );
            }
            
            // Apply dropdown filter
            if (filterValue === 'active') {
                filtered = filtered.filter(importer => importer.status === 'active');
            } else if (filterValue === 'inactive') {
                filtered = filtered.filter(importer => importer.status === 'inactive');
            }
            
            displayImporters(filtered);
        })
        .catch(() => {
            const importers = JSON.parse(localStorage.getItem('importers')) || [];
            displayImporters(importers);
        });
}

// New functions for stock import
function loadProductsForImport() {
    return new Promise((resolve, reject) => {
        fetch('/api/load?filename=inventory.json')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(items => {
                const productSelects = document.querySelectorAll('.import-product');
                
                productSelects.forEach(select => {
                    const currentValue = select.value;
                    select.innerHTML = '<option value="">Select Product</option>';
                    
                    items.filter(item => item.type === 'product').forEach(item => {
                        const option = document.createElement('option');
                        option.value = item.id;
                        option.textContent = `${item.name} (${item.quantity} ${item.unit} available)`;
                        option.dataset.unit = item.unit;
                        select.appendChild(option);
                    });
                    
                    if (currentValue) {
                        select.value = currentValue;
                    }
                });
                resolve();
            })
            .catch(error => {
                console.error('Error loading products from server, using localStorage:', error);
                const items = JSON.parse(localStorage.getItem('inventory')) || [];
                const productSelects = document.querySelectorAll('.import-product');
                
                productSelects.forEach(select => {
                    const currentValue = select.value;
                    select.innerHTML = '<option value="">Select Product</option>';
                    
                    items.filter(item => item.type === 'product').forEach(item => {
                        const option = document.createElement('option');
                        option.value = item.id;
                        option.textContent = `${item.name} (${item.quantity} ${item.unit} available)`;
                        option.dataset.unit = item.unit;
                        select.appendChild(option);
                    });
                    
                    if (currentValue) {
                        select.value = currentValue;
                    }
                });
                resolve();
            });
    });
}

function loadImportersForImport() {
    return new Promise((resolve, reject) => {
        fetch('/api/load?filename=importers.json')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(importers => {
                const importerSelect = document.getElementById('importImporter');
                const currentValue = importerSelect.value;
                importerSelect.innerHTML = '<option value="">Select Importer</option>';
                
                importers.forEach(importer => {
                    const option = document.createElement('option');
                    option.value = importer.id;
                    option.textContent = importer.name;
                    importerSelect.appendChild(option);
                });
                
                if (currentValue) {
                    importerSelect.value = currentValue;
                }
                resolve();
            })
            .catch(error => {
                console.error('Error loading importers from server, using localStorage:', error);
                const importers = JSON.parse(localStorage.getItem('importers')) || [];
                const importerSelect = document.getElementById('importImporter');
                const currentValue = importerSelect.value;
                importerSelect.innerHTML = '<option value="">Select Importer</option>';
                
                importers.forEach(importer => {
                    const option = document.createElement('option');
                    option.value = importer.id;
                    option.textContent = importer.name;
                    option.dataset.country = importer.country;
                    importerSelect.appendChild(option);
                });
                
                if (currentValue) {
                    importerSelect.value = currentValue;
                }
                resolve();
            });
    });
}

function addImportItem() {
    const importItems = document.getElementById('importItems');
    const newItem = document.createElement('div');
    newItem.className = 'import-item';
    newItem.innerHTML = `
        <div class="form-row">
            <div class="form-col">
                <select class="import-product" required>
                    <option value="">Select Product</option>
                </select>
            </div>
            <div class="form-col">
                <input type="number" class="import-quantity" min="1" value="1" required>
            </div>
            <div class="form-col">
                <button type="button" class="btn-danger remove-import-item">Remove</button>
            </div>
        </div>
    `;
    
    importItems.appendChild(newItem);
    loadProductsForImport();
    
    // Add event listener for remove button
    newItem.querySelector('.remove-import-item').addEventListener('click', function() {
        if (document.querySelectorAll('.import-item').length > 1) {
            importItems.removeChild(newItem);
        } else {
            alert('At least one item is required');
        }
    });
}

function recordStockImport() {
    const importerId = document.getElementById('importImporter').value;
    const importDate = document.getElementById('importDate').value;
    const importNotes = document.getElementById('importNotes').value;
    
    if (!importerId || !importDate) {
        showNotification('Please select an importer and date', 'error');
        return;
    }
    
    const items = [];
    let isValid = true;
    
    document.querySelectorAll('.import-item').forEach(item => {
        const select = item.querySelector('.import-product');
        const quantityInput = item.querySelector('.import-quantity');
        
        if (!select.value || !quantityInput.value || quantityInput.value <= 0) {
            isValid = false;
            return;
        }
        
        items.push({
            productId: select.value,
            productName: select.options[select.selectedIndex].text.split(' (')[0],
            quantity: parseFloat(quantityInput.value),
            unit: select.options[select.selectedIndex].dataset.unit
        });
    });
    
    if (!isValid || items.length === 0) {
        showNotification('Please add valid items to import', 'error');
        return;
    }
    
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    
    const newImport = {
        id: Date.now().toString(),
        importerId,
        date: importDate,
        items,
        totalQuantity,
        notes: importNotes,
        recordedBy: localStorage.getItem('currentUser'),
        recordedAt: new Date().toISOString()
    };
    
    // First update inventory
    updateInventoryFromImport(items, newImport);
}

function updateInventoryFromImport(items, importRecord) {
    // First try to get current inventory from localStorage as fallback
    let currentInventory = JSON.parse(localStorage.getItem('inventory')) || [];
    
    // Try to update server first
    fetch('/api/load?filename=inventory.json')
        .then(response => {
            if (response.ok) return response.json();
            throw new Error('Network response was not ok');
        })
        .then(inventory => {
            currentInventory = inventory;
            const updatedInventory = inventory.map(item => {
                const importedItem = items.find(i => i.productId === item.id);
                if (importedItem) {
                    return {
                        ...item,
                        quantity: item.quantity + importedItem.quantity,
                        lastUpdated: new Date().toISOString()
                    };
                }
                return item;
            });
            
            return fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: 'inventory.json',
                    data: updatedInventory
                })
            }).then(() => updatedInventory);
        })
        .then(updatedInventory => {
            // Update local storage in either case
            const localUpdated = currentInventory.map(item => {
                const importedItem = items.find(i => i.productId === item.id);
                if (importedItem) {
                    return {
                        ...item,
                        quantity: item.quantity + importedItem.quantity,
                        lastUpdated: new Date().toISOString()
                    };
                }
                return item;
            });
            localStorage.setItem('inventory', JSON.stringify(localUpdated));
            
            // Now save the import record
            saveImportRecord(importRecord);
        })
        .catch(error => {
            console.error('Error updating inventory:', error);
            // Fallback to localStorage
            const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
            const updatedInventory = inventory.map(item => {
                const importedItem = items.find(i => i.productId === item.id);
                if (importedItem) {
                    return {
                        ...item,
                        quantity: item.quantity + importedItem.quantity,
                        lastUpdated: new Date().toISOString()
                    };
                }
                return item;
            });
            localStorage.setItem('inventory', JSON.stringify(updatedInventory));
            
            saveImportRecord(importRecord);
        });
}


function saveImportRecord(importRecord) {
    // First try to get current history from localStorage as fallback
    let currentHistory = JSON.parse(localStorage.getItem('importHistory')) || [];
    
    // Try to save to server first
    fetch('/api/load?filename=importHistory.json')
        .then(response => {
            if (response.ok) return response.json();
            throw new Error('Network response was not ok');
        })
        .then(history => {
            currentHistory = history;
            const updatedHistory = [...history, importRecord];
            return fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: 'importHistory.json',
                    data: updatedHistory
                })
            });
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to save import record');
            
            // Update local storage in either case
            const localUpdated = [...currentHistory, importRecord];
            localStorage.setItem('importHistory', JSON.stringify(localUpdated));
            
            addLog('stock_import', `Imported ${importRecord.totalQuantity} items from ${importRecord.importerId}`);
            loadImportHistory();
            document.getElementById('stockImportForm').reset();
            
            showNotification('Stock import recorded successfully!', 'success');
        })
        .catch(error => {
            console.error('Error saving import record:', error);
            // Fallback to localStorage
            const history = JSON.parse(localStorage.getItem('importHistory')) || [];
            const updatedHistory = [...history, importRecord];
            localStorage.setItem('importHistory', JSON.stringify(updatedHistory));
            
            addLog('stock_import', `Imported ${importRecord.totalQuantity} items from ${importRecord.importerId}`);
            loadImportHistory();
            document.getElementById('stockImportForm').reset();
            
            showNotification('Stock import recorded (saved locally)!', 'success');
        });
}

function loadImportHistory() {
    return new Promise((resolve, reject) => {
        fetch('/api/load?filename=importHistory.json')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(history => {
                displayImportHistory(history);
                resolve();
            })
            .catch(error => {
                console.error('Failed to load import history from server, using localStorage:', error);
                try {
                    const history = JSON.parse(localStorage.getItem('importHistory')) || [];
                    displayImportHistory(history);
                    resolve();
                } catch (e) {
                    console.error('Error parsing import history:', e);
                    displayImportHistory([]);
                    resolve();
                }
            });
    });
}

function displayImportHistory(history) {
    const tableBody = document.getElementById('importHistoryTable').querySelector('tbody');
    tableBody.innerHTML = '';
    
    if (!history || history.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5">No import history found</td>';
        tableBody.appendChild(row);
        return;
    }
    
    // Get importers for name lookup
    const getImporters = fetch('/api/load?filename=importers.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .catch(() => {
            return JSON.parse(localStorage.getItem('importers')) || [];
        });
    
    getImporters.then(importers => {
        history.slice().reverse().forEach(record => {
            const importer = importers.find(i => i.id === record.importerId);
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${new Date(record.date).toLocaleDateString()}</td>
                <td>${importer ? importer.name : `Importer #${record.importerId}`}</td>
                <td>${record.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}</td>
                <td>${record.totalQuantity}</td>
                <td>
                    <button class="btn-icon view-import" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            row.querySelector('.view-import').addEventListener('click', () => {
                viewImportDetails(record);
            });
            
            tableBody.appendChild(row);
        });
    });
}

function viewImportDetails(importRecord) {
    // Implementation for viewing import details
    alert(`Import Details:\nDate: ${new Date(importRecord.date).toLocaleDateString()}\nItems:\n${importRecord.items.map(i => `- ${i.productName}: ${i.quantity}`).join('\n')}\nNotes: ${importRecord.notes || 'None'}`);
}
// Update the tab click event handler
document.querySelectorAll('.importer-tabs .tab-button').forEach(tab => {
    tab.addEventListener('click', function() {
        // Show loading state for the target tab
        const tabId = this.getAttribute('data-tab') + '-tab';
        const targetTab = document.getElementById(tabId);
        
        // Hide all tab contents and deactivate all tabs
        document.querySelectorAll('.tab-content').forEach(c => {
            c.classList.remove('active');
            if (c.id === 'stock-import-tab') {
                c.querySelector('.import-form-container').style.display = 'none';
                c.querySelector('.import-history').style.display = 'none';
                c.querySelector('.full-page-loader').style.display = 'flex';
            }
        });
        document.querySelectorAll('.importer-tabs .tab-button').forEach(t => t.classList.remove('active'));
        
        // Activate current tab
        this.classList.add('active');
        targetTab.classList.add('active');
        
        // Load content for the active tab
        if (this.id === 'stockImportTab') {
            setTimeout(() => {
                loadProductsForImport();
                loadImportersForImport();
                loadImportHistory().then(() => {
                    targetTab.querySelector('.full-page-loader').style.display = 'none';
                    targetTab.querySelector('.import-form-container').style.display = 'block';
                    targetTab.querySelector('.import-history').style.display = 'block';
                });
            }, 300); // Small delay for smooth transition
        }
    });
});
