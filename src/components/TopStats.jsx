/**
 * TopStats.jsx - Production Stats Bar
 * 
 * Derives all values from unified AppContext.
 * Real-time updates, no manual refresh needed.
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import './TopStats.css';

function TopStats() {
    const {
        todayProgress,
        monthProgress,
        calculateStreak,
        weeklyProgress,
        currentTime
    } = useApp();

    const getProgressClass = (progress) => {
        if (progress >= 80) return 'complete';
        if (progress >= 40) return 'partial';
        return 'missed';
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="top-stats">
            {/* Today Progress Ring */}
            <div className="stat-widget">
                <div className={`progress-ring ${getProgressClass(todayProgress)}`}>
                    <svg className="circular-chart" viewBox="0 0 36 36">
                        <path
                            className="circle-bg"
                            d="M18 2.0845
                               a 15.9155 15.9155 0 0 1 0 31.831
                               a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            className="circle"
                            strokeDasharray={`${todayProgress}, 100`}
                            d="M18 2.0845
                               a 15.9155 15.9155 0 0 1 0 31.831
                               a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <span className="ring-value">{todayProgress}%</span>
                </div>
                <div className="stat-info">
                    <span className="stat-label">Today</span>
                    <span className="stat-sublabel">Daily Progress</span>
                </div>
            </div>

            {/* Month Progress */}
            <div className="stat-widget">
                <div className={`progress-ring ${getProgressClass(monthProgress)}`}>
                    <svg className="circular-chart" viewBox="0 0 36 36">
                        <path
                            className="circle-bg"
                            d="M18 2.0845
                               a 15.9155 15.9155 0 0 1 0 31.831
                               a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            className="circle"
                            strokeDasharray={`${monthProgress}, 100`}
                            d="M18 2.0845
                               a 15.9155 15.9155 0 0 1 0 31.831
                               a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <span className="ring-value">{monthProgress}%</span>
                </div>
                <div className="stat-info">
                    <span className="stat-label">Monthly Avg</span>
                </div>
            </div>

            {/* Streak - Duolingo Style */}
            <div className="stat-widget streak-widget">
                <div className="streak-fire-container">
                    <svg viewBox="0 0 48 48" className="duolingo-flame">
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
                        {/* Rising Sparks - Behind flame, starting deeper but wider to emerge side-ways */}
                        <circle className="flame-particle p1" cx="24" cy="44" r="3" />
                        <circle className="flame-particle p2" cx="15" cy="43" r="2.5" />
                        <circle className="flame-particle p3" cx="33" cy="43" r="2.5" />
                        <circle className="flame-particle p4" cx="10" cy="44" r="2" />
                        <circle className="flame-particle p5" cx="38" cy="44" r="2" />

                        {/* Main flame body - wider spread */}
                        <path
                            className="flame-body"
                            d="M24 4 C24 4 6 18 6 30 C6 40 14 46 24 46 C34 46 42 40 42 30 C42 18 24 4 24 4 Z"
                            fill="url(#flameGradient)"
                            filter="url(#flameGlow)"
                        />
                        {/* Inner flame highlight - wider */}
                        <path
                            className="flame-inner"
                            d="M24 16 C24 16 12 26 12 34 C12 40 17 44 24 44 C31 44 36 40 36 34 C36 26 24 16 24 16 Z"
                            fill="#FFD93D"
                            opacity="0.85"
                        />
                        {/* Bright core - wider ellipse */}
                        <ellipse
                            className="flame-core"
                            cx="24" cy="38" rx="8" ry="6"
                            fill="#FFFACD"
                            opacity="0.95"
                        />
                    </svg>
                    <span className="streak-number">{calculateStreak}</span>
                </div>
                <div className="stat-info">
                    <span className="stat-label">Day Streak</span>
                    <span className="stat-sublabel">
                        {calculateStreak === 0 ? "Start your streak!" :
                            calculateStreak <= 3 ? "Great start!" :
                                calculateStreak <= 7 ? "Keep it going!" :
                                    calculateStreak <= 14 ? "You're on fire!" :
                                        calculateStreak <= 30 ? "Unstoppable!" : "Legendary!"}
                    </span>
                </div>
            </div>

            {/* Sparkline */}
            <div className="stat-widget sparkline-widget">
                <div className="sparkline">
                    {weeklyProgress.map((day, i) => (
                        <div
                            key={day.date}
                            className={`spark-bar ${getProgressClass(day.progress)}`}
                            style={{ height: `${Math.max(10, day.progress)}%` }}
                            title={`${day.day}: ${day.progress}%`}
                        />
                    ))}
                </div>
                <div className="stat-info">
                    <span className="stat-label">7 Days</span>
                    <span className="stat-sublabel sparkline-trend">
                        {weeklyProgress[6]?.progress >= weeklyProgress[0]?.progress ? '↗' : '↘'}
                        {Math.abs(weeklyProgress[6]?.progress - weeklyProgress[0]?.progress)}%
                    </span>
                </div>
            </div>

            {/* Live Clock & Date */}
            <div className="stat-widget clock-widget">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                    <span className="clock-time">{formatTime(currentTime)}</span>
                    <span className="clock-time" style={{ fontSize: '13px', opacity: 0.8 }}>
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default TopStats;
