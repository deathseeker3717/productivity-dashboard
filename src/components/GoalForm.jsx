/**
 * GoalForm.jsx - Goal Creation/Edit Modal
 * 
 * Modal form for adding and editing long-term goals.
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './GoalForm.css';

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

function GoalForm() {
    const {
        showGoalModal,
        setShowGoalModal,
        editingGoal,
        setEditingGoal,
        addGoal,
        updateGoal,
        deleteGoal,
        GOAL_PROGRESS_TYPES,
        CATEGORIES
    } = useApp();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        progressType: 'percentage',
        progressTarget: 100,
        linkedCategory: ''
    });

    useEffect(() => {
        if (editingGoal) {
            setFormData({
                title: editingGoal.title,
                description: editingGoal.description || '',
                startDate: editingGoal.startDate,
                endDate: editingGoal.endDate,
                progressType: editingGoal.progressType,
                progressTarget: editingGoal.progressTarget,
                linkedCategory: editingGoal.linkedCategory || ''
            });
        } else {
            // Default end date to 30 days from now
            const defaultEnd = new Date();
            defaultEnd.setDate(defaultEnd.getDate() + 30);
            setFormData({
                title: '',
                description: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: defaultEnd.toISOString().split('T')[0],
                progressType: 'percentage',
                progressTarget: 100,
                linkedCategory: ''
            });
        }
    }, [editingGoal, showGoalModal]);

    const handleClose = () => {
        setShowGoalModal(false);
        setEditingGoal(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.endDate) return;

        if (editingGoal) {
            updateGoal(editingGoal.id, formData);
        } else {
            addGoal(formData);
        }
        handleClose();
    };

    const handleDelete = () => {
        if (editingGoal && confirm('Delete this goal?')) {
            deleteGoal(editingGoal.id);
            handleClose();
        }
    };

    if (!showGoalModal) return null;

    return (
        <div className="goal-form-overlay" onClick={handleClose}>
            <div className="goal-form-modal" onClick={e => e.stopPropagation()}>
                <div className="goal-form-header">
                    <h2>{editingGoal ? 'Edit Goal' : 'New Goal'}</h2>
                    <button className="goal-form-close" onClick={handleClose}>
                        <CloseIcon />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="goal-form-field">
                        <label>Goal Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="What do you want to achieve?"
                            autoFocus
                        />
                    </div>

                    <div className="goal-form-field">
                        <label>Description (optional)</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Add details about this goal..."
                            rows={2}
                        />
                    </div>

                    <div className="goal-form-row">
                        <div className="goal-form-field">
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div className="goal-form-field">
                            <label>End Date</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                min={formData.startDate}
                            />
                        </div>
                    </div>

                    <div className="goal-form-row">
                        <div className="goal-form-field">
                            <label>Progress Type</label>
                            <select
                                value={formData.progressType}
                                onChange={e => setFormData({ ...formData, progressType: e.target.value })}
                            >
                                <option value="percentage">Percentage (0-100%)</option>
                                <option value="count">Count (units)</option>
                                <option value="time">Time (minutes)</option>
                            </select>
                        </div>
                        <div className="goal-form-field">
                            <label>Target</label>
                            <input
                                type="number"
                                value={formData.progressTarget}
                                onChange={e => setFormData({ ...formData, progressTarget: parseInt(e.target.value) || 0 })}
                                min={1}
                            />
                        </div>
                    </div>

                    <div className="goal-form-field">
                        <label>Link to Category (optional)</label>
                        <select
                            value={formData.linkedCategory}
                            onChange={e => setFormData({ ...formData, linkedCategory: e.target.value })}
                        >
                            <option value="">No link</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="goal-form-actions">
                        {editingGoal && (
                            <button type="button" className="goal-delete-btn" onClick={handleDelete}>
                                Delete
                            </button>
                        )}
                        <button type="button" className="goal-cancel-btn" onClick={handleClose}>
                            Cancel
                        </button>
                        <button type="submit" className="goal-submit-btn">
                            {editingGoal ? 'Save Changes' : 'Create Goal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default GoalForm;
