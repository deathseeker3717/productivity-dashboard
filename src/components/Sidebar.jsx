/**
 * Sidebar.jsx - Premium Dark Sidebar
 * 
 * Features:
 * - Dark theme matching the design
 * - Rotating animated clock/progress logo
 * - Menu navigation
 * - Promotional widget
 * - Settings at bottom
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import './Sidebar.css';

// Animated Logo Component - Clock with rotating animation
const AnimatedLogo = () => (
    <svg viewBox="0 0 32 32" fill="none" className="logo-svg animate-spin-slow">
        {/* Outer ring */}
        <circle cx="16" cy="16" r="14" stroke="url(#logoGradient)" strokeWidth="2" fill="none" opacity="0.5" />
        {/* Progress arc */}
        <path
            d="M16 2 A14 14 0 0 1 30 16"
            stroke="url(#logoGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
        />
        {/* Clock hands */}
        <line x1="16" y1="16" x2="16" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="16" y1="16" x2="22" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round" />
        {/* Center dot */}
        <circle cx="16" cy="16" r="2" fill="white" />
        {/* Gradient definition */}
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
        </defs>
    </svg>
);

// Icon components for menu items
const DashboardIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
);

const TasksIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
);

const CalendarIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const PerformanceIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const SettingsIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
);

const GoalsIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

function Sidebar() {
    const { activeView, setActiveView } = useApp();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
        { id: 'habits', label: 'Tasks', icon: <TasksIcon /> },
        { id: 'goals', label: 'Goals', icon: <GoalsIcon /> },
        { id: 'calendar', label: 'Calendar', icon: <CalendarIcon /> },
        { id: 'analytics', label: 'Performance', icon: <PerformanceIcon /> },
    ];

    return (
        <aside className="sidebar">
            {/* Logo - Click to go home */}
            <div className="sidebar-header" onClick={() => setActiveView('dashboard')} style={{ cursor: 'pointer' }}>
                <div className="logo-wrapper">
                    <AnimatedLogo />
                </div>
                <span className="logo-text">Taskly</span>
            </div>

            {/* Menu */}
            <nav className="sidebar-nav">
                <div className="nav-label">Menu</div>
                <div className="nav-items">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                            onClick={() => setActiveView(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-text">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Promo Card */}
            <div className="promo-card">
                <h4>Be 137% more productive</h4>
                <p>Track all your tasks, notes, and goals.</p>
                <button className="promo-btn">Upgrade</button>
            </div>

            {/* Settings */}
            <div className="sidebar-footer">
                <button className="nav-item" onClick={() => setActiveView('settings')}>
                    <span className="nav-icon"><SettingsIcon /></span>
                    <span className="nav-text">Settings</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
