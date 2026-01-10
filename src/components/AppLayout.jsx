/**
 * AppLayout.jsx - Main Layout with Sidebar and TopBar
 * 
 * Wraps authenticated views with:
 * - Sidebar navigation
 * - Top bar with search, notifications, profile
 * - View switching
 * - Error boundaries for crash protection
 */

import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useUser } from '../context/UserContext';
import { usePreferences } from '../context/PreferencesContext';
import ErrorBoundary from './ErrorBoundary';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import NotificationPanel from './NotificationPanel';
import UserProfile from './UserProfile';
import { SkeletonDashboard, SkeletonChart, SkeletonHeatmap, SkeletonTaskList } from './SkeletonUI';
import '../App.css';

// Lazy load heavy components
const Calendar = lazy(() => import('./Calendar'));
const Analytics = lazy(() => import('./Analytics'));
const HabitDashboard = lazy(() => import('./HabitDashboard'));
const Settings = lazy(() => import('./Settings'));
const Goals = lazy(() => import('./Goals'));
const MonthSetup = lazy(() => import('./MonthSetup'));
const GoalForm = lazy(() => import('./GoalForm'));

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

// View loading fallback
const ViewLoadingFallback = () => (
    <div className="view-loading-fallback">
        <SkeletonDashboard />
    </div>
);

// Minimal view fallback for errors
const ViewErrorFallback = ({ retry }) => (
    <div className="view-error-fallback">
        <p>Unable to load this view</p>
        {retry && (
            <button onClick={retry} className="btn btn-secondary">
                Retry
            </button>
        )}
    </div>
);

function AppLayout() {
    const { user } = useUser();
    const {
        activeView,
        showMonthSetup,
        isLoading,
        showGoalModal
    } = useApp();

    const {
        unreadCount,
        showNotificationPanel,
        setShowNotificationPanel,
        showProfilePanel,
        setShowProfilePanel
    } = usePreferences();

    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Derive user info from Supabase user with null checks
    const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
    const userInitials = userName
        .split(' ')
        .map(n => n?.[0] || '')
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    // Typewriter effect for search
    const [placeholderText, setPlaceholderText] = React.useState('');
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [loopNum, setLoopNum] = React.useState(0);
    const [typingSpeed, setTypingSpeed] = React.useState(150);
    const [cursorVisible, setCursorVisible] = React.useState(true);

    React.useEffect(() => {
        if (!isMountedRef.current) return;

        const phrases = ["Search anything...", "Search tasks...", "Search goals...", "Find clarity..."];
        const i = loopNum % phrases.length;
        const fullText = phrases[i];

        if (!isDeleting && placeholderText === fullText) {
            const cursorInterval = setInterval(() => {
                if (isMountedRef.current) {
                    setCursorVisible(v => !v);
                }
            }, 500);

            const deleteTimeout = setTimeout(() => {
                if (isMountedRef.current) {
                    setIsDeleting(true);
                }
            }, 2000);

            return () => {
                clearInterval(cursorInterval);
                clearTimeout(deleteTimeout);
            };
        }

        if (isMountedRef.current) {
            setCursorVisible(true);
        }

        const typeTimeout = setTimeout(() => {
            if (!isMountedRef.current) return;

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

    // Render active view with error boundary
    const renderView = () => {
        const viewContent = (() => {
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
        })();

        return (
            <ErrorBoundary
                fallback={ViewErrorFallback}
                message="Unable to load this view"
            >
                <Suspense fallback={<ViewLoadingFallback />}>
                    {viewContent}
                </Suspense>
            </ErrorBoundary>
        );
    };

    // Loading state - should not occur often due to boot sequence
    if (isLoading) {
        return (
            <div className="app-layout">
                <SkeletonDashboard />
            </div>
        );
    }

    return (
        <div className="app-layout">
            <ErrorBoundary fallback={<div className="sidebar-fallback" />}>
                <Sidebar />
            </ErrorBoundary>

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
                <ErrorBoundary fallback={null}>
                    <NotificationPanel />
                </ErrorBoundary>

                {/* User Profile Panel */}
                <ErrorBoundary fallback={null}>
                    <UserProfile />
                </ErrorBoundary>

                {/* Active View */}
                <div className="view-container content-fade-in">
                    {renderView()}
                </div>
            </main>

            {/* Month Setup Modal */}
            {showMonthSetup && (
                <ErrorBoundary fallback={null}>
                    <Suspense fallback={null}>
                        <MonthSetup />
                    </Suspense>
                </ErrorBoundary>
            )}

            {/* Goal Form Modal */}
            {showGoalModal && (
                <ErrorBoundary fallback={null}>
                    <Suspense fallback={null}>
                        <GoalForm />
                    </Suspense>
                </ErrorBoundary>
            )}
        </div>
    );
}

export default AppLayout;
