let loginTimeString = null;
let updateInterval = null;
let shiftEndNotified = false;
let currentTimeUpdateInterval = null;

// Time balance tracking (in milliseconds) - carries forward to next day
function getTimeBalance() {
    const balance = localStorage.getItem('timeBalance');
    return balance ? parseInt(balance) : 0;
}

function setTimeBalance(balanceMs) {
    localStorage.setItem('timeBalance', balanceMs.toString());
    localStorage.setItem('lastBalanceUpdate', new Date().toDateString());
    localStorage.setItem('lastBalanceMonth', new Date().getMonth().toString());
    localStorage.setItem('lastBalanceYear', new Date().getFullYear().toString());
}

function checkAndResetMonthlyBalance() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const lastMonth = localStorage.getItem('lastBalanceMonth');
    const lastYear = localStorage.getItem('lastBalanceYear');
    
    // If month or year changed, reset balance
    if (lastMonth !== null && lastYear !== null) {
        const lastMonthNum = parseInt(lastMonth);
        const lastYearNum = parseInt(lastYear);
        
        if (currentYear > lastYearNum || (currentYear === lastYearNum && currentMonth > lastMonthNum)) {
            // New month detected, reset balance
            const oldBalance = getTimeBalance();
            if (oldBalance !== 0) {
                // Save a record of the monthly reset
                const { formatted } = formatTimeBalance(oldBalance);
                const record = {
                    date: now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                    loginTime: '-',
                    logoutTime: '-',
                    hoursWorked: '-',
                    previousBalance: formatted,
                    newBalance: '+0h 0m',
                    status: 'Monthly Reset'
                };
                addAttendanceRecord(record);
            }
            setTimeBalance(0);
            return true;
        }
    } else {
        // First time setup
        localStorage.setItem('lastBalanceMonth', currentMonth.toString());
        localStorage.setItem('lastBalanceYear', currentYear.toString());
    }
    
    return false;
}

function getAttendanceHistory() {
    const history = localStorage.getItem('attendanceHistory');
    return history ? JSON.parse(history) : [];
}

function addAttendanceRecord(record) {
    const history = getAttendanceHistory();
    history.push(record);
    localStorage.setItem('attendanceHistory', JSON.stringify(history));
}

function exportToExcel() {
    const history = getAttendanceHistory();
    
    if (history.length === 0) {
        alert('No attendance records found. Complete at least one work session to generate a report.');
        return;
    }
    
    // Helper function to escape CSV fields
    function escapeCSV(field) {
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
            return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
    }
    
    // Create CSV content
    let csv = 'Date,Login Time,Logout Time,Hours Worked,Previous Balance,Today\'s Balance,New Balance,Status\n';
    
    history.forEach(record => {
        const todaysBalance = record.todaysBalance || '-';
        csv += `${escapeCSV(record.date)},${escapeCSV(record.loginTime)},${escapeCSV(record.logoutTime)},${escapeCSV(record.hoursWorked)},${escapeCSV(record.previousBalance)},${escapeCSV(todaysBalance)},${escapeCSV(record.newBalance)},${escapeCSV(record.status)}\n`;
    });
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function clearAllData() {
    if (confirm('Are you sure you want to clear ALL data including attendance history? This cannot be undone.')) {
        localStorage.removeItem('attendanceHistory');
        setTimeBalance(0);
        alert('All attendance data has been cleared.');
        updateBalancePreview();
    }
}

function formatTimeBalance(ms) {
    const absMs = Math.abs(ms);
    const hours = Math.floor(absMs / (1000 * 60 * 60));
    const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));
    const sign = ms < 0 ? '-' : '+';
    return { sign, hours, minutes, formatted: `${sign}${hours}h ${minutes}m` };
}

function updateBalanceDisplay() {
    const balance = getTimeBalance();
    const balanceCard = document.getElementById('balanceCard');
    const balanceValue = document.getElementById('balance');
    const balanceInfo = document.getElementById('balanceInfo');
    
    if (balance === 0) {
        balanceValue.textContent = '0h 0m';
        balanceValue.style.color = '#667eea';
        balanceCard.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
        balanceInfo.textContent = 'No pending dues or credits';
    } else {
        const { sign, hours, minutes } = formatTimeBalance(balance);
        balanceValue.textContent = `${sign}${hours}h ${minutes}m`;
        
        if (balance < 0) {
            // Overdue - red
            balanceValue.style.color = '#e74c3c';
            balanceCard.style.background = 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)';
            balanceInfo.textContent = 'You have pending overdue to cover';
        } else {
            // Credit/Overtime - green
            balanceValue.style.color = '#27ae60';
            balanceCard.style.background = 'linear-gradient(135deg, #a8e6cf 0%, #81c784 100%)';
            balanceInfo.textContent = 'You have overtime credit';
        }
    }
}

