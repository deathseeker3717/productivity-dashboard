/**
 * SkeletonUI.jsx - Skeleton Loading Components
 * 
 * Matching skeleton placeholders for all major UI components.
 * Prevents layout shifts and provides smooth loading experience.
 */

import React from 'react';
import './SkeletonUI.css';

// Base skeleton element
export const Skeleton = ({ width, height, borderRadius = '6px', className = '' }) => (
    <div
        className={`skeleton ${className}`}
        style={{
            width: width || '100%',
            height: height || '16px',
            borderRadius
        }}
    />
);

// Text line skeleton
export const SkeletonText = ({ lines = 1, width = '100%' }) => (
    <div className="skeleton-text">
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                width={i === lines - 1 ? '70%' : width}
                height="14px"
            />
        ))}
    </div>
);

// Card skeleton
export const SkeletonCard = ({ height = '120px', children }) => (
    <div className="skeleton-card" style={{ height }}>
        {children || (
            <>
                <Skeleton width="60%" height="20px" />
                <Skeleton width="100%" height="14px" />
                <Skeleton width="80%" height="14px" />
            </>
        )}
    </div>
);

// Stat card skeleton
export const SkeletonStatCard = () => (
    <div className="skeleton-stat-card">
        <Skeleton width="40px" height="40px" borderRadius="10px" />
        <div className="skeleton-stat-content">
            <Skeleton width="60px" height="24px" />
            <Skeleton width="80px" height="12px" />
        </div>
    </div>
);

// Weather card skeleton
export const SkeletonWeather = () => (
    <div className="skeleton-weather">
        <Skeleton width="80px" height="14px" />
        <div className="skeleton-weather-main">
            <Skeleton width="50px" height="50px" borderRadius="50%" />
            <Skeleton width="60px" height="32px" />
        </div>
        <div className="skeleton-weather-stats">
            <Skeleton width="50px" height="12px" />
            <Skeleton width="50px" height="12px" />
            <Skeleton width="50px" height="12px" />
        </div>
    </div>
);

// Chart skeleton
export const SkeletonChart = ({ height = '200px' }) => (
    <div className="skeleton-chart" style={{ height }}>
        <div className="skeleton-chart-bars">
            {Array.from({ length: 7 }).map((_, i) => (
                <div
                    key={i}
                    className="skeleton-bar"
                    style={{ height: `${30 + Math.random() * 50}%` }}
                />
            ))}
        </div>
    </div>
);

// Heatmap skeleton
export const SkeletonHeatmap = () => (
    <div className="skeleton-heatmap">
        <Skeleton width="200px" height="18px" />
        <div className="skeleton-heatmap-grid">
            {Array.from({ length: 52 }).map((_, i) => (
                <div key={i} className="skeleton-heatmap-week">
                    {Array.from({ length: 7 }).map((_, j) => (
                        <Skeleton
                            key={j}
                            width="12px"
                            height="12px"
                            borderRadius="2px"
                            className="skeleton-heatmap-cell"
                        />
                    ))}
                </div>
            ))}
        </div>
    </div>
);

// Task list skeleton
export const SkeletonTaskList = ({ count = 4 }) => (
    <div className="skeleton-task-list">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="skeleton-task-item">
                <Skeleton width="20px" height="20px" borderRadius="50%" />
                <div className="skeleton-task-content">
                    <Skeleton width="70%" height="16px" />
                    <Skeleton width="40%" height="12px" />
                </div>
            </div>
        ))}
    </div>
);

// Calendar skeleton
export const SkeletonCalendar = () => (
    <div className="skeleton-calendar">
        <div className="skeleton-calendar-header">
            <Skeleton width="120px" height="20px" />
        </div>
        <div className="skeleton-calendar-grid">
            {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton
                    key={i}
                    width="32px"
                    height="32px"
                    borderRadius="50%"
                    className="skeleton-calendar-day"
                />
            ))}
        </div>
    </div>
);

// Sidebar skeleton
export const SkeletonSidebar = () => (
    <div className="skeleton-sidebar">
        <div className="skeleton-sidebar-logo">
            <Skeleton width="32px" height="32px" borderRadius="8px" />
            <Skeleton width="60px" height="16px" />
        </div>
        <div className="skeleton-sidebar-nav">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-nav-item">
                    <Skeleton width="20px" height="20px" borderRadius="4px" />
                    <Skeleton width="80px" height="14px" />
                </div>
            ))}
        </div>
    </div>
);

// Top bar skeleton
export const SkeletonTopBar = () => (
    <div className="skeleton-top-bar">
        <Skeleton width="280px" height="40px" borderRadius="10px" />
        <div className="skeleton-top-actions">
            <Skeleton width="40px" height="40px" borderRadius="50%" />
            <Skeleton width="40px" height="40px" borderRadius="50%" />
        </div>
    </div>
);

// Full dashboard skeleton
export const SkeletonDashboard = () => (
    <div className="skeleton-dashboard">
        {/* Header */}
        <div className="skeleton-dashboard-header">
            <div>
                <Skeleton width="200px" height="28px" />
                <Skeleton width="180px" height="14px" />
            </div>
            <SkeletonWeather />
        </div>

        {/* Stats */}
        <div className="skeleton-stats-row">
            {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonStatCard key={i} />
            ))}
        </div>

        {/* Overview */}
        <SkeletonCard height="100px">
            <Skeleton width="100px" height="18px" />
            <Skeleton width="100%" height="8px" borderRadius="4px" />
        </SkeletonCard>

        {/* Main grid */}
        <div className="skeleton-dashboard-grid">
            <SkeletonTaskList count={5} />
            <SkeletonCalendar />
        </div>

        {/* Chart */}
        <SkeletonChart height="180px" />
    </div>
);

// Full app layout skeleton
export const SkeletonAppLayout = () => (
    <div className="skeleton-app-layout">
        <SkeletonSidebar />
        <div className="skeleton-main-content">
            <SkeletonTopBar />
            <SkeletonDashboard />
        </div>
    </div>
);

export default {
    Skeleton,
    SkeletonText,
    SkeletonCard,
    SkeletonStatCard,
    SkeletonWeather,
    SkeletonChart,
    SkeletonHeatmap,
    SkeletonTaskList,
    SkeletonCalendar,
    SkeletonSidebar,
    SkeletonTopBar,
    SkeletonDashboard,
    SkeletonAppLayout
};
