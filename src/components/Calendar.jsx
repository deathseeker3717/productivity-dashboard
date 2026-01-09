/**
 * Calendar.jsx - Production Calendar View
 * 
 * Unified view of monthly data with heatmap colors.
 * All data derived from AppContext.
 */

import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icons } from '../App';
import DayDetailsModal from './DayDetailsModal';
import './Calendar.css';

function Calendar({ embedded = false }) {
    const {
        currentMonth,
        currentDate,
        setCurrentMonth,
        heatmapData,
        isToday,
        isLocked
    } = useApp();

    const [selectedDayModal, setSelectedDayModal] = useState(null);
    const [viewMonth, setViewMonth] = useState(currentMonth);

    const [year, month] = viewMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const getProgressClass = (progress) => {
        if (progress >= 80) return 'intensity-4';
        if (progress >= 60) return 'intensity-3';
        if (progress >= 40) return 'intensity-2';
        if (progress > 0) return 'intensity-1';
        return 'intensity-0';
    };

    const calendarDays = useMemo(() => {
        const days = [];

        // Empty cells for first week padding
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push({ empty: true, key: `empty-${i}` });
        }

        // Actual days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${viewMonth}-${String(d).padStart(2, '0')}`;
            const dayInfo = heatmapData[dateStr] || { progress: 0, tasks: 0, locked: false };

            days.push({
                day: d,
                date: dateStr,
                progress: dayInfo.progress,
                tasks: dayInfo.tasks,
                completed: dayInfo.completed,
                locked: dayInfo.locked || (dateStr < currentDate),
                isToday: dateStr === currentDate,
                key: dateStr
            });
        }

        return days;
    }, [viewMonth, heatmapData, currentDate, daysInMonth, firstDayOfWeek]);

    const navigateMonth = (delta) => {
        const d = new Date(year, month - 1 + delta, 1);
        setViewMonth(d.toISOString().slice(0, 7));
    };

    const goToToday = () => {
        setViewMonth(currentMonth);
    };

    return (
        <div className={`calendar ${embedded ? 'embedded' : ''}`}>
            {!embedded && (
                <div className="calendar-header">
                    <div className="calendar-title-section">
                        <h2 className="calendar-title">{monthNames[month - 1]} {year}</h2>
                        <button className="btn-today" onClick={goToToday}>Today</button>
                    </div>
                    <div className="calendar-nav">
                        <button className="nav-btn" onClick={() => navigateMonth(-1)}>{Icons.chevronLeft}</button>
                        <button className="nav-btn" onClick={() => navigateMonth(1)}>{Icons.chevronRight}</button>
                    </div>
                </div>
            )}

            {embedded && (
                <div className="calendar-header-compact">
                    <span className="calendar-month">{monthNames[month - 1]} {year}</span>
                    <div className="calendar-nav-compact">
                        <button onClick={() => navigateMonth(-1)}>&lt;</button>
                        <button onClick={() => navigateMonth(1)}>&gt;</button>
                    </div>
                </div>
            )}

            <div className="calendar-weekdays">
                {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(d => (
                    <span key={d} className="weekday">{d}</span>
                ))}
            </div>

            <div className="calendar-grid">
                {calendarDays.map(day => (
                    day.empty ? (
                        <div key={day.key} className="cal-cell empty" />
                    ) : (
                        <div
                            key={day.key}
                            className={`cal-cell ${getProgressClass(day.progress)} ${day.isToday ? 'today' : ''} ${day.locked ? 'locked' : ''}`}
                            onClick={() => setSelectedDayModal(day.date)}
                        >
                            <span className="day-number">{day.day}</span>
                            {day.progress > 0 && (
                                <span className="day-progress">{day.progress}%</span>
                            )}
                            {day.locked && day.progress === 0 && (
                                <span className="lock-icon">{Icons.lock}</span>
                            )}
                            {day.isToday && <div className="today-indicator" />}
                        </div>
                    )
                ))}
            </div>

            {!embedded && (
                <div className="calendar-legend">
                    <span className="legend-label">Less</span>
                    <div className="legend-scale">
                        <span className="legend-cell intensity-0" />
                        <span className="legend-cell intensity-1" />
                        <span className="legend-cell intensity-2" />
                        <span className="legend-cell intensity-3" />
                        <span className="legend-cell intensity-4" />
                    </div>
                    <span className="legend-label">More</span>
                </div>
            )}

            {selectedDayModal && (
                <DayDetailsModal
                    date={selectedDayModal}
                    onClose={() => setSelectedDayModal(null)}
                />
            )}
        </div>
    );
}

export default Calendar;
