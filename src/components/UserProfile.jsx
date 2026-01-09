/**
 * UserProfile.jsx - User Profile Dropdown
 * 
 * Shows user info and quick actions when avatar is clicked.
 */

import React, { useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { useApp } from '../context/AppContext';
import './UserProfile.css';

// Icons
const UserIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const SettingsIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
);

const LogoutIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16,17 21,12 16,7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const ChartIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const FireIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
    </svg>
);

function UserProfile() {
    const {
        user,
        showProfilePanel,
        setShowProfilePanel,
        resetAll,
        logout
    } = useUser();

    const { setActiveView, calculateStreak, monthProgress } = useApp();
    const panelRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setShowProfilePanel(false);
            }
        };

        if (showProfilePanel) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showProfilePanel, setShowProfilePanel]);

    const handleNavigation = (view) => {
        setActiveView(view);
        setShowProfilePanel(false);
    };

    if (!showProfilePanel) return null;

    return (
        <div className="user-profile-panel" ref={panelRef}>
            {/* User Info */}
            <div className="profile-header">
                <div className="profile-avatar">
                    {user.initials}
                </div>
                <div className="profile-info">
                    <h4>{user.name}</h4>
                    {user.email && <p>{user.email}</p>}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="profile-stats">
                <div className="profile-stat">
                    <FireIcon />
                    <span className="stat-value">{calculateStreak}</span>
                    <span className="stat-label">Streak</span>
                </div>
                <div className="profile-stat">
                    <ChartIcon />
                    <span className="stat-value">{monthProgress}%</span>
                    <span className="stat-label">This Month</span>
                </div>
            </div>

            {/* Actions */}
            <div className="profile-actions">
                <button className="profile-action" onClick={() => handleNavigation('analytics')}>
                    <ChartIcon />
                    <span>View Analytics</span>
                </button>
                <button className="profile-action" onClick={() => handleNavigation('settings')}>
                    <SettingsIcon />
                    <span>Settings</span>
                </button>
            </div>

            {/* Footer */}
            <div className="profile-footer">
                <button className="logout-btn" onClick={() => {
                    if (confirm('Sign out?')) {
                        logout();
                        setShowProfilePanel(false);
                    }
                }}>
                    <LogoutIcon />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
}

export default UserProfile;
