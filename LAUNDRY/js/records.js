function displayRecords() {
    const search = (document.getElementById('searchBox')?.value || '').toLowerCase();
    const filterStatus = document.getElementById('filterStatus')?.value || 'all';
    const filterService = document.getElementById('filterService')?.value || 'all';
    const filterDate = document.getElementById('filterDate')?.value || 'all';
    const sortBy = document.getElementById('sortBy')?.value || 'date_desc';
    
    const [sortField, sortDirection] = sortBy.split('_');
    currentSort = { field: sortField, direction: sortDirection };
    
    let data = getLaundryData();
    const rates = {
        'Wash & Fold': 50,
        'Wash & Iron': 70,
        'Dry Clean': 100,
        'Express Service': 120,
        'Special Treatment': 150
    };
    
    data = data.filter(r => {
        if (search && 
            !r.name.toLowerCase().includes(search) && 
            !r.email.toLowerCase().includes(search) && 
            !r.qr.toLowerCase().includes(search)) {
            return false;
        }
        
        if (filterStatus !== 'all' && r.status !== filterStatus) {
            return false;
        }
        
        if (filterService !== 'all' && r.serviceType !== filterService) {
            return false;
        }
        
        if (filterDate !== 'all') {
            const recordDate = new Date(r.date);
            const today = new Date();
            
            switch(filterDate) {
                case 'today':
                    if (recordDate.toDateString() !== today.toDateString()) return false;
                    break;
                case 'week':
                    const weekAgo = new Date();
                    weekAgo.setDate(today.getDate() - 7);
                    if (recordDate < weekAgo) return false;
                    break;
                case 'month':
                    const monthAgo = new Date();
                    monthAgo.setMonth(today.getMonth() - 1);
                    if (recordDate < monthAgo) return false;
                    break;
            }
        }
        
        return true;
    });
    
    data.sort((a, b) => {
        let aVal, bVal;
        
        switch(sortField) {
            case 'name':
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
                break;
            case 'kilos':
                aVal = parseFloat(a.kilos);
                bVal = parseFloat(b.kilos);
                break;
            case 'qr':
                aVal = a.qr;
                bVal = b.qr;
                break;
            case 'service':
                aVal = a.serviceType;
                bVal = b.serviceType;
                break;
            case 'date':
                aVal = new Date(a.date).getTime();
                bVal = new Date(b.date).getTime();
                break;
            case 'price':
                aVal = parseFloat(a.kilos) * (rates[a.serviceType] || 50);
                bVal = parseFloat(b.kilos) * (rates[b.serviceType] || 50);
                break;
            case 'status':
                if (a.status === 'Done' && b.status !== 'Done') return 1;
                if (a.status !== 'Done' && b.status === 'Done') return -1;
                return 0;
            default:
                aVal = new Date(a.date).getTime();
                bVal = new Date(b.date).getTime();
        }
        
        if (sortDirection === 'desc') {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        } else {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }
    });
    
    updateSortHeaders(sortField, sortDirection);
    
    let html = '';
    let totalKilos = 0;
    let totalValue = 0;
    
    data.forEach((r, i) => {
        const price = r.kilos * (rates[r.serviceType] || 50);
        const isDone = r.status === 'Done';
        totalKilos += parseFloat(r.kilos);
        totalValue += price;
        
        html += `
            <tr>
                <td>${r.name}</td>
                <td>${r.kilos}</td>
                <td>${r.email}</td>
                <td>${r.qr}</td>
                <td>${r.serviceType}</td>
                <td>${r.date}</td>
                <td>₱${price.toFixed(2)}</td>
                <td><span class="tag ${isDone ? 'done' : 'pending'}">${r.status}</span></td>
                <td style="white-space: nowrap;">
                    <button class="btn ${isDone ? 'secondary' : 'success'}" 
                            onclick="markAndNotify('${r.qr}')"
                            ${isDone ? 'disabled' : ''}>
                        ${isDone ? 'Completed' : 'Notify'}
                    </button>
                    <button class="btn secondary" onclick="showQR('${r.qr}')" style="margin-left: 4px;">QR</button>
                    <button class="btn edit" onclick="editRecord('${r.qr}')" style="margin-left: 4px;">Edit</button>
                    <button class="btn delete" onclick="deleteRecord('${r.qr}')" style="margin-left: 4px;">Del</button>
                </td>
            </tr>
        `;
    });
    
    document.getElementById('recordsTable').innerHTML = html || '<tr><td colspan="9" style="text-align:center; padding:40px">No records found</td></tr>';
    document.getElementById('recordCount').textContent = data.length;
    
    updateDashboardStats();
}
function deleteRecord(qrCode) {
    if (!confirm("Are you sure you want to delete this laundry record?")) return;

    let allData = getLaundryData();

    const updatedData = allData.filter(item => item.qr !== qrCode);

    saveLaundryData(updatedData);

    displayRecords(); 

    showToast("Record deleted successfully", "success");
}
function markAndNotify(qrCode) {
    let allData = getLaundryData();
    let item = allData.find(r => r.qr === qrCode);

    if (item) {
        item.status = 'Done';
        saveLaundryData(allData);
        displayRecords(); 
        showToast(`Status updated for ${item.name}`);
    }
}
let currentEditingQR = null;
function editRecord(qrCode) {
    const data = getLaundryData();
    // Find the exact record that matches the QR code
    const record = data.find(r => r.qr === qrCode);

    if (record) {
        // Store the QR code so we know which one to update later
        currentEditingQR = qrCode;

        // Fill the Modal inputs with the record's current data
        document.getElementById('editName').value = record.name;
        document.getElementById('editKilos').value = record.kilos;
        document.getElementById('editEmail').value = record.email || '';
        document.getElementById('editServiceType').value = record.serviceType;

        // Show the modal
        document.getElementById('editModal').style.display = 'flex';
    } else {
        showToast("Record not found", "error");
    }
}
document.getElementById('saveEditBtn').onclick = function() {
    if (!currentEditingQR) return;

    let data = getLaundryData();
    // Find the index of the record we are editing
    const index = data.findIndex(r => r.qr === currentEditingQR);

    if (index !== -1) {
        // Update the data in the array with the new values from the inputs
        data[index].name = document.getElementById('editName').value;
        data[index].kilos = document.getElementById('editKilos').value;
        data[index].email = document.getElementById('editEmail').value;
        data[index].serviceType = document.getElementById('editServiceType').value;

        // Save the updated array back to LocalStorage
        saveLaundryData(data);

        // REFRESH the table immediately
        displayRecords();

        // Close the modal and show success
        closeEditModal();
        showToast("Record updated successfully!");
    }
};
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditingQR = null;
}
function startScanner() {
    const container = document.getElementById('qrScannerContainer');
    
    container.style.display = 'block';

    if (html5QrcodeScanner) { 
        return; 
    }

    html5QrcodeScanner = new Html5Qrcode("qrScanner");

    const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 } 
    };

    html5QrcodeScanner.start(
        { facingMode: "environment" }, 
        config,
        onScanSuccess,
        onScanFailure
    ).catch(err => {
        console.error("Error starting scanner", err);
        showToast("Error: Camera access denied or not found.", "error");
        container.style.display = 'none';
    });
}

