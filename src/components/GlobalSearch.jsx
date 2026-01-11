/**
 * GlobalSearch.jsx - Intelligent Global Search Component
 * 
 * Features:
 * - Real-time search across tasks, goals, and dates
 * - Debounced input (300ms)
 * - Keyboard navigation (↑/↓/Enter/Esc)
 * - Highlighted matching text
 * - Navigation to search results
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import './GlobalSearch.css';

// Search icon
const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

// Result type icons
const TypeIcons = {
    task: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
    ),
    goal: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    ),
    date: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    )
};

// Debounce hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

// Highlight matching text
function highlightMatch(text, query) {
    if (!query || !text) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
        regex.test(part) ? <mark key={i}>{part}</mark> : part
    );
}

function GlobalSearch() {
    const {
        data,
        goals,
        setActiveView,
        selectDate,
        currentDate
    } = useApp();

    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    const debouncedQuery = useDebounce(query, 300);

    // Build search index from data
    const searchIndex = useMemo(() => {
        const index = [];

        // Index tasks from all days
        if (data) {
            Object.entries(data).forEach(([monthKey, monthData]) => {
                if (monthData?.days) {
                    Object.entries(monthData.days).forEach(([dateStr, dayData]) => {
                        // Index date
                        try {
                            const date = new Date(dateStr);
                            const dateText = date.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            });
                            index.push({
                                text: dateText,
                                type: 'date',
                                date: dateStr,
                                subtitle: `${dayData.tasks?.length || 0} tasks`
                            });
                        } catch { }

                        // Index tasks
                        if (dayData?.tasks && Array.isArray(dayData.tasks)) {
                            dayData.tasks.forEach(task => {
                                if (task?.name) {
                                    index.push({
                                        text: task.name,
                                        type: 'task',
                                        date: dateStr,
                                        subtitle: task.category || 'task',
                                        completed: task.completed
                                    });
                                }
                            });
                        }
                    });
                }

                // Index monthly goals
                if (monthData?.goals && Array.isArray(monthData.goals)) {
                    monthData.goals.forEach(goal => {
                        if (goal?.title) {
                            index.push({
                                text: goal.title,
                                type: 'goal',
                                date: monthKey,
                                subtitle: `${goal.progress || 0}% complete`
                            });
                        }
                    });
                }
            });
        }

        // Index standalone goals
        if (goals && Array.isArray(goals)) {
            goals.forEach(goal => {
                if (goal?.title) {
                    index.push({
                        text: goal.title,
                        type: 'goal',
                        date: goal.deadline || currentDate,
                        subtitle: `${goal.progress || 0}% complete`
                    });
                }
            });
        }

        return index;
    }, [data, goals, currentDate]);

    // Search results
    const results = useMemo(() => {
        if (!debouncedQuery || debouncedQuery.length < 2) return [];

        const q = debouncedQuery.toLowerCase();
        return searchIndex
            .filter(item => item.text.toLowerCase().includes(q))
            .slice(0, 10); // Limit to 10 results
    }, [debouncedQuery, searchIndex]);

    // Handle result selection
    const handleSelect = useCallback((result) => {
        if (!result) return;

        // Navigate based on type
        if (result.type === 'task' || result.type === 'date') {
            selectDate(result.date);
            setActiveView('dashboard');
        } else if (result.type === 'goal') {
            setActiveView('goals');
        }

        // Close and reset
        setQuery('');
        setIsOpen(false);
        setSelectedIndex(0);
        inputRef.current?.blur();
    }, [selectDate, setActiveView]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e) => {
        if (!isOpen || results.length === 0) {
            if (e.key === 'Escape') {
                setQuery('');
                setIsOpen(false);
                inputRef.current?.blur();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % results.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
                break;
            case 'Enter':
                e.preventDefault();
                handleSelect(results[selectedIndex]);
                break;
            case 'Escape':
                e.preventDefault();
                setQuery('');
                setIsOpen(false);
                inputRef.current?.blur();
                break;
        }
    }, [isOpen, results, selectedIndex, handleSelect]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Open dropdown when results appear
    useEffect(() => {
        if (results.length > 0) {
            setIsOpen(true);
            setSelectedIndex(0);
        } else if (debouncedQuery.length < 2) {
            setIsOpen(false);
        }
    }, [results, debouncedQuery]);

    return (
        <div className="global-search" ref={containerRef}>
            <div className="search-input-wrapper">
                <span className="search-icon"><SearchIcon /></span>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search tasks, goals, dates..."
                    className="search-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                />
                {query && (
                    <button
                        className="search-clear"
                        onClick={() => {
                            setQuery('');
                            setIsOpen(false);
                            inputRef.current?.focus();
                        }}
                    >
                        ×
                    </button>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="search-dropdown">
                    {results.map((result, index) => {
                        const Icon = TypeIcons[result.type] || TypeIcons.task;
                        return (
                            <div
                                key={`${result.type}-${result.date}-${index}`}
                                className={`search-result ${index === selectedIndex ? 'selected' : ''} ${result.completed ? 'completed' : ''}`}
                                onClick={() => handleSelect(result)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <span className={`result-icon ${result.type}`}>
                                    <Icon />
                                </span>
                                <div className="result-content">
                                    <span className="result-text">
                                        {highlightMatch(result.text, debouncedQuery)}
                                    </span>
                                    <span className="result-meta">
                                        {result.subtitle} · {result.date}
                                    </span>
                                </div>
                                <span className="result-type">{result.type}</span>
                            </div>
                        );
                    })}
                    <div className="search-hint">
                        <span>↑↓ navigate</span>
                        <span>↵ select</span>
                        <span>esc close</span>
                    </div>
                </div>
            )}

            {isOpen && debouncedQuery.length >= 2 && results.length === 0 && (
                <div className="search-dropdown">
                    <div className="search-no-results">
                        No results for "{debouncedQuery}"
                    </div>
                </div>
            )}
        </div>
    );
}

export default GlobalSearch;
