/**
 * GoalCard.jsx - Goal Progress Card
 * 
 * Displays goal with timeline indicator and progress visualization.
 * Calm, non-distracting design for long-term objectives.
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import './GoalCard.css';

// Icons
const TargetIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20,6 9,17 4,12" />
    </svg>
);

const ClockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
    </svg>
);

const EditIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

function GoalCard({ goal }) {
    const { getGoalProgress, getDaysRemaining, setGoalProgress, setEditingGoal, setShowGoalModal } = useApp();

    const progress = getGoalProgress(goal);
    const daysRemaining = getDaysRemaining(goal);
    const progressPercent = Math.round((goal.progressCurrent / goal.progressTarget) * 100);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getStateClass = () => {
        if (goal.state === 'completed') return 'completed';
        if (goal.state === 'expired') return 'expired';
        if (daysRemaining <= 3) return 'urgent';
        return 'active';
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        setEditingGoal(goal);
        setShowGoalModal(true);
    };

    const handleProgressClick = () => {
        if (goal.state !== 'active') return;
        // Increment progress based on type
        const increment = goal.progressType === 'percentage' ? 10 : 1;
        const newValue = Math.min(goal.progressTarget, goal.progressCurrent + increment);
        setGoalProgress(goal.id, newValue);
    };

    return (
        <div className={`goal-card ${getStateClass()}`}>
            <div className="goal-header">
                <div className="goal-icon">
                    {goal.state === 'completed' ? <CheckIcon /> : <TargetIcon />}
                </div>
                <div className="goal-title-section">
                    <h4 className="goal-title">{goal.title}</h4>
                    <div className="goal-dates">
                        <ClockIcon />
                        <span>{formatDate(goal.startDate)} → {formatDate(goal.endDate)}</span>
                    </div>
                </div>
                <button className="goal-edit-btn" onClick={handleEdit}>
                    <EditIcon />
                </button>
            </div>

            {goal.description && (
                <p className="goal-description">{goal.description}</p>
            )}

            <div className="goal-progress-section" onClick={handleProgressClick}>
                <div className="goal-progress-bar">
                    <div
                        className="goal-progress-fill"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <div className="goal-progress-stats">
                    <span className="goal-progress-value">
                        {goal.progressCurrent}/{goal.progressTarget}
                        {goal.progressType === 'percentage' && '%'}
                        {goal.progressType === 'time' && ' min'}
                    </span>
                    {goal.state === 'active' && (
                        <span className="goal-days-remaining">
                            {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
                        </span>
                    )}
                    {goal.state === 'completed' && (
                        <span className="goal-completed-badge">Completed</span>
                    )}
                    {goal.state === 'expired' && (
                        <span className="goal-expired-badge">Expired</span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GoalCard;
