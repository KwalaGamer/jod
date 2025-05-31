document.addEventListener('DOMContentLoaded', function() {
    // Initialize inventory
    loadInventoryItems();
    
    // Tab functionality
    setupInventoryTabs();
    
    // Form submission
    const inventoryForm = document.getElementById('inventoryForm');
    if (inventoryForm) {
        inventoryForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await addInventoryItem();
        });
    }
    
    // Edit form submission
    const editItemForm = document.getElementById('editItemForm');
    if (editItemForm) {
        editItemForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await saveEditedItem();
        });
    }
    
    // Image preview for new items
    const itemImageInput = document.getElementById('itemImage');
    if (itemImageInput) {
        itemImageInput.addEventListener('change', function() {
            previewImage(this, 'imagePreview');
        });
    }
    
    // Image preview for edit form
    const editItemImageInput = document.getElementById('editItemImage');
    if (editItemImageInput) {
        editItemImageInput.addEventListener('change', function() {
            previewImage(this, 'editImagePreview');
        });
    }
    
    // Modal close button
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            document.getElementById('editModal').style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('editModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

function setupInventoryTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding content
            const tabId = this.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId).classList.add('active');
        });
    });
}

function loadInventoryItems() {
    // Try to load from server first
    fetch('/api/load?filename=inventory.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(items => {
            displayInventoryItems(items);
        })
        .catch(error => {
            console.error('Failed to load from server, using localStorage:', error);
            // Fallback to localStorage if server fails
            const items = JSON.parse(localStorage.getItem('inventory')) || [];
            displayInventoryItems(items);
        });
}

function displayInventoryItems(items) {
    const rawItemsTable = document.getElementById('rawItemsTable').querySelector('tbody');
    const productsTable = document.getElementById('productsTable').querySelector('tbody');
    
    rawItemsTable.innerHTML = '';
    productsTable.innerHTML = '';
    
    if (items.length === 0) {
        const rawRow = document.createElement('tr');
        rawRow.innerHTML = '<td colspan="7" class="no-items">No raw materials found</td>';
        rawItemsTable.appendChild(rawRow);
        
        const productRow = document.createElement('tr');
        productRow.innerHTML = '<td colspan="7" class="no-items">No finished products found</td>';
        productsTable.appendChild(productRow);
        return;
    }
    
    items.forEach(item => {
        const row = document.createElement('tr');
        row.dataset.id = item.id;
        
        // Image cell
        const imageCell = document.createElement('td');
        if (item.image) {
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.name;
            img.className = 'item-thumbnail';
            imageCell.appendChild(img);
        } else {
            imageCell.textContent = 'No image';
        }
        row.appendChild(imageCell);
        
        // Name cell
        const nameCell = document.createElement('td');
        nameCell.textContent = item.name;
        row.appendChild(nameCell);
        
        // Quantity cell
        const quantityCell = document.createElement('td');
        quantityCell.textContent = item.quantity;
        row.appendChild(quantityCell);
        
        // Unit cell
        const unitCell = document.createElement('td');
        unitCell.textContent = item.unit;
        row.appendChild(unitCell);
        
        // Price cell
        const priceCell = document.createElement('td');
        priceCell.textContent = `$${item.price.toFixed(2)}`;
        row.appendChild(priceCell);
        
        // Last updated cell
        const updatedCell = document.createElement('td');
        updatedCell.textContent = new Date(item.lastUpdated || item.dateAdded || Date.now()).toLocaleDateString();
        row.appendChild(updatedCell);
        
        // Actions cell
        const actionsCell = document.createElement('td');
        actionsCell.className = 'actions';
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'btn-secondary';
        editBtn.addEventListener('click', () => openEditModal(item));
        actionsCell.appendChild(editBtn);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'btn-danger';
        deleteBtn.addEventListener('click', () => deleteItem(item.id));
        actionsCell.appendChild(deleteBtn);
        
        row.appendChild(actionsCell);
        
        if (item.type === 'raw') {
            rawItemsTable.appendChild(row);
        } else {
            productsTable.appendChild(row);
        }
    });
}

