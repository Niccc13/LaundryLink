function showQRPreview() {
    const qrValue = document.getElementById('custQR').value;
    if (qrValue) {
        showQR(qrValue);
    } else {
        showToast('Generate a QR code first', 'error');
    }
}

function showQR(val) {
    if (!val) return;
    qr.value = val;
    const canvas = document.getElementById('qrCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;
    ctx.drawImage(qrCanvasElem, 0, 0, 300, 300);
    document.getElementById('qrPopup').style.display = 'flex';
}

function closeQR() {
    document.getElementById('qrPopup').style.display = 'none';
}

function downloadQR() {
    const canvas = document.getElementById('qrCanvas');
    const link = document.createElement('a');
    link.download = 'laundry-qr.png';
    link.href = canvas.toDataURL();
    link.click();
}