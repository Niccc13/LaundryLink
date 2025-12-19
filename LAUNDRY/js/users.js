function loadUserManagement() {
    const users = getUsersData();
    
    const pending = users.filter(u => u.status === 'pending');
    let pendingHtml = '';
    pending.forEach(user => {
        pendingHtml += `
            <tr>
                <td>${user.name}</td>
                <td>${user.username}</td>
                <td>${user.role}</td>
                <td><span class="status-badge status-pending">Pending</span></td>
                <td>${new Date(user.dateRegistered).toLocaleDateString()}</td>
                <td>
                    <button class="btn-approve" onclick="approveUser(${user.id})">Approve</button>
                    <button class="btn-reject" onclick="rejectUser(${user.id})">Reject</button>
                </td>
            </tr>
        `;
    });
    document.getElementById('pendingTable').innerHTML = pendingHtml || '<tr><td colspan="6">No pending approvals</td></tr>';
    
    const active = users.filter(u => u.status === 'active');
    let activeHtml = '';
    active.forEach(user => {
        activeHtml += `
            <tr>
                <td>${user.name}</td>
                <td>${user.username}</td>
                <td>${user.role}</td>
                <td><span class="status-badge status-active">Active</span></td>
                <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                <td>
                    ${user.username !== 'admin' ? `<button class="btn-suspend" onclick="suspendUser(${user.id})">Suspend</button>` : 'System'}
                </td>
            </tr>
        `;
    });
    document.getElementById('activeUsersTable').innerHTML = activeHtml || '<tr><td colspan="6">No active users</td></tr>';
}

function approveUser(userId) {
    const users = getUsersData();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].status = 'active';
        users[userIndex].approvedBy = currentUser.name;
        saveUsersData(users);
        loadUserManagement();
        showToast('User approved!');
    }
}

function rejectUser(userId) {
    if (confirm('Reject this user?')) {
        const users = getUsersData();
        const newUsers = users.filter(u => u.id !== userId);
        saveUsersData(newUsers);
        loadUserManagement();
        showToast('User rejected!');
    }
}

function suspendUser(userId) {
    if (confirm('Suspend this user?')) {
        const users = getUsersData();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1 && users[userIndex].username !== 'admin') {
            users[userIndex].status = 'inactive';
            saveUsersData(users);
            loadUserManagement();
            showToast('User suspended!');
        }
    }
}