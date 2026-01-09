# Work Hours Tracker

A lightweight, elegant web app to track your 9-hour work shift. Perfect for monitoring how much time you've worked and how much time remains in your shift.

## Features

✨ **Real-time Tracking**
- Live updates of elapsed time and remaining hours
- Multiple progress bars showing your progress through the shift
- Visual feedback when work shift ends

📊 **Key Metrics Displayed**
- **Login Time**: Shows your login time in 12-hour format
- **Logout Time**: Your scheduled logout time (login + 9 hours)
- **Time Elapsed**: Hours and minutes worked since login
- **Time Remaining**: Hours and minutes left in your shift

🎨 **Elegant & Intuitive Design**
- Modern gradient UI with smooth animations
- Side-by-side layout for login and logout times
- Responsive design that works on all devices
- Minimalist and lightweight (no dependencies)
- Clean input section that hides during tracking

🔔 **Smart Notifications**
- Browser notification when your work shift ends
- Persistent tracking even after page refresh (same day only)
- Automatic time updates when tracking hasn't started
- Stores your login time locally for session resume

## How to Use

1. Enter your login time using the time picker (defaults to current time)
2. Click "Start Tracking" (or press Enter)
3. Input section disappears - watch your progress in real-time
4. Three progress bars show:
   - Overall progress (time elapsed out of 9 hours)
   - Elapsed time progress
   - Remaining time progress
5. Get a notification when your shift ends
6. Click "Reset" to start over (input section reappears)

## Advanced Features

- **Persistent Sessions**: Close the browser and come back - your tracking resumes automatically
- **Smart Time Input**: Shows current time by default, auto-updates every minute (only when not tracking)
- **12-Hour Format**: All times display in readable 12-hour format with AM/PM
- **Browser Notifications**: Get alerted when shift ends (with permission)
- **Responsive Layout**: 
  - Desktop: 2-column layout for login/logout cards
  - Mobile: Adapts to 1-column for smaller screens
- **Firefox Compatible**: Special styling for better Firefox time input support

## Technical Details

- **Lightweight**: Pure HTML, CSS, and JavaScript - no frameworks or libraries
- **Fast**: Instant calculations and smooth 60 FPS animations
- **Offline**: Works completely offline - no internet required after loading
- **Real-time**: Updates every 1 second with live progress tracking
- **Client-side**: All calculations happen in your browser (no server)
- **Storage**: Uses localStorage for session persistence
- **Responsive**: CSS Grid and Flexbox for perfect layout on all devices

## Browser Compatibility

Works on all modern browsers:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

This app is hosted on GitHub Pages at: **https://shalsh1.github.io**

To deploy your own:
1. Create a repository named `yourusername.github.io`
2. Add these files: `index.html`, `styles.css`, `script.js`
3. Push to GitHub
4. Your site will be live at `https://yourusername.github.io`

## Files

- `index.html` - Main structure with stat cards and progress bars
- `styles.css` - Elegant styling with gradients and animations
- `script.js` - All tracking logic and calculations
- `README.md` - Documentation

Built by **Shreyes Shalgar**

