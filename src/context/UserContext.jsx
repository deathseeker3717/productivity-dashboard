/**
 * UserContext.jsx - User Preferences & Notifications
 * 
 * Manages:
 * - User profile (name, email, avatar)
 * - Theme preferences
 * - Notification settings
 * - Notification history
 */

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo
} from 'react';

const UserContext = createContext();
const USER_STORAGE_KEY = 'userPreferences';
const NOTIFICATIONS_KEY = 'notifications';

// Default user settings
const defaultUser = {
    name: 'User',
    email: '',
    avatar: null,
    initials: 'U'
};

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

export function UserProvider({ children }) {
    // Initialize state directly from localStorage to prevent race condition
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem(USER_STORAGE_KEY);
            if (savedUser) {
                const parsed = JSON.parse(savedUser);
                return { ...defaultUser, ...parsed.user };
            }
        } catch (e) {
            console.error('Failed to load user:', e);
        }
        return defaultUser;
    });

    const [settings, setSettings] = useState(() => {
        try {
            const savedUser = localStorage.getItem(USER_STORAGE_KEY);
            if (savedUser) {
                const parsed = JSON.parse(savedUser);
                return { ...defaultSettings, ...parsed.settings };
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
        return defaultSettings;
    });

    const [notifications, setNotifications] = useState(() => {
        try {
            const savedNotifications = localStorage.getItem(NOTIFICATIONS_KEY);
            if (savedNotifications) {
                return JSON.parse(savedNotifications);
            }
        } catch (e) {
            console.error('Failed to load notifications:', e);
        }
        return [];
    });

    const [showNotificationPanel, setShowNotificationPanel] = useState(false);
    const [showProfilePanel, setShowProfilePanel] = useState(false);

    // Save to localStorage when user or settings change
    useEffect(() => {
        try {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ user, settings }));
        } catch (e) {
            console.error('Failed to save user preferences:', e);
        }
    }, [user, settings]);

    useEffect(() => {
        try {
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
        } catch (e) {
            console.error('Failed to save notifications:', e);
        }
    }, [notifications]);

    // Apply theme and accent color to document
    useEffect(() => {
        const root = document.documentElement;

        // Apply theme class
        if (settings.theme === 'dark') {
            root.classList.add('dark-theme');
            root.classList.remove('light-theme');
        } else {
            root.classList.add('light-theme');
            root.classList.remove('dark-theme');
        }

        // Apply accent color as CSS variable
        root.style.setProperty('--accent', settings.accentColor);
        root.style.setProperty('--accent-light', `${settings.accentColor}15`);
        root.style.setProperty('--accent-hover', settings.accentColor);
    }, [settings.theme, settings.accentColor]);

    // User profile functions
    const updateUser = useCallback((updates) => {
        setUser(prev => {
            const newUser = { ...prev, ...updates };
            // Auto-generate initials from name
            if (updates.name) {
                const parts = updates.name.trim().split(' ');
                newUser.initials = parts.length > 1
                    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                    : updates.name.slice(0, 2).toUpperCase();
            }
            return newUser;
        });
    }, []);

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

    // Computed
    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    // Reset to defaults
    const resetSettings = useCallback(() => {
        setSettings(defaultSettings);
    }, []);

    const resetAll = useCallback(() => {
        setUser(defaultUser);
        setSettings(defaultSettings);
        setNotifications([]);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(NOTIFICATIONS_KEY);
    }, []);

    const value = useMemo(() => ({
        // User
        user,
        updateUser,

        // Settings
        settings,
        updateSettings,
        updateNotificationSettings,
        toggleTheme,
        resetSettings,
        resetAll,

        // Notifications
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        deleteNotification,
        unreadCount,

        // UI State
        showNotificationPanel,
        setShowNotificationPanel,
        showProfilePanel,
        setShowProfilePanel,

        // Auth
        isAuthenticated: !!user.email, // Simple check for now
        login: (userData) => {
            updateUser(userData);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ user: { ...user, ...userData }, settings }));
        },
        logout: () => {
            setUser(defaultUser);
            localStorage.removeItem(USER_STORAGE_KEY);
        }
    }), [
        user, updateUser,
        settings, updateSettings, updateNotificationSettings, toggleTheme, resetSettings, resetAll,
        notifications, addNotification, markAsRead, markAllAsRead, clearNotifications, deleteNotification, unreadCount,
        showNotificationPanel, showProfilePanel
    ]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
}

export default UserContext;
