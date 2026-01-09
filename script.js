let loginTimeString = null;
let updateInterval = null;

function startTracking() {
    const loginInput = document.getElementById('loginTime').value;
    
    if (!loginInput) {
        alert('Please enter your login time');
        return;
    }
    
    loginTimeString = loginInput;
    document.getElementById('statsSection').style.display = 'grid';
    document.getElementById('progressBar').style.display = 'block';
    document.getElementById('resetBtn').style.display = 'block';
    
    // Disable input and button during tracking
    document.getElementById('loginTime').disabled = true;
    event.target.disabled = true;
    event.target.style.opacity = '0.5';
    
    // Start updating immediately and then every second
    updateStats();
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(updateStats, 1000);
}

function updateStats() {
    const now = new Date();
    const [hours, minutes] = loginTimeString.split(':').map(Number);
    
    // Create login time for today
    const loginTime = new Date();
    loginTime.setHours(hours, minutes, 0, 0);
    
    // Calculate logout time (login + 9 hours)
    const logoutTime = new Date(loginTime);
    logoutTime.setHours(logoutTime.getHours() + 9);
    
    // Calculate elapsed time
    const elapsedMs = now - loginTime;
    const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
    const elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
    
    // Calculate remaining time
    const remainingMs = logoutTime - now;
    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    
    // Format logout time in 12-hour format
    let logoutHours = logoutTime.getHours();
    const logoutMinutes = String(logoutTime.getMinutes()).padStart(2, '0');
    const ampm = logoutHours >= 12 ? 'PM' : 'AM';
    logoutHours = logoutHours % 12 || 12;
    const logoutTimeFormatted = `${String(logoutHours).padStart(2, '0')}:${logoutMinutes} ${ampm}`;
    
    // Update display
    document.getElementById('elapsed').textContent = 
        `${elapsedHours}h ${elapsedMinutes}m`;
    document.getElementById('logoutTime').textContent = logoutTimeFormatted;
    document.getElementById('remaining').textContent = 
        remainingMs > 0 ? `${remainingHours}h ${remainingMinutes}m` : 'Work shift ended!';
    
    // Update progress bar
    const totalMs = 9 * 60 * 60 * 1000; // 9 hours in milliseconds
    const progressPercentage = Math.min((elapsedMs / totalMs) * 100, 100);
    document.getElementById('progressFill').style.width = progressPercentage + '%';
    
    // Change stat cards color when work shift ends
    const statsCards = document.querySelectorAll('.stat-card');
    if (remainingMs <= 0) {
        statsCards.forEach(card => {
            card.style.background = 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)';
        });
    }
}

function resetTracker() {
    loginTimeString = null;
    if (updateInterval) clearInterval(updateInterval);
    
    document.getElementById('statsSection').style.display = 'none';
    document.getElementById('progressBar').style.display = 'none';
    document.getElementById('resetBtn').style.display = 'none';
    document.getElementById('loginTime').value = '';
    document.getElementById('loginTime').disabled = false;
    
    // Reset button state
    const startBtn = document.querySelector('.input-section button');
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    
    // Reset stat card backgrounds
    const statsCards = document.querySelectorAll('.stat-card');
    statsCards.forEach(card => {
        card.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
    });
}

// Allow Enter key to start tracking
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginTime').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            startTracking();
        }
    });
});
