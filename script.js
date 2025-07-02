// Online Voting Portal - Complete JavaScript Implementation

// Global Variables and State Management
let currentUser = null;
let captchaText = '';
let votes = {
    president: null,
    vicepresident: null
};
let isVoteSubmitted = false;

// Sample user database (in production, this would be server-side)
let users = [
    {
        id: 'VOTER001',
        password: 'demo123',
        name: 'John Demo',
        email: 'john@demo.com',
        hasVoted: false
    },
    {
        id: 'VOTER002',
        password: 'test456',
        name: 'Jane Test',
        email: 'jane@test.com',
        hasVoted: false
    }
];

// Vote tallies (in production, this would be server-side)
let voteTallies = {
    president: {
        candidate1: 450,
        candidate2: 350,
        candidate3: 200
    },
    vicepresident: {
        vp1: 420,
        vp2: 380,
        vp3: 200
    }
};

// DOM Elements
const elements = {
    // Modals
    loginModal: document.getElementById('loginModal'),
    registerModal: document.getElementById('registerModal'),
    confirmationModal: document.getElementById('confirmationModal'),
    
    // Pages
    landingPage: document.getElementById('landingPage'),
    votingPage: document.getElementById('votingPage'),
    resultsPage: document.getElementById('resultsPage'),
    thankYouPage: document.getElementById('thankYouPage'),
    
    // Buttons
    loginBtn: document.getElementById('loginBtn'),
    getStartedBtn: document.getElementById('getStartedBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    reviewVoteBtn: document.getElementById('reviewVoteBtn'),
    castVoteBtn: document.getElementById('castVoteBtn'),
    confirmVoteBtn: document.getElementById('confirmVoteBtn'),
    editVoteBtn: document.getElementById('editVoteBtn'),
    viewResultsBtn: document.getElementById('viewResultsBtn'),
    downloadReceiptBtn: document.getElementById('downloadReceiptBtn'),
    backToVotingBtn: document.getElementById('backToVotingBtn'),
    registerLink: document.getElementById('registerLink'),
    refreshCaptcha: document.getElementById('refreshCaptcha'),
    
    // Forms
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    
    // Stats
    totalVoters: document.getElementById('totalVoters'),
    totalVotes: document.getElementById('totalVotes'),
    activeElections: document.getElementById('activeElections'),
    
    // Voter info
    voterName: document.getElementById('voterName'),
    
    // Vote review
    voteReview: document.getElementById('voteReview'),
    
    // Receipt
    transactionId: document.getElementById('transactionId'),
    voteDate: document.getElementById('voteDate'),
    voteTime: document.getElementById('voteTime'),
    
    // Captcha
    captchaCanvas: document.getElementById('captchaCanvas'),
    captchaInput: document.getElementById('captchaInput')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    generateCaptcha();
    updateStats();
    animateResultBars();
});

// Initialize Application
function initializeApp() {
    // Show landing page by default
    showPage('landing');
    
    // Load any existing user session (in production, check server session)
    const savedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (savedUser) {
        currentUser = savedUser;
        updateLoginState();
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Modal controls
    setupModalControls();
    
    // Navigation
    elements.loginBtn?.addEventListener('click', () => showModal('login'));
    elements.getStartedBtn?.addEventListener('click', () => showModal('login'));
    elements.logoutBtn?.addEventListener('click', logout);
    elements.registerLink?.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal('login');
        showModal('register');
    });
    
    // Forms
    elements.loginForm?.addEventListener('submit', handleLogin);
    elements.registerForm?.addEventListener('submit', handleRegistration);
    
    // Voting
    elements.reviewVoteBtn?.addEventListener('click', reviewVote);
    elements.castVoteBtn?.addEventListener('click', castVote);
    elements.confirmVoteBtn?.addEventListener('click', confirmVote);
    elements.editVoteBtn?.addEventListener('click', editVote);
    
    // Vote selection
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', updateVoteSelection);
    });
    
    // Results and receipt
    elements.viewResultsBtn?.addEventListener('click', () => showPage('results'));
    elements.downloadReceiptBtn?.addEventListener('click', downloadReceipt);
    elements.backToVotingBtn?.addEventListener('click', () => showPage('voting'));
    
    // Captcha
    elements.refreshCaptcha?.addEventListener('click', generateCaptcha);
}

