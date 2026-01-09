/**
 * TaskList.jsx - Production Task List
 * 
 * All operations through unified context.
 * Respects locked state for historical days.
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icons } from './Icons';
import './TaskList.css';

function TaskList() {
    const {
        selectedDate,
        currentDate,
        getSelectedDayData,
        addTask,
        toggleTask,
        editTask,
        deleteTask,
        isToday,
        isLocked,
        formatDisplayDate,
        CATEGORIES
    } = useApp();

    const [newTaskName, setNewTaskName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('other');
    const [editingId, setEditingId] = useState(null);

    const dayData = getSelectedDayData();
    const tasks = dayData?.tasks || [];
    const locked = isLocked(selectedDate);
    const today = isToday(selectedDate);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newTaskName.trim() && !locked) {
            addTask(newTaskName.trim(), selectedCategory);
            setNewTaskName('');
        }
    };

    const handleToggle = (taskId) => {
        if (!locked) {
            toggleTask(taskId);
        }
    };

    const handleDelete = (taskId) => {
        if (!locked) {
            deleteTask(taskId);
        }
    };

    const completedCount = tasks.filter(t => t.completed).length;
    const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    return (
        <div className={`task-list ${locked ? 'locked-view' : ''}`}>
            <div className="task-list-header">
                <div className="header-info">
                    <h3>{today ? "Today's Tasks" : formatDisplayDate(selectedDate)}</h3>
                    <span className="task-count">{completedCount}/{tasks.length} completed</span>
                </div>
                {locked && (
                    <span className="locked-badge">
                        {Icons.lock} Locked
                    </span>
                )}
            </div>

            {!locked && (
                <form onSubmit={handleSubmit} className="add-task-form">
                    <div className="input-row">
                        <input
                            type="text"
                            className="task-input"
                            placeholder="Add a new task..."
                            value={newTaskName}
                            onChange={(e) => setNewTaskName(e.target.value)}
                        />
                        <select
                            className="category-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                        <button type="submit" className="btn btn-primary add-btn">
                            Add
                        </button>
                    </div>
                </form>
            )}

            <div className="tasks-container">
                {tasks.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">{Icons.tasks}</span>
                        <p>No tasks for this day</p>
                        {!locked && <p className="empty-hint">Add your first task above</p>}
                    </div>
                ) : (
                    <ul className="task-items">
                        {tasks.map(task => (
                            <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                                <button
                                    className={`checkbox ${task.completed ? 'checked' : ''}`}
                                    onClick={() => handleToggle(task.id)}
                                    disabled={locked}
                                >
                                    {task.completed && '✓'}
                                </button>

                                <div className="task-content">
                                    <span className="task-name">{task.name}</span>
                                    <div className="task-meta">
                                        <span className={`category-tag ${task.category}`}>
                                            {task.category}
                                        </span>
                                        {task.isRoutine && (
                                            <span className="routine-badge">Routine</span>
                                        )}
                                    </div>
                                </div>

                                {!locked && (
                                    <div className="task-actions">
                                        <button
                                            className="action-btn delete"
                                            onClick={() => handleDelete(task.id)}
                                        >
                                            {Icons.trash}
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {tasks.length > 0 && (
                <div className="task-list-footer">
                    <div className="progress-bar">
                        <div
                            className={`progress-fill ${progress >= 80 ? 'complete' : progress >= 40 ? 'partial' : 'missed'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="progress-text">{progress}% complete</span>
                </div>
            )}
        </div>
    );
}

export default TaskList;
