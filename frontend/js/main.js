// Main Application JavaScript
import { 
    signInWithEmail, 
    createUser,
    signOutUser, 
    onAuthStateChange, 
    getCurrentUser,
    getUserProfile 
} from './auth.js';
import { 
    submitApplication, 
    submitFeedback,
    getAllUsers,
    getAllApplications,
    getAllFeedback
} from './database.js';

// ============================================
// Admin Configuration
// ============================================
const ADMIN_EMAILS = [
    'khambhayata25100@iiitnr.edu.in',
    'kokate25100@iiitnr.edu.in',
    'aanya25100@iiitnr.edu.in',
    'priyanshu25100@iiitnr.edu.in',
    'yami25100@iiitnr.edu.in'
];

// Helper function to check if user is admin
function isUserAdmin(email) {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
}

// ============================================
// Global State
// ============================================
let currentUser = null;
let currentImageIndex = 0;
let galleryImages = [];
let isAuthMode = 'login'; // 'login' or 'register'

// ============================================
// Custom Gallery Data - Replace URLs with your own photos
// ============================================
const customGalleryData = [
    {
        id: 1,
        url: 'YOUR_IMAGE_URL_1',
        category: 'AARAMBH 8.0',
        caption: 'Your caption here'
    },
    {
        id: 2,
        url: 'YOUR_IMAGE_URL_2',
        category: 'GANESH UTSAV',
        caption: 'Your caption here'
    },
    {
        id: 3,
        url: 'YOUR_IMAGE_URL_3',
        category: 'NAVRATRI',
        caption: 'Your caption here'
    },
    {
        id: 4,
        url: 'YOUR_IMAGE_URL_4',
        category: 'CLUB ORIENTATION',
        caption: 'Your caption here'
    },
    {
        id: 5,
        url: 'YOUR_IMAGE_URL_5',
        category: 'AARAMBH 8.0',
        caption: 'Your caption here'
    },
    {
        id: 6,
        url: 'YOUR_IMAGE_URL_6',
        category: 'GANESH UTSAV',
        caption: 'Your caption here'
    },
    {
        id: 7,
        url: 'YOUR_IMAGE_URL_7',
        category: 'NAVRATRI',
        caption: 'Your caption here'
    },
    {
        id: 8,
        url: 'YOUR_IMAGE_URL_8',
        category: 'CLUB ORIENTATION',
        caption: 'Your caption here'
    }
];

// ============================================
// Dark Mode Functions
// ============================================
function initializeDarkMode() {
    // Check if user has a dark mode preference saved
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon();
    }
}

window.toggleDarkMode = function() {
    document.body.classList.toggle('dark-mode');
    
    // Save preference
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled');
    }
    
    updateDarkModeIcon();
};

function updateDarkModeIcon() {
    const icon = document.getElementById('darkModeIcon');
    if (icon) {
        icon.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    }
}

// ============================================
// Initialize App
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadInitialData();
    initializeDarkMode();
    
    // Setup authentication listener
    onAuthStateChange((user) => {
        currentUser = user;
        updateUIForUser(user);
    });
});

function initializeApp() {
    // Setup smooth scrolling
    setupSmoothScrolling();
    
    // Setup progress bar
    setupProgressBar();
    
    // Setup intersection observer for animations
    setupIntersectionObserver();
}

// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
    
    // Nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');
            document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
            
            // Update active link
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Close mobile menu
            navLinks.classList.remove('active');
            mobileToggle.classList.remove('active');
        });
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterGallery(btn.dataset.filter);
        });
    });
    
    // Application form
    const appForm = document.getElementById('applicationForm');
    if (appForm) {
        appForm.addEventListener('submit', handleApplicationSubmit);
    }
    
    // Feedback form
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackSubmit);
    }
    
    // Auth form
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', handleAuthSubmit);
    }
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('active');
        });
    });
    
    // Image modal navigation
    document.getElementById('modalPrev')?.addEventListener('click', () => navigateImage(-1));
    document.getElementById('modalNext')?.addEventListener('click', () => navigateImage(1));
    
    // Keyboard navigation for image modal
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('imageModal');
        if (modal.classList.contains('active')) {
            if (e.key === 'ArrowLeft') navigateImage(-1);
            if (e.key === 'ArrowRight') navigateImage(1);
            if (e.key === 'Escape') modal.classList.remove('active');
        }
    });
    
    // Admin tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchAdminTab(tab);
        });
    });
}