function startTracking() {
    const loginInput = document.getElementById('loginTime').value;
    
    if (!loginInput) {
        alert('Please enter your login time');
        return;
    }
    
    loginTimeString = loginInput;
    
    // Check if this is the first login of the day
    const savedStartDate = localStorage.getItem('workTrackerStartDate');
    const currentDate = new Date().toDateString();
    const firstLoginTime = localStorage.getItem('firstLoginTime');
    
    if (savedStartDate !== currentDate || !firstLoginTime) {
        // First login of the day
        localStorage.setItem('firstLoginTime', loginInput);
        
        // Store the previous balance (before today) separately
        const currentBalance = getTimeBalance();
        localStorage.setItem('previousDayBalance', currentBalance.toString());
        
        // Store the adjusted work requirement for the day (only calculated once)
        const workingHours = getWorkingHours();
        const baseWorkMs = workingHours * 60 * 60 * 1000;
        const adjustedWorkMs = baseWorkMs - currentBalance;
        localStorage.setItem('dailyAdjustedWorkMs', adjustedWorkMs.toString());
    }
    
    // Save current session login time
    localStorage.setItem('workTrackerLoginTime', loginInput);
    localStorage.setItem('workTrackerStartDate', currentDate);
    localStorage.setItem('currentSessionStart', new Date().getTime().toString());
    
    // Stop updating the current time when tracking starts
    if (currentTimeUpdateInterval) clearInterval(currentTimeUpdateInterval);
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    displayTracking();
    
    // Start updating immediately and then every second
    updateStats();
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(updateStats, 1000);
}

function displayTracking() {
    document.getElementById('balanceSection').style.display = 'block';
    document.getElementById('statsSection').style.display = 'grid';
    document.getElementById('progressBar').style.display = 'block';
    document.getElementById('trackingButtons').style.display = 'flex';
    document.getElementById('inputSection').style.display = 'none';
    updateBalanceDisplay();
}

