/**
 * Goals.jsx - Goals View Page
 * 
 * Dedicated page for viewing and managing long-term goals.
 * Displays active, completed, and expired goals with progress tracking.
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import GoalCard from './GoalCard';
import './Goals.css';

// Calendar Icon for Monthly Setup
const CalendarIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

function Goals() {
    const {
        goals,
        activeGoals,
        completedGoals,
        expiredGoals,
        setShowGoalModal,
        setShowMonthSetup,
        getCurrentMonthData,
        currentMonth
    } = useApp();

    const monthData = getCurrentMonthData();
    const monthlyGoals = monthData.goals || [];
    const monthName = new Date(currentMonth + '-01').toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="goals-page">
            {/* Header */}
            <div className="goals-page-header">
                <div>
                    <h2>Goals</h2>
                    <p className="goals-subtitle">Track your long-term objectives</p>
                </div>
                <button
                    className="add-goal-btn"
                    onClick={() => setShowGoalModal(true)}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Goal
                </button>
            </div>

            {/* Monthly Goals Section */}
            <section className="monthly-goals-section">
                <div className="goals-section-header">
                    <h3>Monthly Goals — {monthName}</h3>
                    <button
                        className="monthly-setup-btn"
                        onClick={() => setShowMonthSetup(true)}
                    >
                        <CalendarIcon />
                        Edit
                    </button>
                </div>
                {monthlyGoals.length > 0 ? (
                    <div className="monthly-goals-list">
                        {monthlyGoals.map((goal, index) => (
                            <div key={index} className="monthly-goal-item">
                                <span className="monthly-goal-number">{index + 1}</span>
                                <span className="monthly-goal-text">{goal}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="monthly-goals-empty">
                        <p>No monthly goals set</p>
                        <button
                            className="setup-monthly-btn"
                            onClick={() => setShowMonthSetup(true)}
                        >
                            <CalendarIcon />
                            Set Up Monthly Goals
                        </button>
                    </div>
                )}
            </section>

            {/* Active Goals */}
            <section className="goals-section-full">
                <div className="goals-section-header">
                    <h3>Active Goals</h3>
                    <span className="goals-count">{activeGoals.length}</span>
                </div>
                {activeGoals.length > 0 ? (
                    <div className="goals-list">
                        {activeGoals.map(goal => (
                            <GoalCard key={goal.id} goal={goal} />
                        ))}
                    </div>
                ) : (
                    <div className="goals-empty-state">
                        <div className="empty-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="6" />
                                <circle cx="12" cy="12" r="2" />
                            </svg>
                        </div>
                        <p>No active goals</p>
                        <span>Create a goal to start tracking your progress</span>
                    </div>
                )}
            </section>

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
                <section className="goals-section-full">
                    <div className="goals-section-header">
                        <h3>Completed</h3>
                        <span className="goals-count success">{completedGoals.length}</span>
                    </div>
                    <div className="goals-list">
                        {completedGoals.map(goal => (
                            <GoalCard key={goal.id} goal={goal} />
                        ))}
                    </div>
                </section>
            )}

            {/* Expired Goals */}
            {expiredGoals.length > 0 && (
                <section className="goals-section-full">
                    <div className="goals-section-header">
                        <h3>Expired</h3>
                        <span className="goals-count muted">{expiredGoals.length}</span>
                    </div>
                    <div className="goals-list">
                        {expiredGoals.map(goal => (
                            <GoalCard key={goal.id} goal={goal} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default Goals;
