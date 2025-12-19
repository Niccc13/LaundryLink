const SERVICE_RATES = {
    'Wash & Fold': 50,
    'Wash & Iron': 70,
    'Dry Clean': 100,
    'Express Service': 120,
    'Special Treatment': 150
};

function updateReports() {
    let data = getLaundryData();
    const startInput = document.getElementById('reportStart').value;
    const endInput = document.getElementById('reportEnd').value;

    if (startInput || endInput) {
        data = data.filter(item => {
            const rDate = new Date(item.date).setHours(0,0,0,0);
            const sDate = startInput ? new Date(startInput).setHours(0,0,0,0) : null;
            const eDate = endInput ? new Date(endInput).setHours(0,0,0,0) : null;

            if (sDate && rDate < sDate) return false;
            if (eDate && rDate > eDate) return false;
            return true;
        });
    }

    let totalKilos = 0;
    let totalRevenue = 0;
    let doneCount = 0;
    let tableHtml = '';

    data.forEach(r => {
        const k = parseFloat(r.kilos) || 0;
        const price = SERVICE_RATES[r.serviceType] || 50; 
        const amount = k * price;

        totalKilos += k;
        totalRevenue += amount;
        if(r.status === 'Done') doneCount++;

        tableHtml += `
            <tr>
                <td>${r.date}</td>
                <td>
                    <div style="font-weight:bold">${r.name}</div>
                    <small style="color:#777">${r.qr}</small>
                </td>
                <td>${r.serviceType}</td>
                <td>${k} kg</td>
                <td>₱${amount.toFixed(2)}</td>
                <td><span class="tag ${r.status === 'Done' ? 'done' : 'pending'}">${r.status}</span></td>
            </tr>
        `;
    });

    if (data.length > 0) {
        tableHtml += `
            <tr class="total-row">
                <td colspan="3" style="text-align:right; padding-right:15px;">TOTALS:</td>
                <td>${totalKilos.toFixed(1)} kg</td>
                <td>₱${totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td></td>
            </tr>
        `;
    } else {
        tableHtml = '<tr><td colspan="6" style="text-align:center; padding:30px">No records found for this period.</td></tr>';
    }

    document.getElementById('reportTotal').innerText = data.length;
    document.getElementById('reportRevenue').innerText = '₱' + totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById('reportDone').innerText = doneCount;
    document.getElementById('reportPending').innerText = data.length - doneCount;

    document.getElementById('reportsTable').innerHTML = tableHtml;
}

function resetReportFilters() {
    document.getElementById('reportStart').value = '';
    document.getElementById('reportEnd').value = '';
    updateReports();
}

function printReport() {
    updateReports();

    const start = document.getElementById('reportStart').value;
    const end = document.getElementById('reportEnd').value;
    const periodSpan = document.getElementById('printPeriod');
    
    if (start && end) {
        periodSpan.innerText = `${start} to ${end}`;
    } else if (start) {
        periodSpan.innerText = `Since ${start}`;
    } else {
        periodSpan.innerText = "All Time History";
    }

    document.getElementById('printDate').innerText = new Date().toLocaleString();
    
    window.print();
}

document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('reportsTable')) {
        updateReports();
    }
});