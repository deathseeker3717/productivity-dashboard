/**
 * Analytics.jsx - Comprehensive Analytics View
 * 
 * Features:
 * - Line chart: daily progress over month
 * - Bar chart: completed tasks per day
 * - Pie chart: task categories distribution
 * - Month comparison mode
 * - Summary stats
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Icons } from './Icons';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import ContributionHeatmap from './ContributionHeatmap';
import './Analytics.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function Analytics() {
    const { data, currentMonth, viewMonth, navigateToMonth, getAllMonths, CATEGORIES } = useApp();

    // Use viewMonth from context instead of local state
    const selectedMonth = viewMonth || currentMonth;
    const [compareMonth, setCompareMonth] = useState(null);
    const [showComparison, setShowComparison] = useState(false);

    const allMonths = getAllMonths();

    // Get month data helper
    const getMonthData = (monthKey) => data[monthKey] || { days: {} };

    // Calculate analytics for a month
    const calculateMonthAnalytics = useMemo(() => (monthKey) => {
        const monthData = getMonthData(monthKey);
        const days = monthData.days || {};

        // Get all days in month
        const [year, month] = monthKey.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();

        const dailyProgress = [];
        const dailyTasks = [];
        const categoryCount = {};
        let totalCompleted = 0;
        let totalTasks = 0;
        let bestDay = { date: null, progress: 0 };
        let worstDay = { date: null, progress: 100 };

        CATEGORIES.forEach(cat => categoryCount[cat] = 0);

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${monthKey}-${String(d).padStart(2, '0')}`;
            const dayData = days[dateStr];

            const progress = dayData?.progress || 0;
            const tasksCompleted = dayData?.tasks?.filter(t => t.completed).length || 0;
            const tasksTotal = dayData?.tasks?.length || 0;

            dailyProgress.push(progress);
            dailyTasks.push(tasksCompleted);
            totalCompleted += tasksCompleted;
            totalTasks += tasksTotal;

            // Track best/worst
            if (dayData?.tasks?.length > 0) {
                if (progress > bestDay.progress) {
                    bestDay = { date: dateStr, progress };
                }
                if (progress < worstDay.progress) {
                    worstDay = { date: dateStr, progress };
                }
            }

            // Count categories
            dayData?.tasks?.forEach(task => {
                if (task.completed) {
                    categoryCount[task.category || 'other']++;
                }
            });
        }

        const avgProgress = dailyProgress.length > 0
            ? Math.round(dailyProgress.reduce((a, b) => a + b, 0) / dailyProgress.length)
            : 0;

        return {
            dailyProgress,
            dailyTasks,
            categoryCount,
            totalCompleted,
            totalTasks,
            avgProgress,
            bestDay,
            worstDay: worstDay.date ? worstDay : null,
            labels: Array.from({ length: daysInMonth }, (_, i) => i + 1)
        };
    }, [data, CATEGORIES]);

    // Get analytics for selected month(s)
    const primaryAnalytics = calculateMonthAnalytics(selectedMonth);
    const compareAnalytics = compareMonth ? calculateMonthAnalytics(compareMonth) : null;

    // Chart.js common options with smooth animations
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 800,
            easing: 'easeOutQuart',
            delay: (context) => {
                // Stagger animation for each data point
                return context.dataIndex * 30;
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#fff',
                bodyColor: '#e2e8f0',
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                boxPadding: 4
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0,0,0,0.05)',
                    drawBorder: false
                },
                ticks: {
                    padding: 8,
                    font: {
                        size: 11
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    padding: 8,
                    font: {
                        size: 11
                    }
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false
        },
        elements: {
            point: {
                radius: 3,
                hoverRadius: 6,
                hitRadius: 10
            },
            line: {
                tension: 0.4
            }
        }
    };

    // Line chart data
    const lineChartData = {
        labels: primaryAnalytics.labels,
        datasets: [
            {
                label: formatMonthLabel(selectedMonth),
                data: primaryAnalytics.dailyProgress,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4
            },
            ...(compareAnalytics ? [{
                label: formatMonthLabel(compareMonth),
                data: compareAnalytics.dailyProgress,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                fill: true,
                tension: 0.4
            }] : [])
        ]
    };

    // Bar chart data
    const barChartData = {
        labels: primaryAnalytics.labels,
        datasets: [
            {
                label: formatMonthLabel(selectedMonth),
                data: primaryAnalytics.dailyTasks,
                backgroundColor: '#10b981',
                borderRadius: 4
            },
            ...(compareAnalytics ? [{
                label: formatMonthLabel(compareMonth),
                data: compareAnalytics.dailyTasks,
                backgroundColor: '#f59e0b',
                borderRadius: 4
            }] : [])
        ]
    };

    // Pie chart data
    const categoryColors = {
        work: '#3b82f6',
        personal: '#8b5cf6',
        health: '#10b981',
        learning: '#f59e0b',
        other: '#94a3b8'
    };

    const pieChartData = {
        labels: CATEGORIES.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
        datasets: [{
            data: CATEGORIES.map(c => primaryAnalytics.categoryCount[c]),
            backgroundColor: CATEGORIES.map(c => categoryColors[c]),
            borderWidth: 0
        }]
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    padding: 15
                }
            }
        }
    };

    // Format month label
    function formatMonthLabel(monthKey) {
        return new Date(monthKey + '-01').toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });
    }

    // Calculate improvement
    const improvement = compareAnalytics
        ? primaryAnalytics.avgProgress - compareAnalytics.avgProgress
        : null;

    return (
        <div className="analytics">
            {/* Controls */}
            <div className="analytics-controls card">
                <div className="control-group">
                    <label>Primary Month</label>
                    <select
                        className="input"
                        value={selectedMonth}
                        onChange={(e) => navigateToMonth(e.target.value)}
                    >
                        {allMonths.map(m => (
                            <option key={m} value={m}>{formatMonthLabel(m)}</option>
                        ))}
                    </select>
                </div>

                <div className="control-group">
                    <label className="compare-toggle">
                        <input
                            type="checkbox"
                            checked={showComparison}
                            onChange={(e) => {
                                setShowComparison(e.target.checked);
                                if (e.target.checked && allMonths.length > 1) {
                                    setCompareMonth(allMonths.find(m => m !== selectedMonth) || null);
                                } else {
                                    setCompareMonth(null);
                                }
                            }}
                        />
                        Compare with another month
                    </label>
                </div>

                {showComparison && (
                    <div className="control-group">
                        <label>Compare To</label>
                        <select
                            className="input"
                            value={compareMonth || ''}
                            onChange={(e) => setCompareMonth(e.target.value)}
                        >
                            {allMonths.filter(m => m !== selectedMonth).map(m => (
                                <option key={m} value={m}>{formatMonthLabel(m)}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            <div className="analytics-summary">
                <div className="summary-card">
                    <span className="summary-value">{primaryAnalytics.avgProgress}%</span>
                    <span className="summary-label">Average Progress</span>
                </div>
                <div className="summary-card">
                    <span className="summary-value">{primaryAnalytics.totalCompleted}</span>
                    <span className="summary-label">Tasks Completed</span>
                </div>
                <div className="summary-card">
                    <span className="summary-value">
                        {primaryAnalytics.bestDay.date
                            ? new Date(primaryAnalytics.bestDay.date).getDate()
                            : '-'}
                    </span>
                    <span className="summary-label">Best Day ({primaryAnalytics.bestDay.progress}%)</span>
                </div>
                {improvement !== null && (
                    <div className={`summary-card ${improvement >= 0 ? 'positive' : 'negative'}`}>
                        <span className="summary-value">
                            {improvement >= 0 ? '+' : ''}{improvement}%
                        </span>
                        <span className="summary-label">Improvement</span>
                    </div>
                )}
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                {/* Line Chart */}
                <div className="chart-card card">
                    <div className="card-header">
                        <h3 className="card-title">
                            {Icons.chart}
                            Daily Progress
                        </h3>
                    </div>
                    <div className="chart-container">
                        <Line data={lineChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="chart-card card">
                    <div className="card-header">
                        <h3 className="card-title">
                            {Icons.tasks}
                            Completed Tasks
                        </h3>
                    </div>
                    <div className="chart-container">
                        <Bar data={barChartData} options={{
                            ...chartOptions,
                            plugins: {
                                ...chartOptions.plugins,
                                legend: {
                                    display: showComparison
                                }
                            }
                        }} />
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="chart-card card pie-card">
                    <div className="card-header">
                        <h3 className="card-title">
                            {Icons.target}
                            Task Categories
                        </h3>
                    </div>
                    <div className="chart-container pie-container">
                        <Pie data={pieChartData} options={pieOptions} />
                    </div>
                </div>
            </div>

            {/* GitHub-Style Contribution Heatmap */}
            <div className="heatmap-wrapper card">
                <div className="card-header">
                    <h3 className="card-title">
                        {Icons.calendar}
                        Contribution Activity
                    </h3>
                </div>
                <ContributionHeatmap />
            </div>

            {/* Export Button */}
            <div className="analytics-actions">
                <button className="btn btn-secondary">
                    {Icons.download}
                    Export Report
                </button>
            </div>
        </div>
    );
}

export default Analytics;
