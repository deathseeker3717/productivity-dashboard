/**
 * Performance.jsx - Production Analytics Charts
 * 
 * All data derived from unified context.
 * No manual data entry - purely computed.
 */

import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Icons } from '../App';
import './Performance.css';

function Performance() {
    const {
        weeklyProgress,
        categoryBreakdown,
        todayProgress,
        monthProgress
    } = useApp();

    // Weekly bar chart data
    const weeklyBars = useMemo(() => {
        return weeklyProgress.map(day => ({
            label: day.day,
            value: day.progress,
            isToday: day.date === new Date().toISOString().split('T')[0]
        }));
    }, [weeklyProgress]);

    // Category pie chart data
    const categoryData = useMemo(() => {
        const colors = {
            work: '#3b82f6',
            personal: '#8b5cf6',
            health: '#10b981',
            learning: '#f59e0b',
            other: '#94a3b8'
        };

        const items = Object.entries(categoryBreakdown)
            .filter(([_, v]) => v.completed > 0)
            .map(([cat, stats]) => ({
                name: cat.charAt(0).toUpperCase() + cat.slice(1),
                value: stats.completed,
                color: colors[cat] || '#94a3b8'
            }));

        const total = items.reduce((sum, i) => sum + i.value, 0);

        return items.map(i => ({
            ...i,
            percentage: total > 0 ? Math.round((i.value / total) * 100) : 0
        }));
    }, [categoryBreakdown]);

    const totalCompleted = categoryData.reduce((sum, c) => sum + c.value, 0);

    const getProgressClass = (value) => {
        if (value >= 80) return 'complete';
        if (value >= 40) return 'partial';
        return 'missed';
    };

    return (
        <div className="performance">
            <div className="performance-header">
                <h3>Performance</h3>
                <span className="period-selector">This Week</span>
            </div>

            <div className="charts-row">
                {/* Weekly Progress Bar Chart */}
                <div className="chart-section">
                    <h4>Weekly Progress</h4>
                    <div className="bar-chart">
                        {weeklyBars.map((bar, i) => (
                            <div key={i} className="bar-group">
                                <div className="bar-wrapper">
                                    <div
                                        className={`bar ${getProgressClass(bar.value)} ${bar.isToday ? 'today' : ''}`}
                                        style={{ height: `${Math.max(5, bar.value)}%` }}
                                    />
                                </div>
                                <span className="bar-label">{bar.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="chart-section">
                    <h4>Categories</h4>
                    {categoryData.length > 0 ? (
                        <div className="category-list">
                            {categoryData.map(cat => (
                                <div key={cat.name} className="category-row">
                                    <div className="category-info">
                                        <span
                                            className="category-dot"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        <span className="category-name">{cat.name}</span>
                                    </div>
                                    <div className="category-bar-wrapper">
                                        <div
                                            className="category-bar"
                                            style={{
                                                width: `${cat.percentage}%`,
                                                backgroundColor: cat.color
                                            }}
                                        />
                                    </div>
                                    <span className="category-value">{cat.value}</span>
                                </div>
                            ))}
                            <div className="category-total">
                                Total: {totalCompleted} tasks completed
                            </div>
                        </div>
                    ) : (
                        <div className="empty-chart">
                            <p>No completed tasks yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="performance-summary">
                <div className="summary-stat">
                    <span className="summary-value">{todayProgress}%</span>
                    <span className="summary-label">Today</span>
                </div>
                <div className="summary-stat">
                    <span className="summary-value">{monthProgress}%</span>
                    <span className="summary-label">This Month</span>
                </div>
                <div className="summary-stat">
                    <span className="summary-value">{totalCompleted}</span>
                    <span className="summary-label">Total Done</span>
                </div>
            </div>
        </div>
    );
}

export default Performance;
