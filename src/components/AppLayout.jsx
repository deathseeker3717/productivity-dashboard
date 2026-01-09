/**
 * AppLayout.jsx - Main Layout with Sidebar and TopBar
 * 
 * Wraps authenticated views with:
 * - Sidebar navigation
 * - Top bar with search, notifications, profile
 * - View switching
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { useUser } from '../context/UserContext';
import { usePreferences } from '../context/PreferencesContext';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Calendar from './Calendar';
import Analytics from './Analytics';
import HabitDashboard from './HabitDashboard';
import Settings from './Settings';
import MonthSetup from './MonthSetup';
import NotificationPanel from './NotificationPanel';
import UserProfile from './UserProfile';
import GoalForm from './GoalForm';
import Goals from './Goals';
import '../App.css';

// Search icon
const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

// Bell icon
const BellIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
);

function AppLayout() {
    const { user } = useUser();
    const {
        activeView,
        showMonthSetup,
        isLoading
    } = useApp();

    const {
        unreadCount,
        showNotificationPanel,
        setShowNotificationPanel,
        showProfilePanel,
        setShowProfilePanel
    } = usePreferences();

    // Derive user info from Supabase user
    const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

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

        if (!isDeleting && placeholderText === fullText) {
            const cursorInterval = setInterval(() => {
                setCursorVisible(v => !v);
            }, 500);

            const deleteTimeout = setTimeout(() => {
                setIsDeleting(true);
            }, 2000);

            return () => {
                clearInterval(cursorInterval);
                clearTimeout(deleteTimeout);
            };
        }

        setCursorVisible(true);

        const typeTimeout = setTimeout(() => {
            setPlaceholderText(current =>
                isDeleting
                    ? fullText.substring(0, current.length - 1)
                    : fullText.substring(0, current.length + 1)
            );

            setTypingSpeed(isDeleting ? 50 : 150);

            if (isDeleting && placeholderText === '') {
                setIsDeleting(false);
                setLoopNum(prev => prev + 1);
            }
        }, typingSpeed);

        return () => clearTimeout(typeTimeout);
    }, [placeholderText, isDeleting, loopNum, typingSpeed]);

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

    return (
        <div className="app-layout">
            <Sidebar />

            <main className="main-content">
                {/* Search Bar */}
                <div className="top-bar">
                    <div className="search-container">
                        <span className="search-icon"><SearchIcon /></span>
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
                            <BellIcon />
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </button>
                        <div
                            className="user-avatar"
                            onClick={() => setShowProfilePanel(!showProfilePanel)}
                        >
                            {userInitials}
                        </div>
                    </div>
                </div>

                {/* Notification Panel */}
                <NotificationPanel />

                {/* User Profile Panel */}
                <UserProfile />

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

export default AppLayout;