function updateStats() {
    const now = new Date();
    
    // Get first login time of the day
    const firstLoginTime = localStorage.getItem('firstLoginTime') || loginTimeString;
    const [hours, minutes] = firstLoginTime.split(':').map(Number);
    
    // Create login time for today using first login
    const loginTime = new Date();
    loginTime.setHours(hours, minutes, 0, 0);
    
    // Get current balance and adjust required work time
    const currentBalance = getTimeBalance();
    const dailyAdjustedWorkMs = parseInt(localStorage.getItem('dailyAdjustedWorkMs'));
    
    // Use the daily adjusted work time (calculated once at start of day)
    const workingHours = getWorkingHours();
    const adjustedWorkMs = dailyAdjustedWorkMs || (workingHours * 60 * 60 * 1000);
    
    // Calculate logout time (first login + adjusted work time)
    const logoutTime = new Date(loginTime.getTime() + adjustedWorkMs);
    
    // Calculate elapsed time from first login to now
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
    
    // Format first login time in 12-hour format
    let loginHours = loginTime.getHours();
    const loginMinutes = String(loginTime.getMinutes()).padStart(2, '0');
    const loginAmpm = loginHours >= 12 ? 'PM' : 'AM';
    loginHours = loginHours % 12 || 12;
    const loginTimeFormatted = `${String(loginHours).padStart(2, '0')}:${loginMinutes} ${loginAmpm}`;
    
    // Update display
    document.getElementById('elapsed').textContent = 
        `${elapsedHours}h ${elapsedMinutes}m`;
    document.getElementById('loginTimeDisplay').textContent = loginTimeFormatted;
    document.getElementById('logoutTime').textContent = logoutTimeFormatted;
    
    // Calculate and display remaining time or overtime
    if (remainingMs > 0) {
        document.getElementById('remaining').innerHTML = `${remainingHours}h ${remainingMinutes}m`;
        document.getElementById('remainingLabel').textContent = 'Time Remaining';
    } else {
        const overtimeMs = Math.abs(remainingMs);
        const overtimeHours = Math.floor(overtimeMs / (1000 * 60 * 60));
        const overtimeMinutes = Math.floor((overtimeMs % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById('remaining').innerHTML = 
            `-${overtimeHours}h ${overtimeMinutes}m<br><small style="font-size: 14px;">Work shift ended!</small>`;
    }
    
    // Update progress bars
    const totalMs = adjustedWorkMs; // Use adjusted work time for progress calculation
    const progressPercentage = Math.min((elapsedMs / totalMs) * 100, 100);
    const remainingPercentage = Math.max(((remainingMs / totalMs) * 100), 0);
    
    // Overall progress (time elapsed)
    document.getElementById('progressFill').style.width = progressPercentage + '%';
    
    // Elapsed progress bar
    document.getElementById('elapsedFill').style.width = progressPercentage + '%';
    
    // Remaining progress bar
    document.getElementById('remainingFill').style.width = remainingPercentage + '%';
    
    // Change card colors based on shift status
    const remainingCard = document.getElementById('remainingCard');
    if (remainingMs <= 0) {
        // Change remaining/overtime card to red/orange gradient
        remainingCard.style.background = 'linear-gradient(135deg, #d38181 0%, #d86877 100%)';
        
        // Send notification once when shift ends
        if (!shiftEndNotified && 'Notification' in window && Notification.permission === 'granted') {
            const workingHours = getWorkingHours();
            new Notification('Work Shift Ended! 🎉', {
                body: `Your ${workingHours}-hour work shift is complete. Time to logout!`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">🎉</text></svg>'
            });
            shiftEndNotified = true;
        }
    } else {
        // Reset to default color when time remaining
        remainingCard.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
    }
}

function logoutTracker() {
    // Calculate and save the balance before logging out
    if (loginTimeString) {
        const now = new Date();
        
        // Get first login time of the day
        const firstLoginTime = localStorage.getItem('firstLoginTime') || loginTimeString;
        const [hours, minutes] = firstLoginTime.split(':').map(Number);
        
        const loginTime = new Date();
        loginTime.setHours(hours, minutes, 0, 0);
        
        // Total time elapsed = current logout time - first login time
        const totalElapsedMs = now - loginTime;
        
        // Get the previous balance (from before today)
        const previousDayBalance = parseInt(localStorage.getItem('previousDayBalance') || '0');
        const workingHours = getWorkingHours();
        const baseWorkMs = workingHours * 60 * 60 * 1000;
        
        // Calculate TODAY'S balance = elapsed time - working hours
        const todaysBalance = totalElapsedMs - baseWorkMs;
        
        // Total balance = previous balance + today's balance
        const totalBalance = previousDayBalance + todaysBalance;
        
        // Update the global balance with total
        setTimeBalance(totalBalance);
        
        // Save/Update attendance record for the day
        const hoursWorked = totalElapsedMs / (1000 * 60 * 60);
        const hoursWorkedFormatted = `${Math.floor(hoursWorked)}h ${Math.floor((hoursWorked % 1) * 60)}m`;
        
        const loginTimeFormatted = firstLoginTime;
        const logoutTimeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        // Store last logout time and today's balance
        localStorage.setItem('lastLogoutTime', logoutTimeFormatted);
        localStorage.setItem('todaysBalance', todaysBalance.toString());
        
        const { formatted: prevBalance } = formatTimeBalance(previousDayBalance);
        const { formatted: todaysBalanceFormatted } = formatTimeBalance(todaysBalance);
        const { formatted: totalBalanceFormatted } = formatTimeBalance(totalBalance);
        
        let status = 'On Time';
        if (todaysBalance > 15 * 60 * 1000) status = 'Overtime';
        else if (todaysBalance < -15 * 60 * 1000) status = 'Undertime';
        
        const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        
        // Check if there's already a record for today and update it
        const history = getAttendanceHistory();
        const todayRecordIndex = history.findIndex(record => record.date === currentDate);
        
        const record = {
            date: currentDate,
            loginTime: loginTimeFormatted,
            logoutTime: logoutTimeFormatted,
            hoursWorked: hoursWorkedFormatted,
            previousBalance: prevBalance,
            todaysBalance: todaysBalanceFormatted,
            newBalance: totalBalanceFormatted,
            status: status
        };
        
        if (todayRecordIndex !== -1) {
            // Update existing record
            history[todayRecordIndex] = record;
            localStorage.setItem('attendanceHistory', JSON.stringify(history));
        } else {
            // Add new record
            addAttendanceRecord(record);
        }
    }
    
    loginTimeString = null;
    shiftEndNotified = false;
    if (updateInterval) clearInterval(updateInterval);
    if (currentTimeUpdateInterval) clearInterval(currentTimeUpdateInterval);
    
    // Clear current session but keep first login time for the day
    localStorage.removeItem('workTrackerLoginTime');
    localStorage.removeItem('currentSessionStart');
    
    document.getElementById('balanceSection').style.display = 'none';
    document.getElementById('statsSection').style.display = 'none';
    document.getElementById('progressBar').style.display = 'none';
    document.getElementById('trackingButtons').style.display = 'none';
    document.getElementById('inputSection').style.display = 'flex';
    document.getElementById('loginTime').value = '';
    document.getElementById('loginTime').disabled = false;
    
    // Reset button state
    const startBtn = document.querySelector('.input-section button');
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    
    // Reset the remaining card background
    document.getElementById('remainingCard').style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
    
    // Reset the label back to "Time Remaining"
    document.getElementById('remainingLabel').textContent = 'Time Remaining';
    
    // Update balance preview and restart updating current time
    updateBalancePreview();
    setCurrentTime();
    currentTimeUpdateInterval = setInterval(setCurrentTime, 60000);
}

function resetTracker() {
    // Calculate and save the balance before resetting
    if (loginTimeString) {
        const now = new Date();
        
        // Get first login time and last logout time
        const firstLoginTime = localStorage.getItem('firstLoginTime') || loginTimeString;
        const lastLogoutTime = localStorage.getItem('lastLogoutTime');
        const storedTodaysBalance = localStorage.getItem('todaysBalance');
        
        const [loginHours, loginMinutes] = firstLoginTime.split(':').map(Number);
        const loginTime = new Date();
        loginTime.setHours(loginHours, loginMinutes, 0, 0);
        
        let totalElapsedMs;
        let logoutTimeFormatted;
        let todaysBalance;
        
        if (storedTodaysBalance && lastLogoutTime) {
            // Already logged out - use stored values
            todaysBalance = parseInt(storedTodaysBalance);
            logoutTimeFormatted = lastLogoutTime;
            const [logoutHours, logoutMinutes] = lastLogoutTime.split(':').map(Number);
            const logoutTime = new Date();
            logoutTime.setHours(logoutHours, logoutMinutes, 0, 0);
            totalElapsedMs = logoutTime - loginTime;
        } else {
            // Still logged in - calculate now
            totalElapsedMs = now - loginTime;
            logoutTimeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const workingHours = getWorkingHours();
            const baseWorkMs = workingHours * 60 * 60 * 1000;
            todaysBalance = totalElapsedMs - baseWorkMs;
        }
        
        const previousDayBalance = parseInt(localStorage.getItem('previousDayBalance') || '0');
        const totalBalance = previousDayBalance + todaysBalance;
        
        // Save attendance record
        const hoursWorked = totalElapsedMs / (1000 * 60 * 60);
        const hoursWorkedFormatted = `${Math.floor(hoursWorked)}h ${Math.floor((hoursWorked % 1) * 60)}m`;
        
        const loginTimeFormatted = firstLoginTime;
        
        const { formatted: prevBalance } = formatTimeBalance(previousDayBalance);
        const { formatted: todaysBalanceFormatted } = formatTimeBalance(todaysBalance);
        const { formatted: totalBalanceFormatted } = formatTimeBalance(totalBalance);
        
        let status = 'On Time';
        if (todaysBalance > 15 * 60 * 1000) status = 'Overtime';
        else if (todaysBalance < -15 * 60 * 1000) status = 'Undertime';
        
        const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        
        // Check if there's already a record for today and update it
        const history = getAttendanceHistory();
        const todayRecordIndex = history.findIndex(record => record.date === currentDate);
        
        const record = {
            date: currentDate,
            loginTime: loginTimeFormatted,
            logoutTime: logoutTimeFormatted,
            hoursWorked: hoursWorkedFormatted,
            previousBalance: prevBalance,
            todaysBalance: todaysBalanceFormatted,
            newBalance: totalBalanceFormatted,
            status: status
        };
        
        if (todayRecordIndex !== -1) {
            // Update existing record
            history[todayRecordIndex] = record;
            localStorage.setItem('attendanceHistory', JSON.stringify(history));
        } else {
            // Add new record
            addAttendanceRecord(record);
        }
    }
    
    loginTimeString = null;
    shiftEndNotified = false;
    if (updateInterval) clearInterval(updateInterval);
    if (currentTimeUpdateInterval) clearInterval(currentTimeUpdateInterval);
    
    // Clear all daily session data
    localStorage.removeItem('workTrackerLoginTime');
    localStorage.removeItem('workTrackerStartDate');
    localStorage.removeItem('firstLoginTime');
    localStorage.removeItem('totalWorkedMs');
    localStorage.removeItem('currentSessionStart');
    localStorage.removeItem('lastLogoutTime');
    localStorage.removeItem('dailyAdjustedWorkMs');
    localStorage.removeItem('previousDayBalance');
    localStorage.removeItem('todaysBalance');
    
    document.getElementById('balanceSection').style.display = 'none';
    document.getElementById('statsSection').style.display = 'none';
    document.getElementById('progressBar').style.display = 'none';
    document.getElementById('trackingButtons').style.display = 'none';
    document.getElementById('inputSection').style.display = 'flex';
    document.getElementById('loginTime').value = '';
    document.getElementById('loginTime').disabled = false;
    
    // Reset button state
    const startBtn = document.querySelector('.input-section button');
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    
    // Reset the remaining card background
    document.getElementById('remainingCard').style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
    
    // Reset the label back to "Time Remaining"
    document.getElementById('remainingLabel').textContent = 'Time Remaining';
    
    // Restart updating current time
    setCurrentTime();
    currentTimeUpdateInterval = setInterval(setCurrentTime, 60000);
}

function setCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('loginTime').value = `${hours}:${minutes}`;
}

function clearBalance() {
    if (confirm('Are you sure you want to clear your time balance? This will reset all carried forward overdues and overtime credits.')) {
        setTimeBalance(0);
        updateBalancePreview();
    }
}

function updateBalancePreview() {
    const balance = getTimeBalance();
    const balancePreview = document.getElementById('balancePreview');
    const balancePreviewValue = document.getElementById('balancePreviewValue');
    
    if (balance !== 0) {
        balancePreview.style.display = 'flex';
        const { formatted } = formatTimeBalance(balance);
        balancePreviewValue.textContent = formatted;
        
        if (balance < 0) {
            balancePreviewValue.style.color = '#e74c3c';
        } else {
            balancePreviewValue.style.color = '#27ae60';
        }
    } else {
        balancePreview.style.display = 'none';
    }
}

function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    const hamburger = document.getElementById('hamburgerMenu');
    
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function closeMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    const hamburger = document.getElementById('hamburgerMenu');
    
    menu.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.classList.remove('active');
}

