document.addEventListener('DOMContentLoaded', function() {
    // Load customers and products
    loadCustomers();
    loadProducts();
    loadRecentSales();
    
    // Add item button
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', addSaleItem);
    }
    
    // Form submission
    const saleForm = document.getElementById('saleForm');
    if (saleForm) {
        saleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            recordSale();
        });
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('cancelSaleBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to cancel this sale?')) {
                saleForm.reset();
                document.getElementById('saleItems').innerHTML = `
                    <div class="sale-item">
                        <div class="form-row">
                            <div class="form-col">
                                <select class="sale-product modern-select" required>
                                    <option value="">Select Product</option>
                                </select>
                            </div>
                            <div class="form-col">
                                <input type="number" class="sale-quantity modern-input" min="1" value="1" required>
                            </div>
                            <div class="form-col">
                                <button type="button" class="btn-danger remove-item">
                                    <i class="fas fa-trash"></i> Remove
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                loadProducts();
                updateSaleSummary();
            }
        });
    }
    
    // Set default date to today
    document.getElementById('saleDate').value = new Date().toISOString().split('T')[0];
});

function loadCustomers() {
    fetch('/api/load?filename=customers.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(customers => {
            const customerSelect = document.getElementById('saleCustomer');
            customerSelect.innerHTML = '<option value="">Select Customer</option>';
            
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = customer.name;
                customerSelect.appendChild(option);
            });
        })
        .catch(() => {
            const customers = JSON.parse(localStorage.getItem('customers')) || [];
            const customerSelect = document.getElementById('saleCustomer');
            customerSelect.innerHTML = '<option value="">Select Customer</option>';
            
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = customer.name;
                customerSelect.appendChild(option);
            });
        });
}

function loadProducts() {
    fetch('/api/load?filename=inventory.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(items => {
            const productSelects = document.querySelectorAll('.sale-product');
            
            productSelects.forEach(select => {
                const currentValue = select.value;
                select.innerHTML = '<option value="">Select Product</option>';
                
                items.filter(item => item.type === 'product' && item.quantity > 0).forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = `${item.name} (${item.quantity} available)`;
                    option.dataset.price = item.price;
                    select.appendChild(option);
                });
                
                // Restore previous selection if still available
                if (currentValue) {
                    const stillExists = Array.from(select.options).some(opt => opt.value === currentValue);
                    if (stillExists) select.value = currentValue;
                }
            });
            
            // Add event listeners for price calculation
            document.querySelectorAll('.sale-product').forEach(select => {
                select.addEventListener('change', updateSaleSummary);
            });
            
            document.querySelectorAll('.sale-quantity').forEach(input => {
                input.addEventListener('input', updateSaleSummary);
            });
        })
        .catch(() => {
            const items = JSON.parse(localStorage.getItem('inventory')) || [];
            const productSelects = document.querySelectorAll('.sale-product');
            
            productSelects.forEach(select => {
                const currentValue = select.value;
                select.innerHTML = '<option value="">Select Product</option>';
                
                items.filter(item => item.type === 'product' && item.quantity > 0).forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = `${item.name} (${item.quantity} available)`;
                    option.dataset.price = item.price;
                    select.appendChild(option);
                });
                
                if (currentValue) {
                    const stillExists = Array.from(select.options).some(opt => opt.value === currentValue);
                    if (stillExists) select.value = currentValue;
                }
            });
            
            document.querySelectorAll('.sale-product').forEach(select => {
                select.addEventListener('change', updateSaleSummary);
            });
            
            document.querySelectorAll('.sale-quantity').forEach(input => {
                input.addEventListener('input', updateSaleSummary);
            });
        });
}

function addSaleItem() {
    const saleItems = document.getElementById('saleItems');
    const newItem = document.createElement('div');
    newItem.className = 'sale-item';
    newItem.innerHTML = `
        <div class="form-row">
            <div class="form-col">
                <select class="sale-product modern-select" required>
                    <option value="">Select Product</option>
                </select>
            </div>
            <div class="form-col">
                <input type="number" class="sale-quantity modern-input" min="1" value="1" required>
            </div>
            <div class="form-col">
                <button type="button" class="btn-danger remove-item">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `;
    
    saleItems.appendChild(newItem);
    loadProducts();
    
    // Add event listeners
    newItem.querySelector('.sale-product').addEventListener('change', updateSaleSummary);
    newItem.querySelector('.sale-quantity').addEventListener('input', updateSaleSummary);
    
    newItem.querySelector('.remove-item').addEventListener('click', function() {
        if (document.querySelectorAll('.sale-item').length > 1) {
            saleItems.removeChild(newItem);
            updateSaleSummary();
        } else {
            showNotification('At least one item is required', 'error');
        }
    });
}

function updateSaleSummary() {
    let subtotal = 0;
    
    document.querySelectorAll('.sale-item').forEach(item => {
        const select = item.querySelector('.sale-product');
        const quantityInput = item.querySelector('.sale-quantity');
        
        if (select.value && quantityInput.value) {
            const price = parseFloat(select.options[select.selectedIndex].dataset.price) || 0;
            const quantity = parseFloat(quantityInput.value) || 0;
            subtotal += price * quantity;
        }
    });
    
    const tax = subtotal * 0.1; // 10% tax for example
    const total = subtotal + tax;
    
    document.getElementById('saleSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('saleTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('saleTotal').textContent = `$${total.toFixed(2)}`;
}

function recordSale() {
    const customerId = document.getElementById('saleCustomer').value;
    const saleDate = document.getElementById('saleDate').value;
    const saleNotes = document.getElementById('saleNotes').value;
    
    if (!customerId) {
        showNotification('Please select a customer', 'error');
        return;
    }
    
    const items = [];
    let isValid = true;
    
    document.querySelectorAll('.sale-item').forEach(item => {
        const select = item.querySelector('.sale-product');
        const quantityInput = item.querySelector('.sale-quantity');
        
        if (!select.value || !quantityInput.value || quantityInput.value <= 0) {
            isValid = false;
            return;
        }
        
        items.push({
            productId: select.value,
            productName: select.options[select.selectedIndex].text.split(' (')[0],
            quantity: parseFloat(quantityInput.value),
            price: parseFloat(select.options[select.selectedIndex].dataset.price)
        });
    });
    
    if (!isValid || items.length === 0) {
        showNotification('Please add valid items to the sale', 'error');
        return;
    }
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    const newSale = {
        id: Date.now().toString(),
        date: saleDate,
        customerId,
        items,
        subtotal,
        tax,
        total,
        notes: saleNotes,
        recordedBy: localStorage.getItem('currentUser'),
        recordedAt: new Date().toISOString()
    };
    
    // First update inventory
    updateInventoryFromSale(items, newSale);
}

function updateInventoryFromSale(items, saleRecord) {
    fetch('/api/load?filename=inventory.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(inventory => {
            const updatedInventory = inventory.map(item => {
                const soldItem = items.find(i => i.productId === item.id);
                if (soldItem) {
                    const newQuantity = item.quantity - soldItem.quantity;
                    if (newQuantity < 0) {
                        throw new Error(`Not enough stock for ${item.name}`);
                    }
                    return {
                        ...item,
                        quantity: newQuantity,
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
            // Update local storage
            const localInventory = JSON.parse(localStorage.getItem('inventory')) || [];
            const localUpdated = localInventory.map(item => {
                const soldItem = items.find(i => i.productId === item.id);
                if (soldItem) {
                    return {
                        ...item,
                        quantity: item.quantity - soldItem.quantity,
                        lastUpdated: new Date().toISOString()
                    };
                }
                return item;
            });
            localStorage.setItem('inventory', JSON.stringify(localUpdated));
            
            // Now save the sale record
            saveSaleRecord(saleRecord);
        })
        .catch(error => {
            console.error('Error updating inventory:', error);
            showNotification(error.message, 'error');
            
            // Fallback to localStorage check
            const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
            for (const item of items) {
                const inventoryItem = inventory.find(i => i.id === item.productId);
                if (!inventoryItem || inventoryItem.quantity < item.quantity) {
                    showNotification(`Not enough stock for ${item.productName}`, 'error');
                    return;
                }
            }
            
            // If stock is available in localStorage, proceed
            const updatedInventory = inventory.map(item => {
                const soldItem = items.find(i => i.productId === item.id);
                if (soldItem) {
                    return {
                        ...item,
                        quantity: item.quantity - soldItem.quantity,
                        lastUpdated: new Date().toISOString()
                    };
                }
                return item;
            });
            localStorage.setItem('inventory', JSON.stringify(updatedInventory));
            
            saveSaleRecord(saleRecord);
        });
}

function saveSaleRecord(saleRecord) {
    fetch('/api/load?filename=sales.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(sales => {
            const updatedSales = [...sales, saleRecord];
            return fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: 'sales.json',
                    data: updatedSales
                })
            });
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to save sale record');
            
            // Update local storage
            const localSales = JSON.parse(localStorage.getItem('sales')) || [];
            const localUpdated = [...localSales, saleRecord];
            localStorage.setItem('sales', JSON.stringify(localUpdated));
            
            addLog('sale_recorded', `Recorded sale #${saleRecord.id} for $${saleRecord.total}`);
            loadRecentSales();
            resetSaleForm();
            
            showNotification('Sale recorded successfully!', 'success');
        })
        .catch(error => {
            console.error('Error saving sale record:', error);
            // Fallback to localStorage
            const sales = JSON.parse(localStorage.getItem('sales')) || [];
            const updatedSales = [...sales, saleRecord];
            localStorage.setItem('sales', JSON.stringify(updatedSales));
            
            addLog('sale_recorded', `Recorded sale #${saleRecord.id} for $${saleRecord.total}`);
            loadRecentSales();
            resetSaleForm();
            
            showNotification('Sale recorded (saved locally)!', 'success');
        });
}

