/**
 * App.jsx - Main Application Layout
 * 
 * Features:
 * - Persistent sidebar navigation
 * - View mode switching (dashboard, calendar, analytics)
 * - Month setup modal trigger
 * - Loading state handling
 */

import React from 'react';
import { useApp } from './context/AppContext';
import { useUser } from './context/UserContext';
import Sidebar from './components/Sidebar';
import TopStats from './components/TopStats';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import Analytics from './components/Analytics';
import HabitDashboard from './components/HabitDashboard';
import Settings from './components/Settings';
import MonthSetup from './components/MonthSetup';
import NotificationPanel from './components/NotificationPanel';
import UserProfile from './components/UserProfile';
import GoalForm from './components/GoalForm';
import Goals from './components/Goals';
import Auth from './components/Auth';
import './App.css';

// ============================================
// SVG ICONS LIBRARY
// ============================================

export const Icons = {
    dashboard: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    calendar: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
    chart: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    ),
    tasks: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
    ),
    settings: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
    ),
    search: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    bell: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
    ),
    plus: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    edit: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    ),
    trash: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
            <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
    ),
    clock: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
        </svg>
    ),
    chevronLeft: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15,18 9,12 15,6" />
        </svg>
    ),
    chevronRight: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9,18 15,12 9,6" />
        </svg>
    ),
    check: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20,6 9,17 4,12" />
        </svg>
    ),
    target: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    ),
    zap: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
        </svg>
    ),
    flame: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
        </svg>
    ),
    lock: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
    ),
    download: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    ),
    trendUp: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
            <polyline points="17,6 23,6 23,12" />
        </svg>
    ),
    trendDown: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23,18 13.5,8.5 8.5,13.5 1,6" />
            <polyline points="17,18 23,18 23,12" />
        </svg>
    ),
    x: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    menu: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    )
};

// ============================================
// MAIN APP COMPONENT
// ============================================

function App() {
    const {
        activeView,
        showMonthSetup,
        isLoading,
        currentDate
    } = useApp();

    const {
        user,
        unreadCount,
        showNotificationPanel,
        setShowNotificationPanel,
        showProfilePanel,
        setShowProfilePanel,
        isAuthenticated
    } = useUser();

    // Greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Format today's date
    const formatToday = () => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Auth Guard
    if (!isAuthenticated) {
        return <Auth />;
    }

    // Render active view
    const renderView = () => {
        switch (activeView) {
            case 'calendar':
                return <Calendar />;
            case 'analytics':
                return <Analytics />;
            case 'habits':
                return <HabitDashboard />;
            case 'settings':
                return <Settings />;
            case 'goals':
                return <Goals />;
            case 'dashboard':
            default:
                return <Dashboard />;
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="app-layout">
                <div className="loading-screen">
                    <div className="loading-spinner"></div>
                    <p>Loading your data...</p>
                </div>
            </div>
        );
    }

    // Typewriter effect for search
    // Typewriter effect for search
    const [placeholderText, setPlaceholderText] = React.useState('');
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [loopNum, setLoopNum] = React.useState(0);
    const [typingSpeed, setTypingSpeed] = React.useState(150);
    const [cursorVisible, setCursorVisible] = React.useState(true);

    React.useEffect(() => {
        const phrases = ["Search anything...", "Search tasks...", "Search goals...", "Find clarity..."];
        const i = loopNum % phrases.length;
        const fullText = phrases[i];

        // 1. Waiting State (Text Complete)
        if (!isDeleting && placeholderText === fullText) {
            // Blink cursor while waiting
            const cursorInterval = setInterval(() => {
                setCursorVisible(v => !v);
            }, 500);

            // Wait 2s then start deleting
            const deleteTimeout = setTimeout(() => {
                setIsDeleting(true);
            }, 2000);

            return () => {
                clearInterval(cursorInterval);
                clearTimeout(deleteTimeout);
            };
        }

        // 2. Typing/Deleting State
        setCursorVisible(true); // Ensure cursor is visible when moving

        const typeTimeout = setTimeout(() => {
            setPlaceholderText(current =>
                isDeleting
                    ? fullText.substring(0, current.length - 1)
                    : fullText.substring(0, current.length + 1)
            );

            // Speed adjustment
            setTypingSpeed(isDeleting ? 50 : 150);

            // If deletions complete, move to next phrase
            if (isDeleting && placeholderText === '') {
                setIsDeleting(false);
                setLoopNum(prev => prev + 1);
            }
        }, typingSpeed);

        return () => clearTimeout(typeTimeout);
    }, [placeholderText, isDeleting, loopNum, typingSpeed]);

    return (
        <div className="app-layout">
            <Sidebar />

            <main className="main-content">
                {/* Search Bar */}
                <div className="top-bar">
                    <div className="search-container">
                        <span className="search-icon">{Icons.search}</span>
                        <input
                            type="text"
                            placeholder={`${placeholderText}${cursorVisible ? '|' : ' '}`}
                            className="search-input typewriter"
                        />
                    </div>
                    <div className="top-actions">
                        <button
                            className="notification-btn"
                            onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                        >
                            {Icons.bell}
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </button>
                        <div
                            className="user-avatar"
                            onClick={() => setShowProfilePanel(!showProfilePanel)}
                        >
                            {user.initials}
                        </div>
                    </div>
                </div>

                {/* Notification Panel */}
                <NotificationPanel />

                {/* User Profile Panel */}
                <UserProfile />

                {/* Header Greeting - Hide on Dashboard (handled internally) */}
                {activeView !== 'dashboard' && (
                    <header className="page-header">
                        <h1 className="greeting">{getGreeting()}</h1>
                        <p className="greeting-subtitle">Track your progress and stay productive</p>
                    </header>
                )}

                {/* Top Stats - Moved to Dashboard component */}

                {/* Active View */}
                <div className="view-container animate-fadeIn">
                    {renderView()}
                </div>
            </main>

            {/* Month Setup Modal */}
            {showMonthSetup && <MonthSetup />}

            {/* Goal Form Modal */}
            <GoalForm />
        </div>
    );
}

export default App;

