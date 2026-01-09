# Progress Tracker & Habit Dashboard

A premium, meaningful productivity tool designed to help you build habits, track goals, and visualize your progress with GitHub-style contribution heatmaps.

## Features

- **Habit Tracking**: Define and track daily habits with streaks.
- **Contribution Heatmap**: Visualize your productivity over the year (GitHub-style).
- **Goal Management**: Set monthly and yearly goals.
- **Analytics**: Beautiful charts to track completion rates and trends.
- **Smart Dashboard**: Daily overview with weather integration and quick actions.
- **Premium UI**: Clean, calm, and distraction-free interface with dark/light mode support.

## Tech Stack

- **Framework**: React (Vite)
- **Styling**: Modern CSS Variables & Glassmorphism
- **Icons**: Lucide React / Custom SVG
- **Charts**: Chart.js / React-Chartjs-2
- **State**: React Context API (No external state libraries needed)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/       # UI Components (Heatmap, Calendar, Dashboard)
├── context/          # State Management (UserContext, AppContext)
├── assets/          # Static assets
└── design-system.css # Global design tokens (colors, typography)
```
