let qrCanvasElem = document.createElement('canvas');
let qr = new QRious({ element: qrCanvasElem, size: 300 });
let currentUser = null;
let html5QrcodeScanner;
let editingIndex = null;
let currentSort = { field: 'date', direction: 'desc' };
let activeFilters = {};

function showToast(msg, type = 'success') {
    const toastEl = document.getElementById('toast');
    toastEl.textContent = msg;
    toastEl.style.background = (type === 'success') ? 'linear-gradient(90deg,#16a34a,#2ecc71)' : 'linear-gradient(90deg,#ff5f6d,#ffc371)';
    toastEl.style.display = 'block';
    setTimeout(() => toastEl.style.display = 'none', 3000);
}

function togglePassword(inputId, element) {
    const input = document.getElementById(inputId);
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    
    const svg = element.querySelector('svg');
    if (type === 'text') {
        svg.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
        element.style.color = 'var(--primary)';
    } else {
        svg.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        `;
        element.style.color = '';
    }
}

function getUsersData() { 
    const data = localStorage.getItem('laundryUsers');
    return data ? JSON.parse(data) : [];
}

function saveUsersData(d) { 
    localStorage.setItem('laundryUsers', JSON.stringify(d)); 
}

function getLaundryData() { 
    const data = localStorage.getItem('laundryData');
    return data ? JSON.parse(data) : [];
}

function saveLaundryData(d) { 
    localStorage.setItem('laundryData', JSON.stringify(d)); 
}