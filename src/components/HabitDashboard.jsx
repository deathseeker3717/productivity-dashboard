/**
 * HabitDashboard.jsx - Clean Habit Tracker with Animations & SVGs
 * 
 * Features:
 * - Animated entrance effects
 * - Decorative SVG illustrations
 * - Clean, focused layout
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import './HabitDashboard.css';

const CATEGORY_EMOJIS = {
    work: '💼',
    personal: '🎯',
    health: '🏃',
    learning: '📚',
    other: '✨'
};

// Decorative SVG - Abstract shapes
const DecorativeBlob = ({ className }) => (
    <svg className={`decorative-blob ${className || ''}`} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.1C64.8,55,53.7,66.2,40.3,73.3C26.9,80.4,11.2,83.3,-3.3,88.2C-17.8,93.1,-35.6,100,-50.1,96.1C-64.6,92.2,-75.9,77.5,-83.4,61.4C-90.9,45.3,-94.6,27.7,-93.8,10.9C-93,-5.8,-87.6,-21.7,-79.4,-35.6C-71.2,-49.5,-60.2,-61.4,-47,-69.1C-33.8,-76.8,-18.4,-80.3,-1.7,-77.5C15,-74.7,30.5,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
    </svg>
);

// Progress Ring SVG Component
const ProgressRing = ({ progress, size = 80, strokeWidth = 6, className }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg className={`progress-ring-svg ${className || ''}`} width={size} height={size}>
            <circle
                className="progress-ring-bg"
                strokeWidth={strokeWidth}
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
            />
            <circle
                className="progress-ring-fill"
                strokeWidth={strokeWidth}
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
            />
        </svg>
    );
};

// Streak Fire SVG
// Streak Fire SVG (Premium Animated)
const FireIcon = () => (
    <svg className="duolingo-flame" viewBox="0 0 48 48" style={{ width: '28px', height: '28px' }}>
        <defs>
            <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#FF9600" />
                <stop offset="50%" stopColor="#FF6B00" />
                <stop offset="100%" stopColor="#FF4500" />
            </linearGradient>
            <filter id="flameGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        <circle className="flame-particle p1" cx="24" cy="44" r="3" />
        <circle className="flame-particle p2" cx="15" cy="43" r="2.5" />
        <circle className="flame-particle p3" cx="33" cy="43" r="2.5" />
        <circle className="flame-particle p4" cx="10" cy="44" r="2" />
        <circle className="flame-particle p5" cx="38" cy="44" r="2" />
        <path
            className="flame-body"
            d="M24 4 C24 4 6 18 6 30 C6 40 14 46 24 46 C34 46 42 40 42 30 C42 18 24 4 24 4 Z"
            fill="url(#flameGradient)"
            filter="url(#flameGlow)"
        />
        <path
            className="flame-inner"
            d="M24 16 C24 16 12 26 12 34 C12 40 17 44 24 44 C31 44 36 40 36 34 C36 26 24 16 24 16 Z"
            fill="#FFD93D"
            opacity="0.85"
        />
        <ellipse
            className="flame-core"
            cx="24" cy="38" rx="8" ry="6"
            fill="#FFFACD"
            opacity="0.95"
        />
    </svg>
);

// Check Icon SVG
const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

// Trend Up Icon
const TrendUpIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

function HabitDashboard() {
    const {
        data,
        currentDate,
        currentMonth,
        selectedDate,
        setSelectedDate,
        todayTasks,
        todayProgress,
        monthProgress,
        toggleTask,
        addTask,
        calculateStreak,
        categoryBreakdown,
        currentTime,
        heatmapData
    } = useApp();

    const [newTask, setNewTask] = useState('');

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayName = dayNames[currentTime?.getDay?.() ?? 0] || 'Today';

    // Safe month parsing with fallback
    const [year, month] = (() => {
        try {
            if (!currentMonth || typeof currentMonth !== 'string') {
                const now = new Date();
                return [now.getFullYear(), now.getMonth() + 1];
            }
            const parts = currentMonth.split('-').map(Number);
            if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
                const now = new Date();
                return [now.getFullYear(), now.getMonth() + 1];
            }
            return parts;
        } catch {
            const now = new Date();
            return [now.getFullYear(), now.getMonth() + 1];
        }
    })();

    const daysInMonth = new Date(year, month, 0).getDate();

    const calendarDays = useMemo(() => {
        const days = [];
        try {
            for (let i = 1; i <= daysInMonth; i++) {
                const dateStr = `${currentMonth}-${String(i).padStart(2, '0')}`;
                const dayInfo = (heatmapData || {})[dateStr] || { progress: 0, tasks: 0 };
                days.push({
                    day: i,
                    date: dateStr,
                    hasData: dayInfo.tasks > 0,
                    isToday: dateStr === currentDate,
                    progress: dayInfo.progress
                });
            }
        } catch {
            // Return empty array on error
        }
        return days;
    }, [currentMonth, heatmapData, currentDate, daysInMonth]);

    const monthImprovement = useMemo(() => {
        try {
            const lastMonthKey = (() => {
                const d = new Date(year, month - 2, 1);
                return d.toISOString().slice(0, 7);
            })();

            const lastMonthData = (data || {})[lastMonthKey];
            if (!lastMonthData?.days) return null;

            const lastDays = Object.values(lastMonthData.days).filter(d => d?.tasks?.length > 0);
            if (lastDays.length === 0) return null;

            const lastAvg = Math.round(lastDays.reduce((s, d) => s + (d?.progress || 0), 0) / lastDays.length);
            return monthProgress - lastAvg;
        } catch {
            return null;
        }
    }, [data, year, month, monthProgress]);

    const habitCategories = useMemo(() => {
        return Object.entries(categoryBreakdown)
            .filter(([_, v]) => v.total > 0)
            .map(([cat, stats]) => ({
                name: cat.charAt(0).toUpperCase() + cat.slice(1),
                percentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
            }));
    }, [categoryBreakdown]);

    const handleAddTask = (e) => {
        e.preventDefault();
        if (newTask.trim()) {
            addTask(newTask.trim(), 'personal');
            setNewTask('');
        }
    };

    const completedCount = todayTasks.filter(t => t.completed).length;

    return (
        <div className="habit-dashboard">
            <div className="habit-grid">
                {/* LEFT COLUMN */}
                <div className="left-column">
                    <div className="greeting-section animate-fadeIn">
                        <h1 className="greeting-title">Happy {dayName} 👋</h1>
                        <p className="greeting-date">
                            {currentTime.getDate()} {monthNames[currentTime.getMonth()]} {currentTime.getFullYear()}
                        </p>
                    </div>

                    <div className="action-buttons animate-fadeIn stagger-1">
                        <button className="btn-new-habit" onClick={() => document.querySelector('.todo-input')?.focus()}>
                            <span className="btn-icon">+</span>
                            New Habit
                        </button>
                    </div>

                    {/* Progress Ring Card */}
                    <div className="progress-card animate-fadeIn stagger-2">
                        <div className="progress-visual">
                            <ProgressRing progress={todayProgress} size={70} strokeWidth={6} />
                            <div className="progress-center">
                                <span className="progress-value">{todayProgress}%</span>
                                <span className="progress-label">Today</span>
                            </div>
                        </div>
                        <div className="progress-info">
                            <div className="streak-display">
                                <FireIcon />
                                <span className="streak-value">{calculateStreak}</span>
                                <span className="streak-label">Day Streak</span>
                            </div>
                        </div>
                    </div>

                    {/* Calendar Widget */}
                    <div className="calendar-widget animate-fadeIn stagger-3">
                        <div className="calendar-header">
                            <h3 className="calendar-title">{monthNames[month - 1]}, {year}</h3>
                        </div>
                        <div className="calendar-days-header">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                <span key={i} className="day-header">{day}</span>
                            ))}
                        </div>
                        <div className="calendar-grid">
                            {calendarDays.map(d => (
                                <button
                                    key={d.day}
                                    className={`cal-day ${d.isToday ? 'today' : ''} ${d.hasData ? 'has-data' : ''}`}
                                    onClick={() => setSelectedDate(d.date)}
                                >
                                    {d.day}
                                </button>
                            ))}
                        </div>
                        {monthImprovement !== null && (
                            <div className="calendar-growth">
                                <TrendUpIcon />
                                <span>{monthImprovement >= 0 ? '+' : ''}{monthImprovement}% vs last month</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="right-column">
                    <div className="todos-section animate-fadeIn stagger-1">
                        <div className="section-header">
                            <h2 className="section-title">Today's Habits</h2>
                            <span className="task-count">
                                <span className="count-completed">{completedCount}</span>
                                <span className="count-separator">/</span>
                                <span className="count-total">{todayTasks.length}</span>
                            </span>
                        </div>

                        <form onSubmit={handleAddTask} className="todo-input-form">
                            <input
                                type="text"
                                className="todo-input"
                                placeholder="+ Add new habit..."
                                value={newTask}
                                onChange={e => setNewTask(e.target.value)}
                            />
                        </form>

                        <div className="todo-list">
                            {todayTasks.length === 0 ? (
                                <div className="empty-todos animate-scaleIn">
                                    <div className="empty-illustration">
                                        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="60" cy="60" r="50" fill="var(--bg-hover)" />
                                            <path d="M40 65 L55 80 L85 50" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
                                            <circle cx="60" cy="60" r="30" stroke="var(--border)" strokeWidth="2" strokeDasharray="5 5" fill="none" />
                                        </svg>
                                    </div>
                                    <p>No habits yet. Add your first one!</p>
                                </div>
                            ) : (
                                todayTasks.map((task, index) => (
                                    <div
                                        key={task.id}
                                        className={`todo-item animate-slideInLeft ${task.completed ? 'completed' : ''}`}
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <button
                                            className={`todo-checkbox ${task.completed ? 'checked' : ''}`}
                                            onClick={() => toggleTask(task.id)}
                                        >
                                            {task.completed && <CheckIcon />}
                                        </button>
                                        <div className="todo-content">
                                            <div className="todo-title">{task.name}</div>
                                            <div className="todo-category">
                                                {CATEGORY_EMOJIS[task.category] || '✨'} {task.category}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    {habitCategories.length > 0 && (
                        <div className="category-breakdown animate-fadeIn stagger-4">
                            <h3 className="section-title">Categories</h3>
                            <div className="category-bars">
                                {habitCategories.map((cat, index) => (
                                    <div
                                        key={cat.name}
                                        className="category-bar-item"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="category-bar-header">
                                            <span className="category-name">{cat.name}</span>
                                            <span className="category-percent">{cat.percentage}%</span>
                                        </div>
                                        <div className="category-bar-track">
                                            <div
                                                className="category-bar-fill animate-progress"
                                                style={{ '--target-width': `${cat.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HabitDashboard;