// ============================================
// Smooth Scrolling
// ============================================
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ============================================
// Progress Bar
// ============================================
function setupProgressBar() {
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        document.getElementById('progress-bar').style.width = progress + '%';
    });
}

// ============================================
// Intersection Observer for Animations
// ============================================
function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
}

// ============================================
// Load Initial Data
// ============================================
function loadInitialData() {
    loadGallery(customGalleryData);
}

// ============================================
// Gallery Functions - No Photographer Overlay
// ============================================
function loadGallery(images, filter = 'all') {
    galleryImages = images;
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const filteredImages = filter === 'all' 
        ? images 
        : images.filter(img => img.category === filter);
    
    filteredImages.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <img src="${img.url}" alt="${img.caption}" loading="lazy">
        `;
        item.addEventListener('click', () => openImageModal(index, filteredImages));
        grid.appendChild(item);
    });
}

function filterGallery(filter) {
    loadGallery(customGalleryData, filter);
}

function openImageModal(index, images) {
    currentImageIndex = index;
    galleryImages = images;
    const modal = document.getElementById('imageModal');
    updateModalImage();
    modal.classList.add('active');
}

function updateModalImage() {
    const img = galleryImages[currentImageIndex];
    document.getElementById('modalImage').src = img.url;
    document.getElementById('modalCaption').textContent = img.caption;
}

function navigateImage(direction) {
    currentImageIndex = (currentImageIndex + direction + galleryImages.length) % galleryImages.length;
    updateModalImage();
}

// ============================================
// Authentication
// ============================================
function updateUIForUser(user) {
    const navActions = document.getElementById('navActions');
    if (!navActions) return;
    
    // Get existing dark mode button
    const darkModeBtn = document.getElementById('darkModeToggle');
    
    if (user) {
        // User is logged in - Check if they're an admin
        const isAdmin = isUserAdmin(user.email);
        
        console.log('User logged in:', user.email);
        console.log('Is admin:', isAdmin);
        
        navActions.innerHTML = `
            <button onclick="toggleDarkMode()" class="btn btn-small btn-secondary" id="darkModeToggle">
                <span id="darkModeIcon">${document.body.classList.contains('dark-mode') ? '☀️' : '🌙'}</span>
            </button>
            ${isAdmin ? '<button onclick="openAdminDashboard()" class="btn btn-small" style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white;">👑 Admin</button>' : ''}
            <span style="color: var(--text-dark); font-weight: 600;">${user.displayName || user.email.split('@')[0]}</span>
            <button onclick="handleLogout()" class="btn btn-small btn-secondary">Logout</button>
        `;
    } else {
        // User is not logged in
        navActions.innerHTML = `
            <button onclick="toggleDarkMode()" class="btn btn-small btn-secondary" id="darkModeToggle">
                <span id="darkModeIcon">${document.body.classList.contains('dark-mode') ? '☀️' : '🌙'}</span>
            </button>
            <button onclick="openAuthModal()" class="btn btn-small btn-primary">Sign In</button>
        `;
    }
}

window.openAuthModal = function() {
    isAuthMode = 'login';
    document.getElementById('authModal').classList.add('active');
    updateAuthModalUI();
};

window.closeAuthModal = function() {
    document.getElementById('authModal').classList.remove('active');
};

window.switchToRegister = function() {
    isAuthMode = 'register';
    updateAuthModalUI();
};

function updateAuthModalUI() {
    const modal = document.querySelector('#authModal .modal-dialog');
    const title = modal.querySelector('h2');
    const switchText = modal.querySelector('.auth-switch');
    
    if (isAuthMode === 'register') {
        title.textContent = 'Create Account';
        switchText.innerHTML = 'Already have an account? <a href="#" onclick="switchToLogin()">Sign In</a>';
    } else {
        title.textContent = 'Sign In';
        switchText.innerHTML = 'Don\'t have an account? <a href="#" onclick="switchToRegister()">Register</a>';
    }
}

window.switchToLogin = function() {
    isAuthMode = 'login';
    updateAuthModalUI();
};

async function handleAuthSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    
    // Check domain restriction
    if (!email.endsWith('@iiitnr.edu.in')) {
        showNotification('Only @iiitnr.edu.in emails are allowed!', 'error');
        return;
    }
    
    try {
        if (isAuthMode === 'register') {
            const displayName = email.split('@')[0];
            await createUser(email, password, displayName);
            showNotification('Account created successfully!', 'success');
        } else {
            await signInWithEmail(email, password);
            showNotification('Signed in successfully!', 'success');
        }
        closeAuthModal();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

window.handleLogout = async function() {
    try {
        await signOutUser();
        showNotification('Logged out successfully!', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
};

// ============================================
// Application Form
// ============================================
async function handleApplicationSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Please sign in to submit an application!', 'error');
        openAuthModal();
        return;
    }
    
    const formData = {
        name: document.getElementById('appName').value,
        email: document.getElementById('appEmail').value,
        phone: document.getElementById('appPhone').value,
        experience: document.getElementById('appExperience').value,
        equipment: document.getElementById('appEquipment').value,
        userId: currentUser.uid,
        submittedAt: new Date().toISOString()
    };
    
    try {
        await submitApplication(formData);
        showNotification('Application submitted successfully!', 'success');
        e.target.reset();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// ============================================
// Feedback Form
// ============================================
async function handleFeedbackSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        name: form.querySelector('input[type="text"]').value,
        email: form.querySelector('input[type="email"]').value,
        message: form.querySelector('textarea').value,
        submittedAt: new Date().toISOString()
    };
    
    try {
        await submitFeedback(formData);
        showNotification('Thank you for your feedback!', 'success');
        form.reset();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// ============================================
// Admin Dashboard
// ============================================
window.openAdminDashboard = async function() {
    if (!currentUser) {
        showNotification('Please sign in first!', 'error');
        return;
    }
    
    // Double-check admin status
    if (!isUserAdmin(currentUser.email)) {
        showNotification('Access denied. Admin privileges required.', 'error');
        return;
    }
    
    document.getElementById('adminModal').classList.add('active');
    await loadAdminData();
};

window.closeAdminModal = function() {
    document.getElementById('adminModal').classList.remove('active');
};

function switchAdminTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

async function loadAdminData() {
    try {
        const [users, applications, feedback] = await Promise.all([
            getAllUsers(),
            getAllApplications(),
            getAllFeedback()
        ]);
        
        displayUsersTable(users);
        displayApplicationsTable(applications);
        displayFeedbackTable(feedback);
    } catch (error) {
        console.error('Error loading admin data:', error);
        showNotification('Error loading admin data', 'error');
    }
}

function displayUsersTable(users) {
    const container = document.getElementById('usersTable');
    if (!container) return;
    
    if (!users || users.length === 0) {
        container.innerHTML = '<p>No users found.</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>User ID</th>
                <th>Registration Date</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${users.map(user => `
                <tr>
                    <td>${user.displayName || 'N/A'}</td>
                    <td>${user.email}</td>
                    <td><code>${user.uid.substring(0, 8)}...</code></td>
                    <td>${new Date(user.registrationDate || user.createdAt).toLocaleDateString()}</td>
                    <td>${user.emailVerified ? '✅ Verified' : '⏳ Pending'}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    container.innerHTML = '';
    container.appendChild(table);
}

