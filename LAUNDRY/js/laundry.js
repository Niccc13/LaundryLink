function autoGenerateQR() {
    const name = document.getElementById('custName').value;
    const kilos = document.getElementById('custKilos').value;
    if (name && kilos) {
        const random = Math.floor(100000 + Math.random() * 900000);
        document.getElementById('custQR').value = 'LND-' + random;
    }
}

function saveLaundry() {
    const name = document.getElementById('custName').value;
    const kilos = document.getElementById('custKilos').value;
    const service = document.getElementById('custService').value;
    const email = document.getElementById('custEmail').value;
    const qr = document.getElementById('custQR').value;

    if (!name || !kilos || !service) {
        showToast("Please fill in all fields", "error");
        return;
    }

    const newRecord = {
        name: document.getElementById('custName').value,
        kilos: document.getElementById('custKilos').value,
        serviceType: document.getElementById('custService').value, 
        email: document.getElementById('custEmail').value,
        qr: document.getElementById('custQR').value,
        status: 'Pending',
        date: new Date().toLocaleString() 
    };

    let data = getLaundryData();
    data.push(newRecord);
    saveLaundryData(data);

    document.getElementById('custName').value = '';
    document.getElementById('custKilos').value = '';
    document.getElementById('custEmail').value = '';
    document.getElementById('custQR').value = '';
    
    if (typeof displayRecords === 'function') {
        displayRecords(); 
    }
    if (typeof updateStats === 'function') {
        updateStats();
    }
    displayRecords();
    showToast("Customer added successfully!");
    
    openPage('records'); 
}
function updateDashboardStats() {
    const data = getLaundryData();
    
    const statTotal = document.getElementById('statTotal');
    const statDone = document.getElementById('statDone');
    const statActive = document.getElementById('statActive');

    if (statTotal && statDone && statActive) {
        statTotal.textContent = data.length;
        statDone.textContent = data.filter(d => d.status === 'Done').length;
        statActive.textContent = data.filter(d => d.status !== 'Done').length;
    }
}
function isValidEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}


function editRecord(i) {
    const r = getLaundryData()[i];
    editingIndex = i;
    
    document.getElementById('editName').value = r.name;
    document.getElementById('editKilos').value = r.kilos;
    document.getElementById('editEmail').value = r.email;
    document.getElementById('editServiceType').value = r.serviceType;
    document.getElementById('editModal').style.display = 'flex';
}

function saveEdit() {
    const data = getLaundryData();
    data[editingIndex].name = document.getElementById('editName').value;
    data[editingIndex].kilos = parseFloat(document.getElementById('editKilos').value);
    data[editingIndex].email = document.getElementById('editEmail').value;
    data[editingIndex].serviceType = document.getElementById('editServiceType').value;
    
    saveLaundryData(data);
    displayRecords();
    closeEditModal();
    showToast('Record updated!');
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function deleteRecord(i) {
    if (confirm('Delete this record?')) {
        const data = getLaundryData();
        data.splice(i, 1);
        saveLaundryData(data);
        displayRecords();
        showToast('Record deleted!');
    }
}

async function markAndNotify(index) {
    const data = getLaundryData();
    const record = data[index];
    
    if (!record.email || !record.email.includes('@')) {
        showToast('Invalid email address', 'error');
        return;
    }
    
    record.status = 'Done';
    saveLaundryData(data);
    displayRecords();
    
    try {
        qr.value = record.qr;
        const qrImageBase64 = qrCanvasElem.toDataURL("image/png");
        
        const templateParams = {
            to_email: record.email,
            to_name: record.name,
            message: "Your laundry is done. You can pick it up now.",
            qr_image: qrImageBase64
        };
        
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
        showToast('Email sent successfully!');
    } catch (error) {
        console.error('Email failed:', error);
        showToast('Order marked as done, but email failed', 'error');
    }
}