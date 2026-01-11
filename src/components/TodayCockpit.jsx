/**
 * TodayCockpit.jsx - Real-Time Today Analytics Dashboard
 * 
 * The primary entry point displaying today's performance metrics.
 * All values derived from task completion data.
 * Updates automatically on state changes and midnight transitions.
 */

import React, { useMemo } from 'react';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import { useApp } from '../context/AppContext';
import './TodayCockpit.css';

// Status determination logic
const getPerformanceStatus = (todayProgress, yesterdayProgress, weeklyAvg) => {
    const vsYesterday = todayProgress - yesterdayProgress;
    const vsWeekly = todayProgress - weeklyAvg;

    if (vsYesterday > 10 && vsWeekly > 5) return { label: 'Improving', class: 'improving' };
    if (vsYesterday < -10 && vsWeekly < -5) return { label: 'Declining', class: 'declining' };
    return { label: 'Stable', class: 'stable' };
};

// Percentage change formatter
const formatChange = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? '+∞' : '—';
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${Math.round(change)}%`;
};

function TodayCockpit() {
    const {
        data,
        currentDate,
        currentMonth,
        currentTime,
        todayProgress,
        todayTasks,
        completedToday,
        weeklyProgress
    } = useApp();

    // === DERIVED ANALYTICS ===

    // Today's metrics
    const totalTasks = todayTasks.length;
    const focusRatio = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0;

    // Yesterday's data (for comparison)
    const yesterdayData = useMemo(() => {
        try {
            const yesterday = subDays(new Date(currentDate), 1);
            const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
            const yesterdayMonth = yesterdayStr.slice(0, 7);
            const dayData = data[yesterdayMonth]?.days[yesterdayStr];

            if (!dayData || !dayData.tasks) return { progress: 0, tasks: 0, completed: 0 };

            const tasks = Array.isArray(dayData.tasks) ? dayData.tasks : [];
            const completed = tasks.filter(t => t && t.completed).length;

            return {
                progress: dayData.progress || 0,
                tasks: tasks.length,
                completed
            };
        } catch {
            return { progress: 0, tasks: 0, completed: 0 };
        }
    }, [data, currentDate]);

    // Weekly average (last 7 days including today)
    const weeklyAverage = useMemo(() => {
        try {
            const result = weeklyProgress;
            if (!result || result.length === 0) return 0;

            const validDays = result.filter(d => d.tasks > 0);
            if (validDays.length === 0) return 0;

            const total = validDays.reduce((sum, d) => sum + d.progress, 0);
            return Math.round(total / validDays.length);
        } catch {
            return 0;
        }
    }, [weeklyProgress]);

    // Comparisons
    const vsYesterday = formatChange(todayProgress, yesterdayData.progress);
    const vsWeekly = formatChange(todayProgress, weeklyAverage);

    // Performance status
    const status = getPerformanceStatus(todayProgress, yesterdayData.progress, weeklyAverage);

    // Time display
    const timeDisplay = format(currentTime, 'h:mm a');
    const dateDisplay = format(currentTime, 'EEEE, MMMM d');

    return (
        <div className="today-cockpit">
            {/* Primary Metric */}
            <div className="cockpit-hero">
                <div className="cockpit-time-badge">
                    <span className="time-value">{timeDisplay}</span>
                    <span className="date-value">{dateDisplay}</span>
                </div>

                <div className="cockpit-primary">
                    <div className="primary-value">{todayProgress}<span className="unit">%</span></div>
                    <div className="primary-label">Today's Progress</div>
                </div>

                <div className={`cockpit-status ${status.class}`}>
                    <div className="status-indicator" />
                    <span>{status.label}</span>
                </div>
            </div>

            {/* Supporting Metrics Grid */}
            <div className="cockpit-metrics">
                <div className="metric-card">
                    <div className="metric-value">{totalTasks}</div>
                    <div className="metric-label">Tasks</div>
                    <div className="metric-detail">{completedToday} completed</div>
                </div>

                <div className="metric-card accent">
                    <div className="metric-value">{focusRatio}<span className="unit">%</span></div>
                    <div className="metric-label">Focus Ratio</div>
                    <div className="metric-detail">completed ÷ total</div>
                </div>

                <div className="metric-card">
                    <div className={`metric-value ${yesterdayData.progress <= todayProgress ? 'positive' : 'negative'}`}>
                        {vsYesterday}
                    </div>
                    <div className="metric-label">vs Yesterday</div>
                    <div className="metric-detail">{yesterdayData.progress}% prev</div>
                </div>

                <div className="metric-card">
                    <div className={`metric-value ${weeklyAverage <= todayProgress ? 'positive' : 'negative'}`}>
                        {vsWeekly}
                    </div>
                    <div className="metric-label">vs Weekly Avg</div>
                    <div className="metric-detail">{weeklyAverage}% avg</div>
                </div>
            </div>
        </div>
    );
}

export default TodayCockpit;