function onScanSuccess(decodedText, decodedResult) {
    const searchBox = document.getElementById('searchBox');
    searchBox.value = decodedText;

    stopScanner();

    displayRecords();

    showToast(`QR Found: ${decodedText}`);
}

function onScanFailure(error) {
}

function stopScanner() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.stop().then(() => {
            // clear the instance
            html5QrcodeScanner.clear();
            html5QrcodeScanner = null;
            
            // Hide the container
            document.getElementById('qrScannerContainer').style.display = 'none';
        }).catch(err => {
            console.error("Failed to stop scanner", err);
        });
    } else {
        // Just hide it if it wasn't running
        document.getElementById('qrScannerContainer').style.display = 'none';
    }
}
function sortTable(field) {
    const sortSelect = document.getElementById('sortBy');
    let newDirection = 'desc';
    
    if (currentSort.field === field) {
        newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
    }
    
    sortSelect.value = `${field}_${newDirection}`;
    
    displayRecords();
}

function updateSortHeaders(field, direction) {
    document.querySelectorAll('thead th').forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
    });
    
    const headers = {
        'name': document.querySelector('th[onclick*="name"]'),
        'kilos': document.querySelector('th[onclick*="kilos"]'),
        'qr': document.querySelector('th[onclick*="qr"]'),
        'service': document.querySelector('th[onclick*="service"]'),
        'date': document.querySelector('th[onclick*="date"]'),
        'price': document.querySelector('th[onclick*="price"]'),
        'status': document.querySelector('th[onclick*="status"]')
    };
    
    if (headers[field]) {
        headers[field].classList.add(direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
    }
}

function resetFilters() {
    document.getElementById('searchBox').value = '';
    document.getElementById('filterStatus').value = 'all';
    document.getElementById('filterService').value = 'all';
    document.getElementById('filterDate').value = 'all';
    document.getElementById('sortBy').value = 'date_desc';
    
    displayRecords();
    showToast('Filters reset');
}

function exportToCSV() {
    const data = getLaundryData();
    
    if (data.length === 0) {
        showToast('No data to export', 'error');
        return;
    }
    
    const rates = {
        'Wash & Fold': 50,
        'Wash & Iron': 70,
        'Dry Clean': 100,
        'Express Service': 120,
        'Special Treatment': 150
    };
    
    let csv = 'Name,Kilos,Email,QR Code,Service Type,Date,Price,Status\n';
    
    data.forEach(r => {
        const price = r.kilos * (rates[r.serviceType] || 50);
        const row = [
            `"${r.name}"`,
            r.kilos,
            `"${r.email}"`,
            `"${r.qr}"`,
            `"${r.serviceType}"`,
            `"${r.date}"`,
            `₱${price.toFixed(2)}`,
            `"${r.status}"`
        ].join(',');
        csv += row + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laundry-records-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast(`Exported ${data.length} records to CSV`);
}

function filterByStatus(status) {
    document.getElementById('filterStatus').value = status;
    displayRecords();
}

function filterByService(service) {
    document.getElementById('filterService').value = service;
    displayRecords();
}

function filterToday() {
    document.getElementById('filterDate').value = 'today';
    displayRecords();
}