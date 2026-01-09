/**
 * Settings.jsx - Settings Page
 * 
 * Features:
 * - Profile editing (name, email)
 * - Theme preferences
 * - Notification settings
 * - Data management (export, import, clear)
 */

import React, { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { usePreferences } from '../context/PreferencesContext';
import { useApp } from '../context/AppContext';
import './Settings.css';

// Icons
const ProfileIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const PaletteIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const BellIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
);

const DatabaseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
);

const DownloadIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7,10 12,15 17,10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const UploadIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17,8 12,3 7,8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3,6 5,6 21,6" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
        <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20,6 9,17 4,12" />
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

// Toggle Switch Component
function Toggle({ checked, onChange, label }) {
    return (
        <label className="toggle-container">
            <span className="toggle-label">{label}</span>
            <div className={`toggle-switch ${checked ? 'active' : ''}`} onClick={() => onChange(!checked)}>
                <div className="toggle-knob" />
            </div>
        </label>
    );
}

function Settings() {
    const { user } = useUser();
    const { settings, updateSettings, updateNotificationSettings, resetAll } = usePreferences();
    const { exportJSON, exportCSV, setShowMonthSetup } = useApp();

    // Derive user info from Supabase user
    const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
    const userEmail = user?.email || '';
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const [activeSection, setActiveSection] = useState('profile');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const fileInputRef = useRef(null);

    const showSaveMessage = (message) => {
        setSaveMessage(message);
        setTimeout(() => setSaveMessage(''), 2000);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    localStorage.setItem('productivityData', JSON.stringify(data));
                    showSaveMessage('Data imported! Refresh to apply.');
                } catch (err) {
                    alert('Invalid file format');
                }
            };
            reader.readAsText(file);
        }
    };

    const handleClearData = () => {
        if (showResetConfirm) {
            resetAll();
            localStorage.removeItem('productivityData');
            showSaveMessage('All data cleared');
            setShowResetConfirm(false);
        } else {
            setShowResetConfirm(true);
        }
    };

    const sections = [
        { id: 'profile', label: 'Profile', icon: <ProfileIcon /> },
        { id: 'appearance', label: 'Appearance', icon: <PaletteIcon /> },
        { id: 'notifications', label: 'Notifications', icon: <BellIcon /> },
        { id: 'data', label: 'Data', icon: <DatabaseIcon /> }
    ];

    return (
        <div className="settings">
            <div className="settings-header">
                <h1>Settings</h1>
                {saveMessage && <span className="save-message"><CheckIcon /> {saveMessage}</span>}
            </div>

            <div className="settings-layout">
                {/* Navigation */}
                <nav className="settings-nav">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(section.id)}
                        >
                            <span className="nav-icon">{section.icon}</span>
                            <span>{section.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Content */}
                <div className="settings-content">
                    {/* Profile Section */}
                    {activeSection === 'profile' && (
                        <section className="settings-section animate-fadeIn">
                            <h2>Profile</h2>
                            <p className="section-description">Your account information (managed by Supabase)</p>

                            <div className="settings-group">
                                <div className="form-field">
                                    <label>Display Name</label>
                                    <input
                                        type="text"
                                        value={userName}
                                        disabled
                                        placeholder="Your name"
                                    />
                                    <p className="field-hint">Name is synced from your Supabase account</p>
                                </div>

                                <div className="form-field">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={userEmail}
                                        disabled
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Avatar</label>
                                    <div className="avatar-preview">
                                        <div className="avatar-circle">
                                            {userInitials}
                                        </div>
                                        <p className="avatar-hint">Avatar is generated from your initials</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Appearance Section */}
                    {activeSection === 'appearance' && (
                        <section className="settings-section animate-fadeIn">
                            <h2>Appearance</h2>
                            <p className="section-description">Customize how the app looks</p>

                            <div className="settings-group">
                                <div className="form-field">
                                    <label>Theme</label>
                                    <div className="theme-options">
                                        <button
                                            className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`}
                                            onClick={() => updateSettings({ theme: 'light' })}
                                        >
                                            <span className="theme-preview light" />
                                            <span>Light</span>
                                        </button>
                                        <button
                                            className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
                                            onClick={() => updateSettings({ theme: 'dark' })}
                                        >
                                            <span className="theme-preview dark" />
                                            <span>Dark</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label>Accent Color</label>
                                    <div className="color-options">
                                        {['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#e11d48'].map(color => (
                                            <button
                                                key={color}
                                                className={`color-option ${settings.accentColor === color ? 'active' : ''}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => updateSettings({ accentColor: color })}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Notifications Section */}
                    {activeSection === 'notifications' && (
                        <section className="settings-section animate-fadeIn">
                            <h2>Notifications</h2>
                            <p className="section-description">Manage your notification preferences</p>

                            <div className="settings-group">
                                <Toggle
                                    label="Enable Notifications"
                                    checked={settings.notifications.enabled}
                                    onChange={(v) => updateNotificationSettings({ enabled: v })}
                                />

                                <Toggle
                                    label="Daily Reminders"
                                    checked={settings.notifications.dailyReminder}
                                    onChange={(v) => updateNotificationSettings({ dailyReminder: v })}
                                />

                                {settings.notifications.dailyReminder && (
                                    <div className="form-field">
                                        <label>Reminder Time</label>
                                        <input
                                            type="time"
                                            value={settings.notifications.reminderTime}
                                            onChange={(e) => updateNotificationSettings({ reminderTime: e.target.value })}
                                        />
                                    </div>
                                )}

                                <Toggle
                                    label="Streak Alerts"
                                    checked={settings.notifications.streakAlerts}
                                    onChange={(v) => updateNotificationSettings({ streakAlerts: v })}
                                />

                                <Toggle
                                    label="Sound Effects"
                                    checked={settings.notifications.soundEnabled}
                                    onChange={(v) => updateNotificationSettings({ soundEnabled: v })}
                                />
                            </div>
                        </section>
                    )}

                    {/* Data Section */}
                    {activeSection === 'data' && (
                        <section className="settings-section animate-fadeIn">
                            <h2>Data Management</h2>
                            <p className="section-description">Export, import, or clear your data</p>

                            <div className="settings-group">
                                <div className="data-actions">
                                    <button className="data-btn" onClick={() => setShowMonthSetup(true)}>
                                        <CalendarIcon />
                                        <div>
                                            <span className="data-btn-title">Monthly Setup</span>
                                            <span className="data-btn-desc">Set goals and routines for this month</span>
                                        </div>
                                    </button>

                                    <button className="data-btn" onClick={exportJSON}>
                                        <DownloadIcon />
                                        <div>
                                            <span className="data-btn-title">Export JSON</span>
                                            <span className="data-btn-desc">Download all data as JSON file</span>
                                        </div>
                                    </button>

                                    <button className="data-btn" onClick={exportCSV}>
                                        <DownloadIcon />
                                        <div>
                                            <span className="data-btn-title">Export CSV</span>
                                            <span className="data-btn-desc">Download tasks as spreadsheet</span>
                                        </div>
                                    </button>

                                    <button className="data-btn" onClick={() => fileInputRef.current?.click()}>
                                        <UploadIcon />
                                        <div>
                                            <span className="data-btn-title">Import Data</span>
                                            <span className="data-btn-desc">Restore from a JSON backup</span>
                                        </div>
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".json"
                                        style={{ display: 'none' }}
                                        onChange={handleImport}
                                    />

                                    <button
                                        className={`data-btn danger ${showResetConfirm ? 'confirm' : ''}`}
                                        onClick={handleClearData}
                                    >
                                        <TrashIcon />
                                        <div>
                                            <span className="data-btn-title">
                                                {showResetConfirm ? 'Click again to confirm' : 'Clear All Data'}
                                            </span>
                                            <span className="data-btn-desc">
                                                {showResetConfirm ? 'This action cannot be undone!' : 'Delete all tasks and settings'}
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Settings;