// Modal Management
function setupModalControls() {
    // Close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
}

function showModal(modalType) {
    const modal = elements[modalType + 'Modal'];
    if (modal) {
        modal.style.display = 'block';
        if (modalType === 'login') {
            generateCaptcha();
        }
    }
}

function hideModal(modalType) {
    const modal = elements[modalType + 'Modal'];
    if (modal) {
        modal.style.display = 'none';
    }
}

// Page Management
function showPage(pageType) {
    // Hide all pages
    const pages = ['landingPage', 'votingPage', 'resultsPage', 'thankYouPage'];
    pages.forEach(page => {
        const element = elements[page];
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // Show requested page
    const targetPage = elements[pageType + 'Page'];
    if (targetPage) {
        targetPage.style.display = 'block';
    }
    
    // Special handling for certain pages
    if (pageType === 'results') {
        updateResultsDisplay();
        animateResultBars();
    }
}

// Captcha Generation
function generateCaptcha() {
    const canvas = elements.captchaCanvas;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Generate random text
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    captchaText = '';
    for (let i = 0; i < 5; i++) {
        captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add noise lines
    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }
    
    // Draw text
    ctx.font = '20px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText(captchaText, canvas.width / 2, canvas.height / 2 + 7);
    
    // Add distortion
    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`;
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }
}

// Authentication
function handleLogin(e) {
    e.preventDefault();
    
    const voterId = document.getElementById('voterId').value.trim();
    const password = document.getElementById('password').value;
    const captchaValue = elements.captchaInput.value.trim().toUpperCase();
    
    // Validate inputs
    if (!voterId || !password) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    if (captchaValue !== captchaText) {
        showAlert('Invalid captcha. Please try again.', 'error');
        generateCaptcha();
        elements.captchaInput.value = '';
        return;
    }
    
    // Check credentials
    const user = users.find(u => u.id === voterId && u.password === password);
    if (!user) {
        showAlert('Invalid voter ID or password', 'error');
        generateCaptcha();
        elements.captchaInput.value = '';
        return;
    }
    
    // Check if user already voted
    if (user.hasVoted) {
        showAlert('You have already cast your vote in this election', 'warning');
        return;
    }
    
    // Successful login
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    hideModal('login');
    showPage('voting');
    updateLoginState();
    showAlert('Login successful! You can now cast your vote.', 'success');
    
    // Reset form
    elements.loginForm.reset();
    elements.captchaInput.value = '';
}

function handleRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(elements.registerForm);
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const age = parseInt(document.getElementById('age').value);
    const address = document.getElementById('address').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!fullName || !email || !phone || !age || !address || !newPassword) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    if (age < 18) {
        showAlert('You must be at least 18 years old to register', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showAlert('Password must be at least 6 characters long', 'error');
        return;
    }
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showAlert('Email already registered', 'error');
        return;
    }
    
    // Generate new voter ID
    const newVoterId = 'VOTER' + String(users.length + 1).padStart(3, '0');
    
    // Create new user
    const newUser = {
        id: newVoterId,
        password: newPassword,
        name: fullName,
        email: email,
        phone: phone,
        age: age,
        address: address,
        hasVoted: false
    };
    
    users.push(newUser);
    
    hideModal('register');
    showAlert(`Registration successful! Your Voter ID is: ${newVoterId}. Please use this ID to login.`, 'success');
    
    // Reset form
    elements.registerForm.reset();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    isVoteSubmitted = false;
    votes = { president: null, vicepresident: null };
    updateLoginState();
    showPage('landing');
    showAlert('Logged out successfully', 'info');
}

function updateLoginState() {
    if (currentUser) {
        elements.loginBtn.textContent = 'Dashboard';
        elements.voterName.textContent = currentUser.name;
    } else {
        elements.loginBtn.textContent = 'Login';
    }
}

// Voting Process
function updateVoteSelection() {
    const presidentSelected = document.querySelector('input[name="president"]:checked');
    const vpSelected = document.querySelector('input[name="vicepresident"]:checked');
    
    votes.president = presidentSelected ? presidentSelected.value : null;
    votes.vicepresident = vpSelected ? vpSelected.value : null;
    
    // Enable cast vote button if all positions are selected
    const allSelected = votes.president && votes.vicepresident;
    elements.castVoteBtn.disabled = !allSelected;
    
    if (allSelected) {
        elements.castVoteBtn.style.opacity = '1';
        elements.castVoteBtn.style.cursor = 'pointer';
    } else {
        elements.castVoteBtn.style.opacity = '0.6';
        elements.castVoteBtn.style.cursor = 'not-allowed';
    }
}

function reviewVote() {
    if (!votes.president || !votes.vicepresident) {
        showAlert('Please select candidates for all positions before reviewing', 'warning');
        return;
    }
    
    const reviewHtml = generateVoteReviewHtml();
    elements.voteReview.innerHTML = reviewHtml;
    showModal('confirmation');
}

function generateVoteReviewHtml() {
    const candidateNames = {
        candidate1: 'John Smith (Democratic)',
        candidate2: 'Jane Doe (Republican)',
        candidate3: 'Mike Johnson (Independent)',
        vp1: 'Sarah Wilson (Democratic)',
        vp2: 'Robert Brown (Republican)',
        vp3: 'Lisa Anderson (Independent)'
    };
    
    return `
        <h3>Review Your Vote</h3>
        <div style="margin: 1rem 0;">
            <strong>President:</strong> ${candidateNames[votes.president]}
        </div>
        <div style="margin: 1rem 0;">
            <strong>Vice President:</strong> ${candidateNames[votes.vicepresident]}
        </div>
        <div style="margin-top: 2rem; padding: 1rem; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
            <strong>⚠️ Important:</strong> Once you confirm and submit your vote, you cannot change it. Please review your selections carefully.
        </div>
    `;
}

function castVote() {
    reviewVote();
}

function confirmVote() {
    if (!currentUser) {
        showAlert('Please log in to vote', 'error');
        return;
    }
    
    if (isVoteSubmitted) {
        showAlert('Vote already submitted', 'warning');
        return;
    }
    
    // Simulate vote submission
    setTimeout(() => {
        // Update vote tallies
        voteTallies.president[votes.president]++;
        voteTallies.vicepresident[votes.vicepresident]++;
        
        // Mark user as voted
        currentUser.hasVoted = true;
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].hasVoted = true;
        }
        
        isVoteSubmitted = true;
        hideModal('confirmation');
        showThankYouPage();
        updateStats();
        
    }, 1000);
    
    showAlert('Submitting your vote...', 'info');
}

function editVote() {
    hideModal('confirmation');
}

function showThankYouPage() {
    // Generate transaction ID
    const transactionId = 'TX' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    const now = new Date();
    
    elements.transactionId.textContent = transactionId;
    elements.voteDate.textContent = now.toLocaleDateString();
    elements.voteTime.textContent = now.toLocaleTimeString();
    
    showPage('thankYou');
}

// Results Management
function updateResultsDisplay() {
    const totalVotes = {
        president: Object.values(voteTallies.president).reduce((a, b) => a + b, 0),
        vicepresident: Object.values(voteTallies.vicepresident).reduce((a, b) => a + b, 0)
    };
    
    // Update president results
    const presidentBars = document.querySelectorAll('.result-section:first-child .result-bar');
    const presidentCandidates = ['candidate1', 'candidate2', 'candidate3'];
    
    presidentBars.forEach((bar, index) => {
        const candidate = presidentCandidates[index];
        const votes = voteTallies.president[candidate];
        const percentage = Math.round((votes / totalVotes.president) * 100);
        
        const fill = bar.querySelector('.fill');
        const percentageSpan = bar.querySelector('.percentage');
        
        fill.style.width = percentage + '%';
        fill.setAttribute('data-percentage', percentage);
        percentageSpan.textContent = percentage + '%';
    });
    
    // Update vice president results
    const vpBars = document.querySelectorAll('.result-section:last-child .result-bar');
    const vpCandidates = ['vp1', 'vp2', 'vp3'];
    
    vpBars.forEach((bar, index) => {
        const candidate = vpCandidates[index];
        const votes = voteTallies.vicepresident[candidate];
        const percentage = Math.round((votes / totalVotes.vicepresident) * 100);
        
        const fill = bar.querySelector('.fill');
        const percentageSpan = bar.querySelector('.percentage');
        
        fill.style.width = percentage + '%';
        fill.setAttribute('data-percentage', percentage);
        percentageSpan.textContent = percentage + '%';
    });
    
    // Update total votes cast
    const totalVotesCast = document.getElementById('totalVotesCast');
    if (totalVotesCast) {
        totalVotesCast.textContent = Math.max(totalVotes.president, totalVotes.vicepresident).toLocaleString();
    }
}

function animateResultBars() {
    const fills = document.querySelectorAll('.fill');
    fills.forEach(fill => {
        const percentage = fill.getAttribute('data-percentage');
        fill.style.width = '0%';
        setTimeout(() => {
            fill.style.width = percentage + '%';
        }, 100);
    });
}

// Statistics
function updateStats() {
    const totalRegistered = users.length;
    const totalVotesCast = users.filter(u => u.hasVoted).length;
    
    // Animate counters
    animateCounter(elements.totalVoters, totalRegistered);
    animateCounter(elements.totalVotes, totalVotesCast);
}

function animateCounter(element, target) {
    if (!element) return;
    
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 30);
}

// Utility Functions
function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 3000;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    alert.style.backgroundColor = colors[type] || colors.info;
    
    // Set text color for warning
    if (type === 'warning') {
        alert.style.color = '#333';
    }
    
    alert.textContent = message;
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alert.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    }, 5000);
}

function downloadReceipt() {
    const receiptContent = `
VOTE RECEIPT
============

Transaction ID: ${elements.transactionId.textContent}
Date: ${elements.voteDate.textContent}
Time: ${elements.voteTime.textContent}
Voter: ${currentUser ? currentUser.name : 'Unknown'}
Status: Confirmed

This receipt confirms that your vote has been successfully recorded
in the VoteSecure system. Keep this for your records.

Thank you for participating in the democratic process!

VoteSecure - Secure Digital Voting Platform
`;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vote-receipt-${elements.transactionId.textContent}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showAlert('Receipt downloaded successfully!', 'success');
}

// Add CSS animations for alerts
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .alert {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border: none;
    }
`;
document.head.appendChild(style);

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showAlert('An unexpected error occurred. Please try again.', 'error');
});

// Prevent multiple form submissions
document.addEventListener('submit', function(e) {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        setTimeout(() => {
            submitBtn.disabled = false;
        }, 2000);
    }
});

// Auto-logout after inactivity (30 minutes)
let inactivityTimer;
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (currentUser) {
        inactivityTimer = setTimeout(() => {
            showAlert('Session expired due to inactivity. Please log in again.', 'warning');
            logout();
        }, 30 * 60 * 1000); // 30 minutes
    }
}

// Track user activity
['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
});

// Initialize inactivity timer
resetInactivityTimer();

console.log('VoteSecure application initialized successfully!');