function resetSaleForm() {
    document.getElementById('saleForm').reset();
    document.getElementById('saleDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('saleItems').innerHTML = `
        <div class="sale-item">
            <div class="form-row">
                <div class="form-col">
                    <select class="sale-product modern-select" required>
                        <option value="">Select Product</option>
                    </select>
                </div>
                <div class="form-col">
                    <input type="number" class="sale-quantity modern-input" min="1" value="1" required>
                </div>
                <div class="form-col">
                    <button type="button" class="btn-danger remove-item">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        </div>
    `;
    loadProducts();
    updateSaleSummary();
}

function loadRecentSales() {
    fetch('/api/load?filename=sales.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(sales => {
            displayRecentSales(sales);
        })
        .catch(() => {
            const sales = JSON.parse(localStorage.getItem('sales')) || [];
            displayRecentSales(sales);
        });
}

function displayRecentSales(sales) {
    const salesTable = document.getElementById('salesTable').querySelector('tbody');
    salesTable.innerHTML = '';
    
    if (sales.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5">No sales records found</td>';
        salesTable.appendChild(row);
        return;
    }
    
    // Get customers for name lookup
    fetch('/api/load?filename=customers.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(customers => {
            const recentSales = sales.slice(0, 10).reverse();
            
            recentSales.forEach(sale => {
                const customer = customers.find(c => c.id === sale.customerId);
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${new Date(sale.date).toLocaleDateString()}</td>
                    <td>${customer ? customer.name : `Customer #${sale.customerId}`}</td>
                    <td>${sale.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}</td>
                    <td>$${sale.total.toFixed(2)}</td>
                    <td>
                        <button class="btn-icon view-sale" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
                
                row.querySelector('.view-sale').addEventListener('click', () => {
                    viewSaleDetails(sale);
                });
                
                salesTable.appendChild(row);
            });
        })
        .catch(() => {
            const customers = JSON.parse(localStorage.getItem('customers')) || [];
            const recentSales = sales.slice(0, 10).reverse();
            
            recentSales.forEach(sale => {
                const customer = customers.find(c => c.id === sale.customerId);
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${new Date(sale.date).toLocaleDateString()}</td>
                    <td>${customer ? customer.name : `Customer #${sale.customerId}`}</td>
                    <td>${sale.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}</td>
                    <td>$${sale.total.toFixed(2)}</td>
                    <td>
                        <button class="btn-icon view-sale" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
                
                row.querySelector('.view-sale').addEventListener('click', () => {
                    viewSaleDetails(sale);
                });
                
                salesTable.appendChild(row);
            });
        });
}

function viewSaleDetails(sale) {
    // Implementation for viewing sale details
    alert(`Sale Details:\nDate: ${new Date(sale.date).toLocaleDateString()}\nCustomer: ${sale.customerId}\nItems:\n${sale.items.map(i => `- ${i.productName}: ${i.quantity} @ $${i.price.toFixed(2)}`).join('\n')}\nTotal: $${sale.total.toFixed(2)}\nNotes: ${sale.notes || 'None'}`);
}