async function addInventoryItem() {
    const form = document.getElementById('inventoryForm');
    const formData = new FormData(form);
    
    const itemImageInput = document.getElementById('itemImage');
    let imageBase64 = '';
    
    if (itemImageInput.files.length > 0) {
        const file = itemImageInput.files[0];
        imageBase64 = await getBase64(file);
    }
    
    const newItem = {
        id: Date.now().toString(),
        name: formData.get('itemName'),
        type: formData.get('itemType') === 'raw' ? 'raw' : 'product',
        quantity: parseFloat(formData.get('itemQuantity')),
        unit: formData.get('itemUnit'),
        price: parseFloat(formData.get('itemPrice')),
        description: formData.get('itemDescription'),
        image: imageBase64,
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };
    
    try {
        // Try to save to server first
        const serverResponse = await fetch('/api/load?filename=inventory.json');
        if (!serverResponse.ok) throw new Error('Network response was not ok');
        
        const items = await serverResponse.json();
        const updatedItems = [...items, newItem];
        
        const saveResponse = await fetch('/api/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: 'inventory.json',
                data: updatedItems
            })
        });
        
        if (!saveResponse.ok) throw new Error('Failed to save to server');
        
        // Update local storage as fallback
        const localItems = JSON.parse(localStorage.getItem('inventory')) || [];
        const localUpdatedItems = [...localItems, newItem];
        localStorage.setItem('inventory', JSON.stringify(localUpdatedItems));
        
        addLog('inventory_add', `Added ${newItem.type} item: ${newItem.name}`);
        loadInventoryItems();
        form.reset();
        document.getElementById('imagePreview').innerHTML = '';
        
        // Switch to appropriate tab
        const tabId = newItem.type === 'raw' ? 'raw' : 'products';
        document.querySelector(`.tab-button[data-tab="${tabId}"]`).click();
        
        alert('Item added successfully!');
    } catch (error) {
        console.error('Error saving to server, using localStorage:', error);
        // Fallback to localStorage
        const items = JSON.parse(localStorage.getItem('inventory')) || [];
        const updatedItems = [...items, newItem];
        localStorage.setItem('inventory', JSON.stringify(updatedItems));
        
        addLog('inventory_add', `Added ${newItem.type} item: ${newItem.name}`);
        loadInventoryItems();
        form.reset();
        document.getElementById('imagePreview').innerHTML = '';
        
        const tabId = newItem.type === 'raw' ? 'raw' : 'products';
        document.querySelector(`.tab-button[data-tab="${tabId}"]`).click();
        
        alert('Item added (saved locally)!');
    }
}

function openEditModal(item) {
    const modal = document.getElementById('editModal');
    const form = document.getElementById('editItemForm');
    
    // Populate form with item data
    document.getElementById('editItemId').value = item.id;
    document.getElementById('editItemName').value = item.name;
    document.getElementById('editItemQuantity').value = item.quantity;
    document.getElementById('editItemUnit').value = item.unit;
    document.getElementById('editItemPrice').value = item.price;
    document.getElementById('editItemDescription').value = item.description || '';
    
    // Display current image
    const preview = document.getElementById('editImagePreview');
    preview.innerHTML = '';
    if (item.image) {
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        img.className = 'item-thumbnail';
        preview.appendChild(img);
    }
    
    // Show modal
    modal.style.display = 'block';
}

async function saveEditedItem() {
    const form = document.getElementById('editItemForm');
    const itemId = document.getElementById('editItemId').value;
    const editItemImageInput = document.getElementById('editItemImage');
    
    let imageBase64 = document.querySelector('#editImagePreview img')?.src || '';
    
    if (editItemImageInput.files.length > 0) {
        const file = editItemImageInput.files[0];
        imageBase64 = await getBase64(file);
    }
    
    const updatedItem = {
        id: itemId,
        name: document.getElementById('editItemName').value,
        quantity: parseFloat(document.getElementById('editItemQuantity').value),
        unit: document.getElementById('editItemUnit').value,
        price: parseFloat(document.getElementById('editItemPrice').value),
        description: document.getElementById('editItemDescription').value,
        image: imageBase64,
        lastUpdated: new Date().toISOString()
    };
    
    try {
        // Try to save to server first
        const serverResponse = await fetch('/api/load?filename=inventory.json');
        if (!serverResponse.ok) throw new Error('Network response was not ok');
        
        const items = await serverResponse.json();
        const updatedItems = items.map(item => 
            item.id === itemId ? { ...item, ...updatedItem } : item
        );
        
        const saveResponse = await fetch('/api/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: 'inventory.json',
                data: updatedItems
            })
        });
        
        if (!saveResponse.ok) throw new Error('Failed to save to server');
        
        // Update local storage as fallback
        const localItems = JSON.parse(localStorage.getItem('inventory')) || [];
        const localUpdatedItems = localItems.map(item => 
            item.id === itemId ? { ...item, ...updatedItem } : item
        );
        localStorage.setItem('inventory', JSON.stringify(localUpdatedItems));
        
        addLog('inventory_update', `Updated item: ${updatedItem.name}`);
        loadInventoryItems();
        document.getElementById('editModal').style.display = 'none';
        form.reset();
        
        alert('Item updated successfully!');
    } catch (error) {
        console.error('Error saving to server, using localStorage:', error);
        // Fallback to localStorage
        const items = JSON.parse(localStorage.getItem('inventory')) || [];
        const updatedItems = items.map(item => 
            item.id === itemId ? { ...item, ...updatedItem } : item
        );
        localStorage.setItem('inventory', JSON.stringify(updatedItems));
        
        addLog('inventory_update', `Updated item: ${updatedItem.name}`);
        loadInventoryItems();
        document.getElementById('editModal').style.display = 'none';
        form.reset();
        
        alert('Item updated (saved locally)!');
    }
}

