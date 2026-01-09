/**
 * PreferencesContext.jsx - User Preferences & Notifications
 * 
 * Manages:
 * - Theme preferences
 * - Notification settings
 * - Notification history
 * - UI state (panels)
 * 
 * Separated from auth (UserContext handles Supabase auth)
 */

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo
} from 'react';

const PreferencesContext = createContext();
const PREFERENCES_KEY = 'userPreferences';
const NOTIFICATIONS_KEY = 'notifications';

const defaultSettings = {
    theme: 'light',
    accentColor: '#6366f1',
    notifications: {
        enabled: true,
        dailyReminder: true,
        reminderTime: '09:00',
        streakAlerts: true,
        soundEnabled: false
    }
};

export function PreferencesProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem(PREFERENCES_KEY);
            if (saved) {
                return { ...defaultSettings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('Failed to load preferences:', e);
        }
        return defaultSettings;
    });

    const [notifications, setNotifications] = useState(() => {
        try {
            const saved = localStorage.getItem(NOTIFICATIONS_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load notifications:', e);
        }
        return [];
    });

    const [showNotificationPanel, setShowNotificationPanel] = useState(false);
    const [showProfilePanel, setShowProfilePanel] = useState(false);

    // Save to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(PREFERENCES_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error('Failed to save preferences:', e);
        }
    }, [settings]);

    useEffect(() => {
        try {
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
        } catch (e) {
            console.error('Failed to save notifications:', e);
        }
    }, [notifications]);

    // Apply theme
    useEffect(() => {
        const root = document.documentElement;
        if (settings.theme === 'dark') {
            root.classList.add('dark-theme');
            root.classList.remove('light-theme');
        } else {
            root.classList.add('light-theme');
            root.classList.remove('dark-theme');
        }
        root.style.setProperty('--accent', settings.accentColor);
        root.style.setProperty('--accent-light', `${settings.accentColor}15`);
        root.style.setProperty('--accent-hover', settings.accentColor);
    }, [settings.theme, settings.accentColor]);

    // Settings functions
    const updateSettings = useCallback((updates) => {
        setSettings(prev => ({ ...prev, ...updates }));
    }, []);

    const updateNotificationSettings = useCallback((updates) => {
        setSettings(prev => ({
            ...prev,
            notifications: { ...prev.notifications, ...updates }
        }));
    }, []);

    const toggleTheme = useCallback(() => {
        setSettings(prev => ({
            ...prev,
            theme: prev.theme === 'light' ? 'dark' : 'light'
        }));
    }, []);

    // Notification functions
    const addNotification = useCallback((notification) => {
        const newNotification = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    }, []);

    const markAsRead = useCallback((id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const deleteNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    const resetSettings = useCallback(() => {
        setSettings(defaultSettings);
    }, []);

    const resetAll = useCallback(() => {
        setSettings(defaultSettings);
        setNotifications([]);
        localStorage.removeItem(PREFERENCES_KEY);
        localStorage.removeItem(NOTIFICATIONS_KEY);
    }, []);

    const value = useMemo(() => ({
        settings,
        updateSettings,
        updateNotificationSettings,
        toggleTheme,
        resetSettings,
        resetAll,

        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        deleteNotification,
        unreadCount,

        showNotificationPanel,
        setShowNotificationPanel,
        showProfilePanel,
        setShowProfilePanel
    }), [
        settings, updateSettings, updateNotificationSettings, toggleTheme, resetSettings, resetAll,
        notifications, addNotification, markAsRead, markAllAsRead, clearNotifications, deleteNotification, unreadCount,
        showNotificationPanel, showProfilePanel
    ]);

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences() {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences must be used within PreferencesProvider');
    }
    return context;
}

export default PreferencesContext;
