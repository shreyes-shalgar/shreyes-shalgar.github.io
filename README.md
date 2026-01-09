# Work Hours Tracker

A lightweight, elegant web app to track your 9-hour work shift. Perfect for monitoring how much time you've worked and how much time remains in your shift.

## Features

✨ **Real-time Tracking**
- Live updates of elapsed time and remaining hours
- Visual progress bar showing your progress through the shift

📊 **Three Key Metrics**
- **Time Elapsed**: Hours and minutes worked since login
- **Logout Time**: Your scheduled logout time (login + 9 hours)
- **Time Remaining**: Hours and minutes left in your shift

🎨 **Elegant Design**
- Modern gradient UI with smooth animations
- Responsive design that works on all devices
- Minimalist and lightweight (no dependencies)

## How to Use

1. Enter your login time using the time picker
2. Click "Start Tracking" (or press Enter)
3. Watch your progress in real-time
4. The app displays elapsed time, logout time, and remaining time
5. Click "Reset" to start over

## Features

- **Lightweight**: Pure HTML, CSS, and JavaScript - no frameworks or libraries
- **Fast**: Instant calculations and smooth 60 FPS animations
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Offline**: Works completely offline - no internet required after loading

## Deployment to GitHub Pages

### Method 1: Using your existing repository

1. Push these files to your GitHub repository:
   ```
   index.html
   styles.css
   script.js
   README.md
   ```

2. Go to your repository Settings → Pages
3. Under "Source", select the branch (usually `main` or `master`)
4. Click Save
5. Your site will be live at `https://yourusername.github.io/repository-name`

### Method 2: Create a new repository

1. Create a new repository named `yourusername.github.io` (replace with your GitHub username)
2. Clone it locally
3. Add the HTML, CSS, and JS files
4. Push to GitHub
5. Your site will be live at `https://yourusername.github.io`

## Files Included

- `index.html` - Main HTML structure
- `styles.css` - Elegant styling with gradients and animations
- `script.js` - All functionality for time calculation and tracking
- `README.md` - This file

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Technical Details

- Uses native HTML5 `<input type="time">` for time selection
- Real-time updates every 1 second
- Client-side calculations (no server needed)
- CSS Grid and Flexbox for responsive layout
- Smooth animations with CSS transitions

No external dependencies required!
