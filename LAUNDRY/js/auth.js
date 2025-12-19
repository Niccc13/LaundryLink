function showRegister() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'flex';
}

function showLogin() {
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
}

function loginStaff() {
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value.trim();
    
    if (!username || !password) {
        showToast('Please enter username and password', 'error');
        return;
    }
    
    const users = getUsersData();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        showToast('Invalid username or password', 'error');
        return;
    }
    
    if (user.status !== 'active') {
        showToast('Account not active. Please contact administrator.', 'error');
        return;
    }
    
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    user.lastLogin = new Date().toISOString();
    saveUsersData(users);
    
    loginSuccess();
}

function loginSuccess() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('navbarWrap').style.display = 'block';
    document.getElementById('appRoot').style.display = 'block';
    
    document.getElementById('userLabel').textContent = currentUser.name;
    document.getElementById('userRoleDisplay').textContent = currentUser.role === 'admin' ? 'Admin' : 'Staff';
    
    if (currentUser.role !== 'admin') {
        document.querySelector('[data-page="userManagement"]').style.display = 'none';
    }
    
    openPage('dashboard');
    displayRecords();
    
    showToast(`Welcome ${currentUser.name}!`);
}

function logout() {
    localStorage.removeItem('currentUser');
    location.reload();
}

function registerAccount() {
    const name = document.getElementById('regName').value.trim();
    const username = document.getElementById('regUser').value.trim();
    const password = document.getElementById('regPass').value.trim();
    const role = document.getElementById('regRole').value;
    
    if (!name || !username || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    if (username.length < 3) {
        showToast('Username must be at least 3 characters', 'error');
        return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        showToast('Username can only contain letters, numbers, and underscores', 'error');
        return;
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        const requirements = passwordValidation.requirements;
        let message = 'Password must have: ';
        if (requirements.includes('8+ characters')) message += '8+ characters, ';
        if (requirements.includes('uppercase')) message += 'uppercase letter, ';
        if (requirements.includes('lowercase')) message += 'lowercase letter, ';
        if (requirements.includes('number')) message += 'number, ';
        if (requirements.includes('special')) message += 'special character';
        showToast(message, 'error');
        return;
    }
    
    const users = getUsersData();
    
    if (users.some(u => u.username === username)) {
        showToast('Username already exists', 'error');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name: name,
        username: username,
        password: password,
        role: role,
        status: 'pending',
        dateRegistered: new Date().toISOString(),
        lastLogin: null,
        approvedBy: null
    };
    
    users.push(newUser);
    saveUsersData(users);
    
    document.getElementById('regName').value = '';
    document.getElementById('regUser').value = '';
    document.getElementById('regPass').value = '';
    document.getElementById('passwordRequirements').style.display = 'none';
    document.getElementById('passwordStrength').style.display = 'none';
    
    showToast('Account created! Waiting for admin approval.');
    showLogin();
}

function validatePassword(password) {
    const requirements = [];
    
    if (password.length < 8) requirements.push('8+ characters');
    if (!/[A-Z]/.test(password)) requirements.push('uppercase');
    if (!/[a-z]/.test(password)) requirements.push('lowercase');
    if (!/\d/.test(password)) requirements.push('number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) requirements.push('special');
    
    return {
        isValid: requirements.length === 0,
        requirements: requirements
    };
}

function checkPasswordStrength() {
    const password = document.getElementById('regPass').value;
    const reqDiv = document.getElementById('passwordRequirements');
    const strengthDiv = document.getElementById('passwordStrength');
    
    if (password.length === 0) {
        reqDiv.style.display = 'none';
        strengthDiv.style.display = 'none';
        return;
    }
    
    reqDiv.style.display = 'block';
    strengthDiv.style.display = 'block';
    
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    document.getElementById('req8').style.color = hasLength ? 'green' : 'red';
    document.getElementById('req8').style.fontWeight = hasLength ? 'bold' : 'normal';
    
    document.getElementById('reqA').style.color = hasUpper ? 'green' : 'red';
    document.getElementById('reqA').style.fontWeight = hasUpper ? 'bold' : 'normal';
    
    document.getElementById('reqa').style.color = hasLower ? 'green' : 'red';
    document.getElementById('reqa').style.fontWeight = hasLower ? 'bold' : 'normal';
    
    document.getElementById('req1').style.color = hasNumber ? 'green' : 'red';
    document.getElementById('req1').style.fontWeight = hasNumber ? 'bold' : 'normal';
    
    document.getElementById('reqS').style.color = hasSpecial ? 'green' : 'red';
    document.getElementById('reqS').style.fontWeight = hasSpecial ? 'bold' : 'normal';
    
    let score = 0;
    if (hasLength) score += 1;
    if (hasUpper) score += 1;
    if (hasLower) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;
    
    let strengthLevel = 'Weak';
    let strengthColor = '#ff4444';
    let barWidth = 20;
    
    if (score === 5) {
        strengthLevel = 'Strong';
        strengthColor = '#00C851';
        barWidth = 100;
    } else if (score >= 4) {
        strengthLevel = 'Good';
        strengthColor = '#ffbb33';
        barWidth = 75;
    } else if (score >= 3) {
        strengthLevel = 'Fair';
        strengthColor = '#ffbb33';
        barWidth = 50;
    } else if (score >= 1) {
        strengthLevel = 'Weak';
        strengthColor = '#ff4444';
        barWidth = 25;
    }
    
    document.getElementById('strengthText').textContent = `Strength: ${strengthLevel}`;
    document.getElementById('strengthText').style.color = strengthColor;
    document.getElementById('strengthBar').style.width = `${barWidth}%`;
    document.getElementById('strengthBar').style.backgroundColor = strengthColor;
}

function initializeSystem() {
    const users = getUsersData();
    const adminExists = users.some(u => u.username === 'admin');
    
    if (!adminExists) {
        const defaultAdmin = {
            id: 1,
            name: 'Administrator',
            username: 'admin',
            password: '1234',
            role: 'admin',
            status: 'active',
            dateRegistered: new Date().toISOString(),
            lastLogin: null,
            approvedBy: 'system'
        };
        
        users.push(defaultAdmin);
        saveUsersData(users);
        
        const sampleLaundry = [
            {
                name: 'Juan Dela Cruz',
                kilos: 5,
                email: 'juan@example.com',
                qr: 'LND-100001',
                serviceType: 'Wash & Fold',
                date: new Date().toLocaleString(),
                status: 'Pending'
            }
        ];
        saveLaundryData(sampleLaundry);
    }
    
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            const validUser = users.find(u => u.id === user.id && u.status === 'active');
            if (validUser) {
                currentUser = validUser;
                loginSuccess();
                return;
            }
        } catch (e) {
            console.log("Invalid saved session");
        }
    }
    
    document.getElementById('loginScreen').style.display = 'flex';
}