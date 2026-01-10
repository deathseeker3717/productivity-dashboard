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
    useMemo,
    useRef
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
    const [isInitialized, setIsInitialized] = useState(false);
    const isMountedRef = useRef(true);

    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem(PREFERENCES_KEY);
            if (saved) {
                return { ...defaultSettings, ...JSON.parse(saved) };
            }
        } catch {
            // Silent fail
        }
        return defaultSettings;
    });

    const [notifications, setNotifications] = useState(() => {
        try {
            const saved = localStorage.getItem(NOTIFICATIONS_KEY);
            if (saved) {
                return JSON.parse(saved) || [];
            }
        } catch {
            // Silent fail
        }
        return [];
    });

    const [showNotificationPanel, setShowNotificationPanel] = useState(false);
    const [showProfilePanel, setShowProfilePanel] = useState(false);

    // Track mount state
    useEffect(() => {
        isMountedRef.current = true;
        setIsInitialized(true);
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (!isInitialized || !isMountedRef.current) return;
        try {
            localStorage.setItem(PREFERENCES_KEY, JSON.stringify(settings));
        } catch {
            // Silent fail
        }
    }, [settings, isInitialized]);

    useEffect(() => {
        if (!isInitialized || !isMountedRef.current) return;
        try {
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
        } catch {
            // Silent fail
        }
    }, [notifications, isInitialized]);

    // Apply theme - only after initialization
    useEffect(() => {
        if (!isInitialized) return;

        try {
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
        } catch {
            // Silent fail
        }
    }, [settings.theme, settings.accentColor, isInitialized]);

    // Settings functions
    const updateSettings = useCallback((updates) => {
        if (!isMountedRef.current) return;
        setSettings(prev => ({ ...prev, ...updates }));
    }, []);

    const updateNotificationSettings = useCallback((updates) => {
        if (!isMountedRef.current) return;
        setSettings(prev => ({
            ...prev,
            notifications: { ...prev.notifications, ...updates }
        }));
    }, []);

    const toggleTheme = useCallback(() => {
        if (!isMountedRef.current) return;
        setSettings(prev => ({
            ...prev,
            theme: prev.theme === 'light' ? 'dark' : 'light'
        }));
    }, []);

    // Notification functions
    const addNotification = useCallback((notification) => {
        if (!isMountedRef.current || !notification) return;
        const newNotification = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    }, []);

    const markAsRead = useCallback((id) => {
        if (!isMountedRef.current || !id) return;
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        if (!isMountedRef.current) return;
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearNotifications = useCallback(() => {
        if (!isMountedRef.current) return;
        setNotifications([]);
    }, []);

    const deleteNotification = useCallback((id) => {
        if (!isMountedRef.current || !id) return;
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const unreadCount = useMemo(() => {
        return Array.isArray(notifications)
            ? notifications.filter(n => n && !n.read).length
            : 0;
    }, [notifications]);

    const resetSettings = useCallback(() => {
        if (!isMountedRef.current) return;
        setSettings(defaultSettings);
    }, []);

    const resetAll = useCallback(() => {
        if (!isMountedRef.current) return;
        setSettings(defaultSettings);
        setNotifications([]);
        try {
            localStorage.removeItem(PREFERENCES_KEY);
            localStorage.removeItem(NOTIFICATIONS_KEY);
        } catch {
            // Silent fail
        }
    }, []);

    const value = useMemo(() => ({
        settings,
        isInitialized,
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
        settings, isInitialized, updateSettings, updateNotificationSettings, toggleTheme, resetSettings, resetAll,
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
