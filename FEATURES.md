# Consolidated Attendance Tool - Features

## Overview
This is a consolidated work hours tracking tool that maintains a running balance of overtime and overdues, carrying them forward day-to-day.

## Key Features

### 1. **Time Balance Tracking (Carry Forward)**
- The tool tracks your cumulative time balance across multiple days
- **Overtime Credit (+)**: When you work more than 9 hours, the extra time is saved as credit
- **Overdue Debt (-)**: When you work less than 9 hours, the shortfall is tracked as debt
- This balance automatically adjusts your required logout time the next day

### 2. **Adjusted Logout Time**
- The "Adjusted Logout" time shown accounts for your previous balance
- If you have **overtime credit**: You can leave earlier than a standard 9-hour shift
- If you have **overdue debt**: You need to work longer to cover the missed hours
- Formula: `Adjusted Work Time = 9 hours - Current Balance`

### 3. **Visual Balance Indicators**
On the main screen, you'll see a "Time Balance" card with color coding:
- **Green**: You have overtime credit (positive balance)
- **Orange/Yellow**: You have overdue time to cover (negative balance)  
- **Blue/Gray**: No balance (0h 0m)

### 4. **Balance Preview on Login**
- Before starting tracking, you can see your previous balance
- A small preview box shows your carried forward time with a clear button (×) to reset if needed

### 5. **Persistent Storage**
- All balance data is stored in your browser's localStorage
- Balance persists across browser sessions and days
- Only cleared when you manually reset it or clear browser data

## How It Works

### Example Scenarios:

**Day 1**: You work 10 hours (1 hour overtime)
- Balance: **+1h 0m** (credit)

**Day 2**: You login, and your adjusted logout is 8 hours from login
- Required work: 9h - 1h = 8 hours
- You work exactly 8 hours and leave
- New Balance: **0h 0m**

**Day 3**: You only work 8 hours and 30 minutes
- Balance: **-0h 30m** (overdue)

**Day 4**: Your adjusted logout requires 9h 30m of work
- Required work: 9h + 0h 30m = 9 hours 30 minutes

## Controls

- **Start Tracking**: Begins tracking your work hours for the day
- **Reset**: Stops tracking and calculates the balance for the current session
- **Clear Balance (×)**: Resets the entire balance to 0h 0m (requires confirmation)

## Technical Details

- Balance is stored in milliseconds in localStorage
- Balance key: `timeBalance`
- Last update date: `lastBalanceUpdate`
- Standard work day: 9 hours
- Real-time updates every second while tracking is active
