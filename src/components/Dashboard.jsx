/**
 * Dashboard.jsx - Production Dashboard View
 * 
 * All data derived from unified AppContext.
 * Displays real-time stats, tasks, calendar, and performance.
 */

import React, { Suspense, lazy } from 'react';
import { useApp } from '../context/AppContext';
import { Icons } from './Icons';
import TaskList from './TaskList';
import Calendar from './Calendar';
import Performance from './Performance';
import GoalCard from './GoalCard';
import TopStats from './TopStats';
import WeatherCard from './WeatherCard';
import './Dashboard.css';



import { useUser } from '../context/UserContext';

function Dashboard() {
    const { user } = useUser();
    const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
    const {
        currentDate,
        todayProgress,
        monthProgress,
        completedToday,
        todayTasks,
        currentTime,
        formatDisplayDate,
        activeGoals,
        setShowGoalModal
    } = useApp();

    const getProgressClass = (progress) => {
        if (progress >= 80) return 'complete';
        if (progress >= 40) return 'partial';
        return 'missed';
    };

    const inProgressCount = todayTasks.filter(t => !t.completed).length;

    // Greeting logic - uses canonical currentTime from context
    const getGreeting = () => {
        const hour = currentTime.getHours();
        const firstName = userName.split(' ')[0];

        // Early Morning (5 AM - 7 AM)
        if (hour >= 5 && hour < 7) return `Rise and Shine, ${firstName} ☀️`;

        // Morning (7 AM - 12 PM) - Standard
        if (hour >= 7 && hour < 12) {
            if (hour === 7) return `Early Bird, ${firstName} 🐦`;
            return `Good Morning, ${firstName}`;
        }

        // Afternoon (12 PM - 5 PM)
        if (hour >= 12 && hour < 17) {
            if (hour === 12) return `Lunch & Focus, ${firstName} 🥗`;
            if (hour === 14) return `Keep the Momentum, ${firstName} 🚀`;
            return `Good Afternoon, ${firstName}`;
        }

        // Evening (5 PM - 10 PM)
        if (hour >= 17 && hour < 22) {
            if (hour === 17) return `Golden Hour, ${firstName} ✨`;
            if (hour >= 20) return `Wind Down, ${firstName} 🌙`;
            return `Good Evening, ${firstName}`;
        }

        // Late Night (10 PM - 5 AM)
        if (hour >= 22 || hour < 5) return `Late Night Hustle, ${firstName} 💻`;

        return `Hello, ${firstName}`;
    };

    return (
        <div className="dashboard view-container">
            {/* Custom Dashboard Header: Greeting | Weather | Hero */}
            <div className="dashboard-header-row">
                {/* 1. Greeting (Left) */}
                <div className="dashboard-header-greeting">
                    <h1 className="greeting">{getGreeting()}</h1>
                    <p className="greeting-subtitle">Track your progress and stay productive</p>
                </div>

                {/* 2. Weather Card (Right) */}
                <div style={{ flex: '0 0 auto' }}>
                    <WeatherCard />
                </div>


            </div>

            {/* Top Stats Bar */}
            <div style={{ marginBottom: '32px' }}>
                <TopStats />
            </div>

            {/* Overview Section */}
            <section className="overview-section">
                <div className="section-header">
                    <h2>Overview</h2>
                    <span className="text-muted">Today's statistics</span>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">{Icons.clock}</div>
                        <div className="stat-content">
                            <span className="stat-value">{inProgressCount}</span>
                            <span className="stat-label">In Progress</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon success">{Icons.check}</div>
                        <div className="stat-content">
                            <span className="stat-value">{completedToday}</span>
                            <span className="stat-label">Completed</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon warning">{Icons.zap}</div>
                        <div className="stat-content">
                            <span className="stat-value">{todayProgress}%</span>
                            <span className="stat-label">Today</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon primary">{Icons.target}</div>
                        <div className="stat-content">
                            <span className="stat-value">{monthProgress}%</span>
                            <span className="stat-label">Monthly Avg</span>
                        </div>
                    </div>
                </div>

                {/* Daily Progress Bar */}
                <div className="daily-progress">
                    <div className="progress-header">
                        <span className="progress-title">Daily Progress</span>
                        <span className={`progress-value ${getProgressClass(todayProgress)}`}>
                            {todayProgress}%
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className={`progress-fill ${getProgressClass(todayProgress)}`}
                            style={{ width: `${todayProgress}%` }}
                        />
                    </div>
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="dashboard-grid">
                <div className="dashboard-main">
                    <TaskList />
                </div>
                <div className="dashboard-sidebar">
                    <Calendar embedded />
                </div>
            </div>

            {/* Performance Section */}
            <section className="performance-section">
                <Performance />
            </section>
        </div>
    );
}

export default Dashboard;
