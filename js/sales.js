document.addEventListener('DOMContentLoaded', function() {
    // Load customers and products for dropdowns
    loadCustomers();
    loadProducts();
    
    // Setup form submission
    const saleForm = document.getElementById('saleForm');
    if (saleForm) {
        saleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            recordSale();
        });
    }
    
    // Add item button
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', addSaleItem);
    }
    
    // Load recent sales
    loadRecentSales();
});

function loadCustomers() {
    // In a real app, this would come from the server
    fetch('/api/load?filename=customers.json')
        .then(response => response.json())
        .then(customers => {
            const customerSelect = document.getElementById('customer');
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
            const customerSelect = document.getElementById('customer');
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
    // In a real app, this would come from the server
    fetch('/api/load?filename=inventory.json')
        .then(response => response.json())
        .then(items => {
            const productSelects = document.querySelectorAll('.item-select');
            
            productSelects.forEach(select => {
                select.innerHTML = '<option value="">Select Item</option>';
                
                items.filter(item => item.type === 'product').forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = `${item.name} (${item.quantity} ${item.unit} available)`;
                    option.dataset.price = item.price;
                    select.appendChild(option);
                });
            });
        })
        .catch(() => {
            const items = JSON.parse(localStorage.getItem('inventory')) || [];
            const productSelects = document.querySelectorAll('.item-select');
            
            productSelects.forEach(select => {
                select.innerHTML = '<option value="">Select Item</option>';
                
                items.filter(item => item.type === 'product').forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = `${item.name} (${item.quantity} ${item.unit} available)`;
                    option.dataset.price = item.price;
                    select.appendChild(option);
                });
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
                <select class="item-select" required>
                    <option value="">Select Item</option>
                </select>
            </div>
            <div class="form-col">
                <input type="number" class="item-quantity" min="1" value="1" required>
            </div>
            <div class="form-col">
                <button type="button" class="btn-danger remove-item">Remove</button>
            </div>
        </div>
    `;
    
    saleItems.appendChild(newItem);
    
    // Load products for the new select
    loadProducts();
    
    // Add event listener for remove button
    newItem.querySelector('.remove-item').addEventListener('click', function() {
        if (document.querySelectorAll('.sale-item').length > 1) {
            saleItems.removeChild(newItem);
        } else {
            alert('At least one item is required');
        }
    });
}

function recordSale() {
    const form = document.getElementById('saleForm');
    const formData = new FormData(form);
    
    const customerId = formData.get('customer');
    const saleDate = formData.get('saleDate');
    const notes = formData.get('saleNotes');
    
    const items = [];
    document.querySelectorAll('.sale-item').forEach(item => {
        const select = item.querySelector('.item-select');
        const quantity = item.querySelector('.item-quantity').value;
        
        items.push({
            id: select.value,
            name: select.options[select.selectedIndex].text.split(' (')[0],
            quantity: parseFloat(quantity),
            price: parseFloat(select.options[select.selectedIndex].dataset.price)
        });
    });
    
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const newSale = {
        id: Date.now(),
        date: saleDate,
        customerId,
        items,
        total,
        notes,
        recordedBy: localStorage.getItem('currentUser')
    };
    
    // In a real app, this would be sent to the server
    fetch('/api/load?filename=sales.json')
        .then(response => response.json())
        .then(sales => {
            const updatedSales = [...sales, newSale];
            
            fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: 'sales.json',
                    data: updatedSales
                })
            });
            
            localStorage.setItem('sales', JSON.stringify(updatedSales));
            addLog('sale_recorded', `Recorded sale #${newSale.id} for $${newSale.total}`);
            form.reset();
            loadRecentSales();
        })
        .catch(() => {
            const sales = JSON.parse(localStorage.getItem('sales')) || [];
            const updatedSales = [...sales, newSale];
            localStorage.setItem('sales', JSON.stringify(updatedSales));
            addLog('sale_recorded', `Recorded sale #${newSale.id} for $${newSale.total}`);
            form.reset();
            loadRecentSales();
        });
}

function loadRecentSales() {
    // In a real app, this would come from the server
    fetch('/api/load?filename=sales.json')
        .then(response => response.json())
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
    
    const recentSales = sales.slice(0, 10).reverse();
    
    recentSales.forEach(sale => {
        const row = document.createElement('tr');
        
        const dateCell = document.createElement('td');
        dateCell.textContent = sale.date;
        row.appendChild(dateCell);
        
        const customerCell = document.createElement('td');
        // In a real app, we'd look up the customer name
        customerCell.textContent = `Customer #${sale.customerId}`;
        row.appendChild(customerCell);
        
        const itemsCell = document.createElement('td');
        itemsCell.textContent = sale.items.map(item => `${item.name} (${item.quantity})`).join(', ');
        row.appendChild(itemsCell);
        
        const totalCell = document.createElement('td');
        totalCell.textContent = `$${sale.total.toFixed(2)}`;
        row.appendChild(totalCell);
        
        const actionsCell = document.createElement('td');
        const viewBtn = document.createElement('button');
        viewBtn.textContent = 'View';
        viewBtn.className = 'btn-secondary';
        viewBtn.addEventListener('click', () => viewSale(sale.id));
        actionsCell.appendChild(viewBtn);
        
        row.appendChild(actionsCell);
        
        salesTable.appendChild(row);
    });
}

function viewSale(id) {
    // Implementation for viewing sale details
    console.log('View sale with ID:', id);
}