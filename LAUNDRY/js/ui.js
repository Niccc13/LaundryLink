function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const isOpen = sidebar.classList.contains('open');
    
    if (isOpen) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.add('open');
    document.body.classList.add('sidebar-open');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('open');
    document.body.classList.remove('sidebar-open');
}

function openPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    
    document.getElementById(pageId).style.display = 'block';
    
    document.querySelectorAll('.navlink').forEach(n => n.classList.remove('active'));
    document.querySelectorAll(`[data-page="${pageId}"]`).forEach(n => n.classList.add('active'));
    
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
    
    if (pageId === 'reports') {
        updateReports();
    } else if (pageId === 'userManagement') {
        loadUserManagement();
    } else if (pageId === 'dashboard') {
        updateDashboardStats();
    }
    if (pageId === 'records') {
        displayRecords();
    }
    if (pageId === 'dashboard') {
        updateStats();
    }
    if (pageId === 'userManagement') {
        displayUsers(); // If you have this function
    }
}