// Admin panel state
let adminPassword = null;
let data = {
    providers: [],
    staff: [],
    offices: []
};

// DOM Elements
const loginSection = document.getElementById('login-section');
const adminPanel = document.getElementById('admin-panel');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const loginError = document.getElementById('login-error');
const logoutButton = document.getElementById('logout-button');
const globalMessage = document.getElementById('global-message');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    // Login
    loginButton.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // Logout
    logoutButton.addEventListener('click', handleLogout);

    // Tabs
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    // Add buttons
    document.getElementById('add-provider-button').addEventListener('click', () => addEntry('providers'));
    document.getElementById('add-staff-button').addEventListener('click', () => addEntry('staff'));
    document.getElementById('add-office-button').addEventListener('click', () => addEntry('offices'));
}

async function handleLogin() {
    const password = passwordInput.value.trim();

    if (!password) {
        showLoginError('Please enter a password');
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';

    try {
        const response = await fetch('/api/verify-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        if (response.ok) {
            adminPassword = password;
            loginSection.style.display = 'none';
            adminPanel.classList.add('show');
            await loadData();
        } else {
            showLoginError('Invalid password');
        }
    } catch (error) {
        showLoginError('Connection error. Please try again.');
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
    }
}

function handleLogout() {
    adminPassword = null;
    passwordInput.value = '';
    adminPanel.classList.remove('show');
    loginSection.style.display = 'block';
    hideLoginError();
}

function showLoginError(message) {
    loginError.textContent = message;
    loginError.classList.add('show');
}

function hideLoginError() {
    loginError.classList.remove('show');
}

function showMessage(message, isError = false) {
    globalMessage.textContent = message;
    globalMessage.className = `message show ${isError ? 'error' : 'success'}`;
    setTimeout(() => {
        globalMessage.classList.remove('show');
    }, 3000);
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.toggle('active', button.dataset.tab === tabName);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

async function loadData() {
    try {
        const response = await fetch('/api/data');
        if (response.ok) {
            data = await response.json();
        }
    } catch (error) {
        console.error('Failed to load data:', error);
        showMessage('Failed to load data', true);
    }

    renderLists();
}

function renderLists() {
    renderList('providers', data.providers);
    renderList('staff', data.staff);
    renderList('offices', data.offices);
}

function renderList(type, items) {
    const listContainer = document.getElementById(`${type}-list`);
    const countSpan = document.getElementById(`${type}-count`);

    countSpan.textContent = items.length;

    if (items.length === 0) {
        listContainer.innerHTML = '<div class="empty-list">No entries yet</div>';
        return;
    }

    // Sort alphabetically
    const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));

    listContainer.innerHTML = sorted.map(item => `
        <div class="list-item">
            <div class="list-item-info">
                <div class="list-item-name">${escapeHtml(item.name)}</div>
                <div class="list-item-details">
                    ${item.address ? escapeHtml(item.address) + ' | ' : ''}
                    Coords: ${item.lat}, ${item.lng}
                </div>
            </div>
            <button class="remove-button" onclick="removeEntry('${type}', '${escapeHtml(item.name).replace(/'/g, "\\'")}')">Remove</button>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function geocodeAddress(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=us&limit=1`;

    const response = await fetch(url);
    const results = await response.json();

    if (results.length === 0) {
        throw new Error('Address not found. Please check the address and try again.');
    }

    return {
        lat: parseFloat(results[0].lat),
        lng: parseFloat(results[0].lon)
    };
}

async function addEntry(type) {
    const nameInput = document.getElementById(`${type === 'offices' ? 'office' : type.slice(0, -1)}-name`);
    const addressInput = document.getElementById(`${type === 'offices' ? 'office' : type.slice(0, -1)}-address`);
    const addButton = document.getElementById(`add-${type === 'offices' ? 'office' : type.slice(0, -1)}-button`);

    const name = nameInput.value.trim();
    const address = addressInput.value.trim();

    if (!name) {
        showMessage('Please enter a name', true);
        return;
    }

    if (!address) {
        showMessage('Please enter an address', true);
        return;
    }

    addButton.disabled = true;
    addButton.textContent = 'Geocoding...';

    try {
        // Geocode the address
        const coords = await geocodeAddress(address);

        addButton.textContent = 'Adding...';

        // Add to database
        const body = {
            type,
            name,
            lat: coords.lat,
            lng: coords.lng
        };

        if (type === 'offices') {
            body.address = address;
        }

        const response = await fetch('/api/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Password': adminPassword
            },
            body: JSON.stringify(body)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(`Added ${name} successfully`);
            nameInput.value = '';
            addressInput.value = '';
            await loadData();
        } else {
            showMessage(result.error || 'Failed to add entry', true);
        }
    } catch (error) {
        showMessage(error.message || 'Failed to add entry', true);
    } finally {
        addButton.disabled = false;
        addButton.textContent = type === 'offices' ? 'Add Office' : `Add ${type.charAt(0).toUpperCase() + type.slice(1, -1)}`;
    }
}

async function removeEntry(type, name) {
    if (!confirm(`Are you sure you want to remove "${name}"?`)) {
        return;
    }

    try {
        const response = await fetch('/api/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Password': adminPassword
            },
            body: JSON.stringify({ type, name })
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(`Removed ${name} successfully`);
            await loadData();
        } else {
            showMessage(result.error || 'Failed to remove entry', true);
        }
    } catch (error) {
        showMessage('Failed to remove entry', true);
    }
}