function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    // Try to delete from server first
    fetch('/api/load?filename=inventory.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(items => {
            const itemToDelete = items.find(item => item.id === itemId);
            const updatedItems = items.filter(item => item.id !== itemId);
            return Promise.all([
                fetch('/api/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        filename: 'inventory.json',
                        data: updatedItems
                    })
                }),
                itemToDelete
            ]);
        })
        .then(([response, itemToDelete]) => {
            if (!response.ok) throw new Error('Failed to save to server');
            return itemToDelete;
        })
        .then(itemToDelete => {
            // Update local storage as fallback
            const items = JSON.parse(localStorage.getItem('inventory')) || [];
            const updatedItems = items.filter(item => item.id !== itemId);
            localStorage.setItem('inventory', JSON.stringify(updatedItems));
            
            addLog('inventory_delete', `Deleted item: ${itemToDelete.name}`);
            loadInventoryItems();
            
            alert('Item deleted successfully!');
        })
        .catch(error => {
            console.error('Error deleting from server, using localStorage:', error);
            // Fallback to localStorage
            const items = JSON.parse(localStorage.getItem('inventory')) || [];
            const itemToDelete = items.find(item => item.id === itemId);
            const updatedItems = items.filter(item => item.id !== itemId);
            localStorage.setItem('inventory', JSON.stringify(updatedItems));
            
            if (itemToDelete) {
                addLog('inventory_delete', `Deleted item: ${itemToDelete.name}`);
            }
            loadInventoryItems();
            
            alert('Item deleted (saved locally)!');
        });
}

function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    preview.innerHTML = '';
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Preview';
            img.className = 'item-thumbnail';
            preview.appendChild(img);
        }
        
        reader.readAsDataURL(input.files[0]);
    }
}

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}


// ... (keep all the previous code until addInventoryItem function)

async function addInventoryItem() {
    const form = document.getElementById('inventoryForm');
    
    // Get form values directly from elements instead of FormData
    const itemName = document.getElementById('itemName').value;
    const itemType = document.getElementById('itemType').value;
    const itemQuantity = parseFloat(document.getElementById('itemQuantity').value);
    const itemUnit = document.getElementById('itemUnit').value;
    const itemPrice = parseFloat(document.getElementById('itemPrice').value);
    const itemDescription = document.getElementById('itemDescription').value;
    
    const itemImageInput = document.getElementById('itemImage');
    let imageBase64 = '';
    
    if (itemImageInput.files.length > 0) {
        const file = itemImageInput.files[0];
        imageBase64 = await getBase64(file);
    }
    
    // Validate required fields
    if (!itemName || !itemType || isNaN(itemQuantity) || !itemUnit || isNaN(itemPrice)) {
        alert('Please fill all required fields with valid values');
        return;
    }
    
    const newItem = {
        id: Date.now().toString(),
        name: itemName,
        type: itemType === 'raw' ? 'raw' : 'product',
        quantity: itemQuantity,
        unit: itemUnit,
        price: itemPrice,
        description: itemDescription,
        image: imageBase64,
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };
    
    try {
        // Try to save to server first
        const serverResponse = await fetch('/api/load?filename=inventory.json');
        let items = [];
        
        if (serverResponse.ok) {
            items = await serverResponse.json();
        }
        
        const updatedItems = [...items, newItem];
        
        const saveResponse = await fetch('/api/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: 'inventory.json',
                data: updatedItems
            })
        });
        
        // Update local storage regardless of server success
        const localItems = JSON.parse(localStorage.getItem('inventory')) || [];
        const localUpdatedItems = [...localItems, newItem];
        localStorage.setItem('inventory', JSON.stringify(localUpdatedItems));
        
        addLog('inventory_add', `Added ${newItem.type} item: ${newItem.name}`);
        loadInventoryItems();
        form.reset();
        document.getElementById('imagePreview').innerHTML = '';
        
        // Switch to appropriate tab
        const tabId = newItem.type === 'raw' ? 'raw' : 'products';
        document.querySelector(`.tab-button[data-tab="${tabId}"]`).click();
        
        alert('Item added successfully!');
    } catch (error) {
        console.error('Error:', error);
        // Fallback to localStorage
        const items = JSON.parse(localStorage.getItem('inventory')) || [];
        const updatedItems = [...items, newItem];
        localStorage.setItem('inventory', JSON.stringify(updatedItems));
        
        addLog('inventory_add', `Added ${newItem.type} item: ${newItem.name}`);
        loadInventoryItems();
        form.reset();
        document.getElementById('imagePreview').innerHTML = '';
        
        const tabId = newItem.type === 'raw' ? 'raw' : 'products';
        document.querySelector(`.tab-button[data-tab="${tabId}"]`).click();
        
        alert('Item added (saved locally)!');
    }
}

// ... (keep the rest of the code the same)