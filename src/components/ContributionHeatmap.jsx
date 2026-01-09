/**
 * ContributionHeatmap.jsx - GitHub-Style Contribution Heatmap
 * 
 * Features:
 * - Three heatmap sections with day labels (Mon, Wed, Fri)
 * - Pixel-perfect grid with computed week columns
 * - Dynamic month label positioning
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import './ContributionHeatmap.css';

const CELL_SIZE = 13;
const CELL_GAP = 3;
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Memoized Heatmap Section Component
const HeatmapSection = React.memo(({ section, yearData, heatmapData, gridWidth, onHover, onLeave }) => {

    const getDayMetrics = useCallback((dateStr) => {
        const dayInfo = heatmapData[dateStr];
        if (!dayInfo) return { working: 0, productivity: 0, away: 0 };
        const working = dayInfo.tasks > 0 ? Math.min(4, Math.ceil(dayInfo.tasks / 2)) : 0;
        const productivity = dayInfo.progress > 0 ? Math.min(4, Math.ceil(dayInfo.progress / 25)) : 0;
        const away = dayInfo.tasks > 0 && dayInfo.progress < 50 ? Math.min(4, 4 - productivity) : 0;
        return { working, productivity, away };
    }, [heatmapData]);

    return (
        <div className="heatmap-section">
            <h4 className="heatmap-section-title">{section.title}</h4>

            <div className="heatmap-graph">
                {/* Month Labels */}
                <div className="heatmap-months-row">
                    <div className="heatmap-day-spacer"></div>
                    <div className="heatmap-month-labels" style={{ width: gridWidth }}>
                        {Array.from(yearData.monthStartWeeks.entries()).map(([month, weekIndex]) => (
                            <span key={month} className="month-label" style={{ left: weekIndex * (CELL_SIZE + CELL_GAP) }}>
                                {MONTH_NAMES[month]}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Grid with Day Labels */}
                <div className="heatmap-grid-row">
                    <div className="heatmap-day-labels">
                        <span className="day-label"></span>
                        <span className="day-label">Mon</span>
                        <span className="day-label"></span>
                        <span className="day-label">Wed</span>
                        <span className="day-label"></span>
                        <span className="day-label">Fri</span>
                        <span className="day-label"></span>
                    </div>
                    <div className="heatmap-grid" style={{ width: gridWidth }}>
                        {yearData.weeks.map((week, wi) => (
                            <div key={wi} className="heatmap-week">
                                {week.map((day) => {
                                    const metrics = getDayMetrics(day.date);
                                    const level = metrics[section.key];
                                    return (
                                        <div
                                            key={day.date}
                                            className={`heatmap-cell ${section.palette}-${level} ${!day.isInYear ? 'outside' : ''} ${day.isToday ? 'today' : ''}`}
                                            onMouseEnter={(e) => onHover(e, day, level, section.key)}
                                            onMouseLeave={onLeave}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer with Legend */}
                <div className="heatmap-footer">
                    <div className="heatmap-legend">
                        <span className="legend-text">Less</span>
                        {[0, 1, 2, 3, 4].map(l => (
                            <span key={l} className={`legend-cell ${section.palette}-${l}`} />
                        ))}
                        <span className="legend-text">More</span>
                    </div>
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison to ensure stability even if functions technically "change" reference but logic doesn't
    return (
        prevProps.section.key === nextProps.section.key &&
        prevProps.yearData === nextProps.yearData && // yearData is useMemo'd in parent
        prevProps.heatmapData === nextProps.heatmapData && // heatmapData comes from context
        prevProps.gridWidth === nextProps.gridWidth
    );
});

function ContributionHeatmap() {
    const { data, heatmapData, currentDate } = useApp();
    const currentYear = new Date(currentDate).getFullYear();

    const availableYears = useMemo(() => {
        const years = new Set([currentYear]);
        Object.keys(data).forEach(monthKey => {
            const year = parseInt(monthKey.split('-')[0]);
            if (year && year <= currentYear && year >= currentYear - 5) {
                years.add(year);
            }
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [data, currentYear]);

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });

    // Generate pixel-perfect year grid
    const yearData = useMemo(() => {
        const year = selectedYear;
        const jan1 = new Date(year, 0, 1);
        const startDate = new Date(jan1);
        startDate.setDate(jan1.getDate() - jan1.getDay());
        const dec31 = new Date(year, 11, 31);

        const weeks = [];
        const monthStartWeeks = new Map();
        let current = new Date(startDate);
        let weekIndex = 0;

        while (current <= dec31) {
            const week = [];
            for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
                const dateStr = current.toISOString().split('T')[0];
                const isInYear = current.getFullYear() === year;
                const month = current.getMonth();
                const dayOfMonth = current.getDate();

                if (isInYear && dayOfMonth >= 1 && dayOfMonth <= 7 && !monthStartWeeks.has(month)) {
                    monthStartWeeks.set(month, weekIndex);
                }

                week.push({
                    date: dateStr, month, dayOfMonth, dayOfWeek, isInYear,
                    isFuture: current > new Date(),
                    isToday: dateStr === currentDate
                });
                current.setDate(current.getDate() + 1);
            }
            weeks.push(week);
            weekIndex++;
        }

        return { weeks, monthStartWeeks, weekCount: weeks.length };
    }, [selectedYear, currentDate]);

    const yearStats = useMemo(() => {
        let activeDays = 0, totalProgress = 0;
        Object.entries(heatmapData).forEach(([date, info]) => {
            if (date.startsWith(String(selectedYear)) && info.progress > 0) {
                activeDays++;
                totalProgress += info.progress;
            }
        });
        return { activeDays, avgProgress: activeDays > 0 ? Math.round(totalProgress / activeDays) : 0 };
    }, [heatmapData, selectedYear]);

    const sections = useMemo(() => [
        { key: 'productivity', title: 'Productivity', palette: 'green' },
        { key: 'working', title: 'Activity', palette: 'blue' },
        { key: 'away', title: 'Missed Days', palette: 'grey' }
    ], []);

    const formatTooltip = (day, level, metricKey) => {
        const date = new Date(day.date);
        const formatted = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        const metricLabels = {
            productivity: ['No activity', 'Low', 'Medium', 'Good', 'Excellent'],
            working: ['No tasks', '1-2 tasks', '3-4 tasks', '5-6 tasks', '7+ tasks'],
            away: ['Active', 'Slight miss', 'Partial miss', 'Significant miss', 'Full miss']
        };
        return `${formatted}\n${metricLabels[metricKey][level]}`;
    };

    // Stable hover handlers
    const handleCellHover = useCallback((e, day, level, metricKey) => {
        if (!day.isInYear) return;
        const rect = e.target.getBoundingClientRect();
        setTooltip({ show: true, x: rect.left + rect.width / 2, y: rect.top - 8, content: formatTooltip(day, level, metricKey) });
    }, []);

    const handleCellLeave = useCallback(() => {
        setTooltip(prev => ({ ...prev, show: false }));
    }, []);

    const gridWidth = yearData.weekCount * (CELL_SIZE + CELL_GAP) - CELL_GAP;

    return (
        <div className="contribution-heatmap">
            {/* Header */}
            <div className="heatmap-header">
                <h3 className="heatmap-title">{yearStats.activeDays} contributions in {selectedYear}</h3>
                <div className="heatmap-year-selector">
                    <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="year-dropdown">
                        {availableYears.map(year => (<option key={year} value={year}>{year}</option>))}
                    </select>
                </div>
            </div>

            {/* Memoized Heatmap Sections */}
            {sections.map(section => (
                <HeatmapSection
                    key={section.key}
                    section={section}
                    yearData={yearData}
                    heatmapData={heatmapData}
                    gridWidth={gridWidth}
                    onHover={handleCellHover}
                    onLeave={handleCellLeave}
                />
            ))}

            {/* Tooltip Layer */}
            {tooltip.show && (
                <div className="heatmap-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
                    {tooltip.content}
                </div>
            )}
        </div>
    );
}

export default ContributionHeatmap;