function displayApplicationsTable(applications) {
    const container = document.getElementById('applicationsTable');
    if (!container) return;
    
    if (!applications || applications.length === 0) {
        container.innerHTML = '<p>No applications found.</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Experience</th>
                <th>Equipment</th>
                <th>Submitted</th>
            </tr>
        </thead>
        <tbody>
            ${applications.map(app => `
                <tr>
                    <td>${app.name}</td>
                    <td>${app.email}</td>
                    <td>${app.phone || 'N/A'}</td>
                    <td>${app.experience ? app.experience.substring(0, 50) + '...' : 'N/A'}</td>
                    <td>${app.equipment || 'N/A'}</td>
                    <td>${new Date(app.submittedAt).toLocaleDateString()}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    container.innerHTML = '';
    container.appendChild(table);
}

function displayFeedbackTable(feedback) {
    const container = document.getElementById('feedbackTable');
    if (!container) return;
    
    if (!feedback || feedback.length === 0) {
        container.innerHTML = '<p>No feedback found.</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Submitted</th>
            </tr>
        </thead>
        <tbody>
            ${feedback.map(fb => `
                <tr>
                    <td>${fb.name}</td>
                    <td>${fb.email}</td>
                    <td>${fb.message}</td>
                    <td>${new Date(fb.submittedAt || fb.createdAt).toLocaleDateString()}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    container.innerHTML = '';
    container.appendChild(table);
}

// ============================================
// Notification System
// ============================================
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ============================================
// Export functions for global access
// ============================================
window.toggleDarkMode = toggleDarkMode;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.handleLogout = handleLogout;
window.openAdminDashboard = openAdminDashboard;
window.closeAdminModal = closeAdminModal;