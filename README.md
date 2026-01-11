# Progress Tracker & Habit Dashboard

A premium, meaningful productivity tool designed to help you build habits, track goals, and visualize your progress with GitHub-style contribution heatmaps.

## Current Features

### Core Productivity
- **Habit Tracking**: Define and track daily habits with streak monitoring.
- **Contribution Heatmap**: Visualize your productivity over the year with a GitHub-style heatmap.
- **Goal Management**: Set and track monthly and yearly goals with progress bars.
- **Smart Dashboard**: Daily overview with integrated weather updates and quick actions.

### Advanced Functionality
- **Global Search**: Real-time search across tasks, goals, and dates with keyboard navigation.
- **Authentication**: Secure login/signup via Supabase (Email/Password) and Google OAuth.
- **Data Management**:
  - Export data as JSON (Backup).
  - Export tasks as CSV (Spreadsheet).
  - Import data from JSON backups.
  - Clear all data with safety confirmation.

### User Experience
- **Premium UI**: Clean, calm, and distraction-free interface.
- **Theming**: Dark/Light mode support with customizable accent colors.
- **Notifications**: Daily reminders and streak alerts.
- **Analytics**: Beautiful charts using Chart.js to track completion rates and trends.

## Tech Stack

- **Framework**: React (Vite)
- **Backend/Auth**: Supabase
- **Styling**: Modern CSS Variables & Glassmorphism
- **Icons**: Lucide React / Custom SVG
- **Charts**: Chart.js / React-Chartjs-2
- **State**: React Context API + Supabase Auth
- **Date Handling**: date-fns

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
├── components/       # UI Components (Heatmap, GlobalSearch, Auth, Settings)
├── context/          # State Management (UserContext, AppContext, PreferencesContext)
├── assets/           # Static assets
├── design-system.css # Global design tokens (colors, typography)
└── supabase.js       # Supabase client configuration
```
