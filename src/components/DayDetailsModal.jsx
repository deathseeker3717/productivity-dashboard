/**
 * DayDetailsModal.jsx - Production Day Details Modal
 * 
 * Read-only view for locked days.
 * All data from unified context.
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Icons } from './Icons';
import './DayDetailsModal.css';

function DayDetailsModal({ date, onClose }) {
    const { getDayData, isLocked, isToday, formatDisplayDate } = useApp();

    const dayData = getDayData(date);
    const locked = isLocked(date);
    const today = isToday(date);

    const tasks = dayData?.tasks || [];
    const completedCount = tasks.filter(t => t.completed).length;
    const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    const getProgressClass = (p) => {
        if (p >= 80) return 'complete';
        if (p >= 40) return 'partial';
        return 'missed';
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-info">
                        <h2>{formatDisplayDate(date)}</h2>
                        {today && <span className="today-badge">Today</span>}
                        {locked && <span className="locked-badge">{Icons.lock} Locked</span>}
                    </div>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="progress-section">
                        <div className={`progress-ring ${getProgressClass(progress)}`}>
                            <svg className="circular-chart" viewBox="0 0 36 36">
                                <path
                                    className="circle-bg"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="circle"
                                    strokeDasharray={`${progress}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <span className="ring-value">{progress}%</span>
                        </div>
                        <div className="progress-info">
                            <span className="progress-stat">{completedCount}/{tasks.length} completed</span>
                        </div>
                    </div>

                    <div className="tasks-section">
                        <h4>Tasks</h4>
                        {tasks.length === 0 ? (
                            <p className="no-tasks">No tasks for this day</p>
                        ) : (
                            <ul className="task-list">
                                {tasks.map(task => (
                                    <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                                        <span className={`checkbox ${task.completed ? 'checked' : ''}`}>
                                            {task.completed && '✓'}
                                        </span>
                                        <span className="task-name">{task.name}</span>
                                        <span className={`category-tag ${task.category}`}>{task.category}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DayDetailsModal;
