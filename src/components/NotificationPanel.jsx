/**
 * NotificationPanel.jsx - Notification Dropdown
 * 
 * Shows recent notifications with read/unread states.
 */

import React, { useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import './NotificationPanel.css';

// Icons
const BellIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20,6 9,17 4,12" />
    </svg>
);

const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3,6 5,6 21,6" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
    </svg>
);

const FireIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
    </svg>
);

const TaskIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
);

const ClockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
    </svg>
);

function NotificationPanel() {
    const {
        notifications,
        showNotificationPanel,
        setShowNotificationPanel,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearNotifications
    } = useUser();

    const panelRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setShowNotificationPanel(false);
            }
        };

        if (showNotificationPanel) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotificationPanel, setShowNotificationPanel]);

    const getIcon = (type) => {
        switch (type) {
            case 'streak': return <FireIcon />;
            case 'task': return <TaskIcon />;
            case 'reminder': return <ClockIcon />;
            default: return <BellIcon />;
        }
    };

    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diff = Math.floor((now - then) / 1000);

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    if (!showNotificationPanel) return null;

    return (
        <div className="notification-panel" ref={panelRef}>
            <div className="notification-header">
                <h3>Notifications</h3>
                {notifications.length > 0 && (
                    <button className="mark-all-btn" onClick={markAllAsRead}>
                        <CheckIcon /> Mark all read
                    </button>
                )}
            </div>

            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="notification-empty">
                        <BellIcon />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-item ${notification.read ? 'read' : ''}`}
                            onClick={() => markAsRead(notification.id)}
                        >
                            <div className={`notification-icon ${notification.type || 'default'}`}>
                                {getIcon(notification.type)}
                            </div>
                            <div className="notification-content">
                                <p className="notification-title">{notification.title}</p>
                                {notification.message && (
                                    <p className="notification-message">{notification.message}</p>
                                )}
                                <span className="notification-time">{getTimeAgo(notification.timestamp)}</span>
                            </div>
                            <button
                                className="notification-delete"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                }}
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {notifications.length > 0 && (
                <div className="notification-footer">
                    <button className="clear-all-btn" onClick={clearNotifications}>
                        Clear all notifications
                    </button>
                </div>
            )}
        </div>
    );
}

export default NotificationPanel;
