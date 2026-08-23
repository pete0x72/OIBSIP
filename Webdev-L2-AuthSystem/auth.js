async function hashPassword(password) {
    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const togglePassword = document.getElementById('togglePassword');

    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const errorEl = document.getElementById('errorMessage');

            if (!username || !email || !password) {
                errorEl.textContent = 'All fields are required.';
                return;
            }

            const passwordRegex = /^(?=.*[0-9]).{8,}$/;
            if (!passwordRegex.test(password)) {
                errorEl.textContent = 'Password must be at least 8 characters and contain at least 1 number.';
                return;
            }

            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (users.find(u => u.username === username || u.email === email)) {
                errorEl.textContent = 'Username or Email already exists.';
                return;
            }

            const hashedPassword = await hashPassword(password);
            users.push({ username, email, password: hashedPassword });
            localStorage.setItem('users', JSON.stringify(users));
            
            alert('Registration successful! Please login.');
            window.location.href = 'index.html';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const identifier = document.getElementById('identifier').value.trim();
            const password = document.getElementById('password').value;
            const errorEl = document.getElementById('errorMessage');

            if (!identifier || !password) {
                errorEl.textContent = 'All fields are required.';
                return;
            }

            const hashedPassword = await hashPassword(password);
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => (u.username === identifier || u.email === identifier) && u.password === hashedPassword);

            if (user) {
                localStorage.setItem('session', JSON.stringify({ username: user.username, loginTime: Date.now() }));
                window.location.href = 'dashboard.html';
            } else {
                errorEl.textContent = 'Invalid username/email or password.';
            }
        });
    }

    if (window.location.pathname.includes('dashboard.html')) {
        const session = JSON.parse(localStorage.getItem('session') || '{}');
        if (!session.username) {
            window.location.href = 'index.html';
        } else {
            const welcomeEl = document.getElementById('welcomeMessage');
            if (welcomeEl) {
                welcomeEl.textContent = `Welcome ${session.username}`;
            }
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('session');
            window.location.href = 'index.html';
        });
    }
});