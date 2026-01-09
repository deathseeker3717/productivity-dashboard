/**
 * MonthSetup.jsx - New Month Initialization Modal
 * 
 * Features:
 * - Step-by-step setup wizard
 * - Monthly goals input
 * - Routine tasks with categories
 * - Skip option
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUser } from '../context/UserContext';
import { Icons } from '../App';
import './MonthSetup.css';

function MonthSetup() {
    const {
        currentMonth,
        setMonthlyGoals,
        setRoutineTasks,
        skipMonthSetup,
        setShowMonthSetup,
        CATEGORIES
    } = useApp();

    const { addNotification } = useUser();

    const [step, setStep] = useState(1);
    const [goals, setGoals] = useState(['']);
    const [routines, setRoutines] = useState([{ name: '', category: 'other' }]);

    // Format month name
    const monthName = new Date(currentMonth + '-01').toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    // Handle goal input
    const handleGoalChange = (index, value) => {
        const newGoals = [...goals];
        newGoals[index] = value;
        setGoals(newGoals);
    };

    const addGoalField = () => {
        if (goals.length < 5) {
            setGoals([...goals, '']);
        }
    };

    const removeGoalField = (index) => {
        if (goals.length > 1) {
            setGoals(goals.filter((_, i) => i !== index));
        }
    };

    // Handle routine input
    const handleRoutineChange = (index, field, value) => {
        const newRoutines = [...routines];
        newRoutines[index][field] = value;
        setRoutines(newRoutines);
    };

    const addRoutineField = () => {
        if (routines.length < 10) {
            setRoutines([...routines, { name: '', category: 'other' }]);
        }
    };

    const removeRoutineField = (index) => {
        if (routines.length > 1) {
            setRoutines(routines.filter((_, i) => i !== index));
        }
    };

    // Navigation
    const goToStep2 = () => {
        const validGoals = goals.filter(g => g.trim());
        setMonthlyGoals(validGoals);
        setStep(2);
    };

    const handleComplete = () => {
        const validRoutines = routines
            .filter(r => r.name.trim())
            .map(r => ({ name: r.name.trim(), category: r.category }));
        setRoutineTasks(validRoutines);
    };

    const handleSkip = () => {
        skipMonthSetup();
        // Add a notification so user can access setup later
        addNotification({
            type: 'info',
            title: 'Monthly Setup Skipped',
            message: `You can set up goals for ${monthName} anytime from Settings → Data.`,
            action: {
                label: 'Set Up Now',
                handler: 'openMonthSetup'
            }
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal month-setup-modal animate-scaleIn">
                {/* Header */}
                <div className="modal-header">
                    <div className="month-setup-header">
                        <div className="month-icon">
                            {Icons.calendar}
                        </div>
                        <div>
                            <h2>Welcome to {monthName}</h2>
                            <p className="text-muted">Let's set up your month for success</p>
                        </div>
                    </div>
                    <button className="btn-icon" onClick={handleSkip} data-tooltip="Skip Setup">
                        {Icons.x}
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="setup-steps">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>
                        <span className="step-number">1</span>
                        <span>Goals</span>
                    </div>
                    <div className="step-line" />
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>
                        <span className="step-number">2</span>
                        <span>Routines</span>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                    {step === 1 && (
                        <div className="setup-section animate-fadeIn">
                            <h3>What are your goals for this month?</h3>
                            <p className="text-muted text-sm">
                                Set 1-5 goals to focus on throughout {monthName}
                            </p>

                            <div className="goals-list">
                                {goals.map((goal, index) => (
                                    <div key={index} className="goal-input-row">
                                        <span className="goal-number">{index + 1}</span>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder={`Goal ${index + 1}...`}
                                            value={goal}
                                            onChange={(e) => handleGoalChange(index, e.target.value)}
                                            autoFocus={index === 0}
                                        />
                                        {goals.length > 1 && (
                                            <button
                                                className="btn-icon delete"
                                                onClick={() => removeGoalField(index)}
                                            >
                                                {Icons.trash}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {goals.length < 5 && (
                                <button className="btn btn-ghost add-btn" onClick={addGoalField}>
                                    {Icons.plus}
                                    Add Another Goal
                                </button>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="setup-section animate-fadeIn">
                            <h3>Set up your daily routines</h3>
                            <p className="text-muted text-sm">
                                These tasks will be auto-added to each day
                            </p>

                            <div className="routines-list">
                                {routines.map((routine, index) => (
                                    <div key={index} className="routine-input-row">
                                        <input
                                            type="text"
                                            className="input routine-name"
                                            placeholder="Routine task..."
                                            value={routine.name}
                                            onChange={(e) => handleRoutineChange(index, 'name', e.target.value)}
                                            autoFocus={index === 0}
                                        />
                                        <select
                                            className="input category-select"
                                            value={routine.category}
                                            onChange={(e) => handleRoutineChange(index, 'category', e.target.value)}
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>
                                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                        {routines.length > 1 && (
                                            <button
                                                className="btn-icon delete"
                                                onClick={() => removeRoutineField(index)}
                                            >
                                                {Icons.trash}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {routines.length < 10 && (
                                <button className="btn btn-ghost add-btn" onClick={addRoutineField}>
                                    {Icons.plus}
                                    Add Routine
                                </button>
                            )}

                            <div className="routine-tip">
                                <span className="tip-icon">{Icons.zap}</span>
                                <span className="text-sm text-muted">
                                    Tip: Common routines include workout, reading, journaling, or reviewing goals
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={handleSkip}>
                        Skip for now
                    </button>

                    {step === 1 ? (
                        <button className="btn btn-primary" onClick={goToStep2}>
                            Continue
                            {Icons.chevronRight}
                        </button>
                    ) : (
                        <div className="footer-actions">
                            <button className="btn btn-secondary" onClick={() => setStep(1)}>
                                {Icons.chevronLeft}
                                Back
                            </button>
                            <button className="btn btn-success" onClick={handleComplete}>
                                {Icons.check}
                                Complete Setup
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MonthSetup;