function getWorkingHours() {
    const hours = localStorage.getItem('workingHours');
    return hours ? parseFloat(hours) : 9; // Default to 9 hours
}

function setWorkingHours(hours) {
    localStorage.setItem('workingHours', hours.toString());
}

function openWorkingHoursSettings() {
    const modal = document.getElementById('settingsModal');
    const overlay = document.getElementById('settingsModalOverlay');
    const input = document.getElementById('workingHours');
    
    input.value = getWorkingHours();
    modal.classList.add('active');
    overlay.classList.add('active');
}

function closeWorkingHoursSettings() {
    const modal = document.getElementById('settingsModal');
    const overlay = document.getElementById('settingsModalOverlay');
    
    modal.classList.remove('active');
    overlay.classList.remove('active');
}

function saveWorkingHours() {
    const input = document.getElementById('workingHours');
    const hours = parseFloat(input.value);
    
    if (isNaN(hours) || hours < 1 || hours > 24) {
        alert('Please enter a valid number of hours between 1 and 24');
        return;
    }
    
    setWorkingHours(hours);
    closeWorkingHoursSettings();
    alert(`Working hours set to ${hours} hours per day`);
}

// Initialize app on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check and reset balance if new month
    const wasReset = checkAndResetMonthlyBalance();
    
    // Update balance preview on the input screen
    updateBalancePreview();
    
    if (wasReset) {
        // Show a brief notification if balance was reset
        const notification = document.createElement('div');
        notification.className = 'monthly-reset-notification';
        notification.textContent = '🗓️ Balance reset for new month';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
    
    // Check if there's a saved login time
    const savedLoginTime = localStorage.getItem('workTrackerLoginTime');
    const savedStartDate = localStorage.getItem('workTrackerStartDate');
    const currentDate = new Date().toDateString();
    
    // Resume tracking if login was from today
    if (savedLoginTime && savedStartDate === currentDate) {
        loginTimeString = savedLoginTime;
        document.getElementById('loginTime').value = savedLoginTime;
        shiftEndNotified = false; // Reset notification flag
        displayTracking();
        
        // Start updating immediately and then every second
        updateStats();
        if (updateInterval) clearInterval(updateInterval);
        updateInterval = setInterval(updateStats, 1000);
    } else {
        // Only show and update current time if tracking hasn't started
        setCurrentTime();
        currentTimeUpdateInterval = setInterval(setCurrentTime, 60000);
    }
    
    // Allow Enter key to start tracking
    document.getElementById('loginTime').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            startTracking();
        }
    });
});
