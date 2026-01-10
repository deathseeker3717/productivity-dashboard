/**
 * AppContext.jsx - Production State Management
 * 
 * Unified state-driven system for productivity tracking.
 * All views derive from this single canonical data source.
 * 
 * Features:
 * - Real-time clock updates (every second)
 * - Automatic midnight transitions (no reload)
 * - Persistent localStorage with graceful fallback
 * - Memoized derived analytics
 * - Streak calculation
 * - Month-over-month comparisons
 * - Category breakdown
 * - Heatmap data generation
 */

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef
} from 'react';

const AppContext = createContext();
const STORAGE_KEY = 'productivityData';
const GOALS_STORAGE_KEY = 'goalsData';
const CATEGORIES = ['work', 'personal', 'health', 'learning', 'other'];
const GOAL_PROGRESS_TYPES = ['percentage', 'count', 'time'];

// ============================================
// PURE UTILITY FUNCTIONS
// ============================================

const getTodayDate = () => {
    try {
        return new Date().toISOString().split('T')[0];
    } catch {
        return new Date().toLocaleDateString('en-CA');
    }
};

const getCurrentMonth = () => {
    try {
        return getTodayDate().slice(0, 7);
    } catch {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
};

const getMonthFromDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return getCurrentMonth();
    return dateStr.slice(0, 7);
};

const formatDisplayDate = (dateStr) => {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return dateStr || '';
    }
};

const initMonthData = () => ({
    goals: [],
    routines: [],
    days: {},
    setupComplete: false
});

const initDayData = () => ({
    tasks: [],
    progress: 0,
    locked: false,
    lockedAt: null
});

const calculateProgress = (tasks) => {
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) return 0;
    const completed = tasks.filter(t => t && t.completed).length;
    return Math.round((completed / tasks.length) * 100);
};

const deepClone = (obj) => {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch {
        return {};
    }
};

// ============================================
// PROVIDER COMPONENT
// ============================================

export function AppProvider({ children }) {
    // ============================================
    // CANONICAL TIME STATE (Immutable truth - actual current time)
    // ============================================
    const [data, setData] = useState({});
    const [currentDate, setCurrentDate] = useState(() => getTodayDate());
    const [currentMonth, setCurrentMonth] = useState(() => getCurrentMonth());
    const [currentYear] = useState(() => new Date().getFullYear());

    // ============================================
    // VIEW STATE (What user is currently looking at)
    // These are separate from canonical time - user can navigate to any date
    // ============================================
    const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(() => getCurrentMonth());
    const [viewDate, setViewDate] = useState(() => getTodayDate());

    // Legacy compatibility - selectedDate maps to viewDate
    const selectedDate = viewDate;
    const setSelectedDate = setViewDate;

    const [activeView, setActiveViewState] = useState(() => {
        try {
            const saved = localStorage.getItem('activeView');
            return saved || 'dashboard';
        } catch {
            return 'dashboard';
        }
    });
    const [showMonthSetup, setShowMonthSetup] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDataReady, setIsDataReady] = useState(false);

    // Wrapper to persist activeView changes
    const setActiveView = useCallback((view) => {
        setActiveViewState(view);
        try {
            localStorage.setItem('activeView', view);
        } catch {
            // Silent fail for localStorage
        }
    }, []);

    // Goal state (independent of daily tasks)
    const [goals, setGoals] = useState([]);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);

    // Real-time clock state
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const midnightTimeoutRef = useRef(null);
    const clockIntervalRef = useRef(null);
    const isMountedRef = useRef(true);

    // ============================================
    // UNIFIED NAVIGATION FUNCTIONS
    // These ensure all components update together
    // ============================================

    // Navigate to a specific year - updates heatmap, charts, stats
    const navigateToYear = useCallback((year) => {
        if (!isMountedRef.current) return;
        const numYear = typeof year === 'string' ? parseInt(year) : year;
        if (isNaN(numYear) || numYear < 2020 || numYear > 2100) return;
        setViewYear(numYear);
    }, []);

    // Navigate to a specific month - updates calendar, analytics, monthly stats
    const navigateToMonth = useCallback((monthKey) => {
        if (!isMountedRef.current || !monthKey) return;
        // Validate format YYYY-MM
        if (!/^\d{4}-\d{2}$/.test(monthKey)) return;
        setViewMonth(monthKey);
        // Also update viewYear to match
        const year = parseInt(monthKey.split('-')[0]);
        if (!isNaN(year)) {
            setViewYear(year);
        }
    }, []);

    // Select a specific date - updates task panel, day details
    const selectDate = useCallback((dateStr) => {
        if (!isMountedRef.current || !dateStr) return;
        // Validate format YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return;
        setViewDate(dateStr);
        // Also update month and year to match
        const monthKey = dateStr.slice(0, 7);
        const year = parseInt(dateStr.split('-')[0]);
        setViewMonth(monthKey);
        if (!isNaN(year)) {
            setViewYear(year);
        }
    }, []);

    // Reset all view state to current date (today)
    const resetToToday = useCallback(() => {
        if (!isMountedRef.current) return;
        const today = getTodayDate();
        const month = getCurrentMonth();
        const year = new Date().getFullYear();
        setViewDate(today);
        setViewMonth(month);
        setViewYear(year);
    }, []);

    // ============================================
    // MOUNT TRACKING
    // ============================================

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // ============================================
    // REAL-TIME CLOCK (Updates every second)
    // ============================================

    useEffect(() => {
        const updateClock = () => {
            if (isMountedRef.current) {
                setCurrentTime(new Date());
            }
        };
        clockIntervalRef.current = setInterval(updateClock, 1000);
        return () => {
            if (clockIntervalRef.current) {
                clearInterval(clockIntervalRef.current);
            }
        };
    }, []);

    // ============================================
    // DATA PERSISTENCE
    // ============================================

    useEffect(() => {
        let isMounted = true;

        const loadData = () => {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved && isMounted) {
                    const parsed = JSON.parse(saved);
                    setData(parsed || {});
                }
                const savedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
                if (savedGoals && isMounted) {
                    setGoals(JSON.parse(savedGoals) || []);
                }
            } catch {
                // Silent fail - use empty defaults
            }

            if (isMounted) {
                setIsLoading(false);
                setIsDataReady(true);
            }
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(loadData, 10);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        if (!isLoading && Object.keys(data).length > 0) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            } catch {
                // Silent fail for localStorage
            }
        }
    }, [data, isLoading]);

    // Persist goals independently
    useEffect(() => {
        if (!isLoading && isMountedRef.current) {
            try {
                localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
            } catch {
                // Silent fail for localStorage
            }
        }
    }, [goals, isLoading]);

    // ============================================
    // DAY/MONTH INITIALIZATION
    // ============================================

    // Ref to track if we've already initialized the current day
    const initializedDaysRef = useRef(new Set());

    useEffect(() => {
        if (isLoading || !isMountedRef.current) return;

        // Create a unique key for this day initialization
        const dayKey = `${currentMonth}-${currentDate}`;

        // Skip if we've already initialized this day
        if (initializedDaysRef.current.has(dayKey)) return;

        // Mark as initialized
        initializedDaysRef.current.add(dayKey);

        setData(prev => {
            // Check if initialization is actually needed
            const needsMonthInit = !prev[currentMonth];
            const needsDayInit = !prev[currentMonth]?.days?.[currentDate];

            // If nothing needs initialization, return previous state (no re-render)
            if (!needsMonthInit && !needsDayInit) {
                return prev;
            }

            const newData = deepClone(prev);

            if (!newData[currentMonth]) {
                newData[currentMonth] = initMonthData();
            }

            if (!newData[currentMonth].days[currentDate]) {
                newData[currentMonth].days[currentDate] = initDayData();

                const routines = newData[currentMonth].routines || [];
                routines.forEach(routine => {
                    if (routine && routine.name) {
                        newData[currentMonth].days[currentDate].tasks.push({
                            id: Date.now() + Math.random(),
                            name: routine.name,
                            category: routine.category || 'other',
                            completed: false,
                            createdAt: new Date().toISOString(),
                            isRoutine: true
                        });
                    }
                });
            }

            return newData;
        });
    }, [currentMonth, currentDate, isLoading]);

    // Separate effect for Month Setup modal (only runs once per month)
    const setupShownForMonthRef = useRef(new Set());

    useEffect(() => {
        if (isLoading || !isMountedRef.current) return;

        // Skip if we've already checked this month
        if (setupShownForMonthRef.current.has(currentMonth)) return;
        setupShownForMonthRef.current.add(currentMonth);

        try {
            const dayOfMonth = new Date(currentDate).getDate();
            const isFirstDayOfMonth = dayOfMonth === 1;

            // Use functional check to avoid stale closure
            setData(prev => {
                const monthData = prev[currentMonth];
                if (monthData && !monthData.setupComplete && isFirstDayOfMonth) {
                    // Schedule the modal to show (don't update state here)
                    setTimeout(() => {
                        if (isMountedRef.current) {
                            setShowMonthSetup(true);
                        }
                    }, 100);
                }
                return prev; // Return same reference - no re-render
            });
        } catch {
            // Silent fail
        }
    }, [currentMonth, currentDate, isLoading]);

    // ============================================
    // MIDNIGHT LOCK SYSTEM
    // ============================================

    const lockDay = useCallback((dateStr) => {
        if (!dateStr || !isMountedRef.current) return;

        setData(prev => {
            const newData = deepClone(prev);
            const month = getMonthFromDate(dateStr);

            if (newData[month]?.days[dateStr] && !newData[month].days[dateStr].locked) {
                const day = newData[month].days[dateStr];
                day.locked = true;
                day.lockedAt = new Date().toISOString();
                day.progress = calculateProgress(day.tasks);
            }

            return newData;
        });
    }, []);

    const handleMidnight = useCallback(() => {
        if (!isMountedRef.current) return;

        const prevDate = currentDate;
        lockDay(prevDate);

        const newDate = getTodayDate();
        const newMonth = getCurrentMonth();

        setCurrentDate(newDate);
        setCurrentMonth(newMonth);
        setSelectedDate(newDate);
    }, [currentDate, lockDay]);

    useEffect(() => {
        const scheduleMidnight = () => {
            try {
                const now = new Date();
                const midnight = new Date();
                midnight.setHours(24, 0, 0, 0);
                const msUntilMidnight = midnight.getTime() - now.getTime();

                midnightTimeoutRef.current = setTimeout(() => {
                    if (isMountedRef.current) {
                        handleMidnight();
                        scheduleMidnight();
                    }
                }, msUntilMidnight);
            } catch {
                // Silent fail
            }
        };

        scheduleMidnight();
        return () => {
            if (midnightTimeoutRef.current) {
                clearTimeout(midnightTimeoutRef.current);
            }
        };
    }, [handleMidnight]);

    // ============================================
    // TASK OPERATIONS (Unified)
    // ============================================

    const addTask = useCallback((taskName, category = 'other', targetDate = null) => {
        if (!taskName || !isMountedRef.current) return;

        const date = targetDate || selectedDate;
        const month = getMonthFromDate(date);

        setData(prev => {
            const newData = deepClone(prev);

            if (!newData[month]) newData[month] = initMonthData();
            if (!newData[month].days[date]) newData[month].days[date] = initDayData();

            const day = newData[month].days[date];
            if (day.locked) return prev;

            day.tasks.push({
                id: Date.now(),
                name: taskName,
                category,
                completed: false,
                createdAt: new Date().toISOString(),
                isRoutine: false
            });

            day.progress = calculateProgress(day.tasks);
            return newData;
        });
    }, [selectedDate]);

    const toggleTask = useCallback((taskId, targetDate = null) => {
        if (!taskId || !isMountedRef.current) return;

        const date = targetDate || selectedDate;
        const month = getMonthFromDate(date);

        setData(prev => {
            const newData = deepClone(prev);
            const day = newData[month]?.days[date];

            if (!day || day.locked) return prev;

            const task = day.tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                task.completedAt = task.completed ? new Date().toISOString() : null;
                day.progress = calculateProgress(day.tasks);
            }

            return newData;
        });
    }, [selectedDate]);

    const editTask = useCallback((taskId, updates, targetDate = null) => {
        if (!taskId || !updates || !isMountedRef.current) return;

        const date = targetDate || selectedDate;
        const month = getMonthFromDate(date);

        setData(prev => {
            const newData = deepClone(prev);
            const day = newData[month]?.days[date];

            if (!day || day.locked) return prev;

            const task = day.tasks.find(t => t.id === taskId);
            if (task) Object.assign(task, updates);

            return newData;
        });
    }, [selectedDate]);

    const deleteTask = useCallback((taskId, targetDate = null) => {
        if (!taskId || !isMountedRef.current) return;

        const date = targetDate || selectedDate;
        const month = getMonthFromDate(date);

        setData(prev => {
            const newData = deepClone(prev);
            const day = newData[month]?.days[date];

            if (!day || day.locked) return prev;

            day.tasks = day.tasks.filter(t => t.id !== taskId);
            day.progress = calculateProgress(day.tasks);

            return newData;
        });
    }, [selectedDate]);

    // ============================================
    // MONTHLY SETUP
    // ============================================

    const setMonthlyGoals = useCallback((goals) => {
        if (!isMountedRef.current) return;

        setData(prev => {
            const newData = deepClone(prev);
            if (!newData[currentMonth]) newData[currentMonth] = initMonthData();
            newData[currentMonth].goals = goals || [];
            return newData;
        });
    }, [currentMonth]);

    const setRoutineTasks = useCallback((routines) => {
        if (!isMountedRef.current) return;

        setData(prev => {
            const newData = deepClone(prev);
            if (!newData[currentMonth]) newData[currentMonth] = initMonthData();

            newData[currentMonth].routines = routines || [];
            newData[currentMonth].setupComplete = true;

            const today = newData[currentMonth].days[currentDate];
            if (today && !today.locked && Array.isArray(routines)) {
                routines.forEach(routine => {
                    if (!routine || !routine.name) return;
                    const exists = today.tasks.some(t => t.isRoutine && t.name === routine.name);
                    if (!exists) {
                        today.tasks.push({
                            id: Date.now() + Math.random(),
                            name: routine.name,
                            category: routine.category || 'other',
                            completed: false,
                            createdAt: new Date().toISOString(),
                            isRoutine: true
                        });
                    }
                });
                today.progress = calculateProgress(today.tasks);
            }

            return newData;
        });
        setShowMonthSetup(false);
    }, [currentMonth, currentDate]);

    const skipMonthSetup = useCallback(() => {
        if (!isMountedRef.current) return;

        setData(prev => {
            const newData = deepClone(prev);
            if (!newData[currentMonth]) newData[currentMonth] = initMonthData();
            newData[currentMonth].setupComplete = true;
            return newData;
        });
        setShowMonthSetup(false);
    }, [currentMonth]);

    // ============================================
    // GOAL OPERATIONS
    // ============================================

    const addGoal = useCallback((goalData) => {
        if (!goalData || !isMountedRef.current) return;

        const newGoal = {
            id: Date.now(),
            title: goalData.title || '',
            description: goalData.description || '',
            startDate: goalData.startDate || getTodayDate(),
            endDate: goalData.endDate,
            progressType: goalData.progressType || 'percentage',
            progressTarget: goalData.progressTarget || 100,
            progressCurrent: 0,
            state: 'active',
            linkedCategory: goalData.linkedCategory || null,
            createdAt: new Date().toISOString()
        };
        setGoals(prev => [...prev, newGoal]);
        setShowGoalModal(false);
    }, []);

    const updateGoal = useCallback((goalId, updates) => {
        if (!goalId || !updates || !isMountedRef.current) return;

        setGoals(prev => prev.map(g =>
            g.id === goalId ? { ...g, ...updates } : g
        ));
        setEditingGoal(null);
    }, []);

    const deleteGoal = useCallback((goalId) => {
        if (!goalId || !isMountedRef.current) return;

        setGoals(prev => prev.filter(g => g.id !== goalId));
    }, []);

    const updateGoalProgress = useCallback((goalId, amount) => {
        if (!goalId || !isMountedRef.current) return;

        setGoals(prev => prev.map(g => {
            if (g.id !== goalId) return g;
            const newProgress = Math.min(g.progressTarget, Math.max(0, g.progressCurrent + amount));
            const newState = newProgress >= g.progressTarget ? 'completed' : g.state;
            return { ...g, progressCurrent: newProgress, state: newState };
        }));
    }, []);

    const setGoalProgress = useCallback((goalId, value) => {
        if (!goalId || !isMountedRef.current) return;

        setGoals(prev => prev.map(g => {
            if (g.id !== goalId) return g;
            const newProgress = Math.min(g.progressTarget, Math.max(0, value));
            const newState = newProgress >= g.progressTarget ? 'completed' : g.state;
            return { ...g, progressCurrent: newProgress, state: newState };
        }));
    }, []);

    // Auto-expire goals past their end date
    useEffect(() => {
        if (isLoading || !isMountedRef.current) return;

        const today = getTodayDate();
        setGoals(prev => prev.map(g => {
            if (g.state === 'active' && g.endDate && g.endDate < today) {
                return { ...g, state: 'expired' };
            }
            return g;
        }));
    }, [currentDate, isLoading]);

    // Derived goal values
    const activeGoals = useMemo(() => {
        return Array.isArray(goals) ? goals.filter(g => g && g.state === 'active') : [];
    }, [goals]);

    const completedGoals = useMemo(() => {
        return Array.isArray(goals) ? goals.filter(g => g && g.state === 'completed') : [];
    }, [goals]);

    const expiredGoals = useMemo(() => {
        return Array.isArray(goals) ? goals.filter(g => g && g.state === 'expired') : [];
    }, [goals]);

    const getGoalProgress = useCallback((goal) => {
        if (!goal) return 0;
        if (goal.progressType === 'percentage') {
            return Math.round((goal.progressCurrent / (goal.progressTarget || 1)) * 100);
        }
        return goal.progressCurrent || 0;
    }, []);

    const getDaysRemaining = useCallback((goal) => {
        if (!goal || !goal.endDate) return 0;
        try {
            const today = new Date(getTodayDate());
            const end = new Date(goal.endDate);
            const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
            return Math.max(0, diff);
        } catch {
            return 0;
        }
    }, []);

    // ============================================
    // DERIVED ANALYTICS (Memoized)
    // ============================================

    const calculateStreak = useMemo(() => {
        let streak = 0;
        try {
            let checkDate = new Date();
            checkDate.setDate(checkDate.getDate() - 1);

            while (streak < 365) {
                const dateStr = checkDate.toISOString().split('T')[0];
                const month = getMonthFromDate(dateStr);
                const dayData = data[month]?.days[dateStr];

                if (!dayData || dayData.progress < 50) break;
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
        } catch {
            // Silent fail
        }
        return streak;
    }, [data]);

    const todayProgress = useMemo(() => {
        const day = data[currentMonth]?.days[currentDate];
        return day ? calculateProgress(day.tasks) : 0;
    }, [data, currentMonth, currentDate]);

    const monthProgress = useMemo(() => {
        const monthData = data[currentMonth];
        if (!monthData?.days) return 0;

        const days = Object.values(monthData.days);
        const daysWithTasks = days.filter(d => d && Array.isArray(d.tasks) && d.tasks.length > 0);
        if (daysWithTasks.length === 0) return 0;

        const total = daysWithTasks.reduce((sum, d) => sum + (d.progress || 0), 0);
        return Math.round(total / daysWithTasks.length);
    }, [data, currentMonth]);

    const todayTasks = useMemo(() => {
        const tasks = data[currentMonth]?.days[currentDate]?.tasks;
        return Array.isArray(tasks) ? tasks : [];
    }, [data, currentMonth, currentDate]);

    const completedToday = useMemo(() => {
        return todayTasks.filter(t => t && t.completed).length;
    }, [todayTasks]);

    const categoryBreakdown = useMemo(() => {
        const breakdown = {};
        CATEGORIES.forEach(c => breakdown[c] = { total: 0, completed: 0 });

        try {
            Object.values(data).forEach(monthData => {
                if (!monthData?.days) return;
                Object.values(monthData.days).forEach(dayData => {
                    if (!dayData?.tasks || !Array.isArray(dayData.tasks)) return;
                    dayData.tasks.forEach(task => {
                        if (!task) return;
                        const cat = task.category || 'other';
                        if (breakdown[cat]) {
                            breakdown[cat].total++;
                            if (task.completed) breakdown[cat].completed++;
                        }
                    });
                });
            });
        } catch {
            // Silent fail
        }

        return breakdown;
    }, [data]);

    const weeklyProgress = useMemo(() => {
        const result = [];
        try {
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const month = getMonthFromDate(dateStr);
                const dayData = data[month]?.days[dateStr];

                result.push({
                    date: dateStr,
                    day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    progress: dayData?.progress || 0,
                    tasks: dayData?.tasks?.length || 0,
                    completed: dayData?.tasks?.filter(t => t && t.completed).length || 0
                });
            }
        } catch {
            // Return empty array on error
        }
        return result;
    }, [data]);

    const heatmapData = useMemo(() => {
        const result = {};
        try {
            Object.entries(data).forEach(([month, monthData]) => {
                if (!monthData?.days) return;
                Object.entries(monthData.days).forEach(([date, dayData]) => {
                    if (!dayData) return;
                    result[date] = {
                        progress: dayData.progress || 0,
                        tasks: dayData.tasks?.length || 0,
                        completed: dayData.tasks?.filter(t => t && t.completed).length || 0,
                        locked: dayData.locked || false
                    };
                });
            });
        } catch {
            // Silent fail
        }
        return result;
    }, [data]);

    // ============================================
    // GETTERS
    // ============================================

    const getSelectedDayData = useCallback(() => {
        const month = getMonthFromDate(selectedDate);
        return data[month]?.days[selectedDate] || initDayData();
    }, [data, selectedDate]);

    const getTodayData = useCallback(() => {
        return data[currentMonth]?.days[currentDate] || initDayData();
    }, [data, currentMonth, currentDate]);

    const getCurrentMonthData = useCallback(() => {
        return data[currentMonth] || initMonthData();
    }, [data, currentMonth]);

    const getDayData = useCallback((dateStr) => {
        if (!dateStr) return initDayData();
        const month = getMonthFromDate(dateStr);
        return data[month]?.days[dateStr] || initDayData();
    }, [data]);

    const getMonthData = useCallback((monthStr) => {
        return data[monthStr] || initMonthData();
    }, [data]);

    const getAllMonths = useCallback(() => {
        try {
            return Object.keys(data)
                .filter(k => k && k.match(/^\d{4}-\d{2}$/))
                .sort()
                .reverse();
        } catch {
            return [];
        }
    }, [data]);

    const isToday = useCallback((dateStr) => dateStr === currentDate, [currentDate]);

    const isLocked = useCallback((dateStr) => {
        if (!dateStr) return true;
        if (dateStr === currentDate) return false;
        const month = getMonthFromDate(dateStr);
        return data[month]?.days[dateStr]?.locked || dateStr < currentDate;
    }, [data, currentDate]);

    // ============================================
    // EXPORT
    // ============================================

    const exportJSON = useCallback(() => {
        try {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `productivity-export-${getTodayDate()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            // Silent fail
        }
    }, [data]);

    const exportCSV = useCallback(() => {
        try {
            let csv = 'Date,Task,Category,Completed,Progress\n';
            Object.entries(data).forEach(([month, monthData]) => {
                if (!monthData?.days) return;
                Object.entries(monthData.days).forEach(([date, dayData]) => {
                    if (!dayData?.tasks) return;
                    dayData.tasks.forEach(task => {
                        if (!task) return;
                        csv += `${date},"${task.name || ''}",${task.category || 'other'},${task.completed},${dayData.progress}%\n`;
                    });
                });
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `productivity-export-${getTodayDate()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            // Silent fail
        }
    }, [data]);

    // ============================================
    // CONTEXT VALUE
    // ============================================

    const value = useMemo(() => ({
        // Core State (Canonical time - actual current)
        data,
        currentDate,
        currentMonth,
        currentYear,
        currentTime,

        // View State (What user is looking at - can be any date)
        viewYear,
        viewMonth,
        viewDate,
        selectedDate, // Legacy alias for viewDate

        // View State Controls
        activeView,
        showMonthSetup,
        isLoading,
        isDataReady,

        // Unified Navigation Functions
        navigateToYear,
        navigateToMonth,
        selectDate,
        resetToToday,

        // Legacy Setters (for backward compatibility)
        setSelectedDate,
        setCurrentMonth,
        setActiveView,
        setShowMonthSetup,

        // Task Operations
        addTask,
        toggleTask,
        editTask,
        deleteTask,

        // Goal Operations
        goals,
        addGoal,
        updateGoal,
        deleteGoal: deleteGoal,
        updateGoalProgress,
        setGoalProgress,
        activeGoals,
        completedGoals,
        expiredGoals,
        getGoalProgress,
        getDaysRemaining,
        showGoalModal,
        setShowGoalModal,
        editingGoal,
        setEditingGoal,

        // Monthly Setup
        setMonthlyGoals,
        setRoutineTasks,
        skipMonthSetup,

        // Derived Analytics (Real-time)
        calculateStreak,
        todayProgress,
        monthProgress,
        todayTasks,
        completedToday,
        categoryBreakdown,
        weeklyProgress,
        heatmapData,

        // Getters
        getSelectedDayData,
        getTodayData,
        getCurrentMonthData,
        getDayData,
        getMonthData,
        getAllMonths,
        isToday,
        isLocked,
        lockDay,

        // Export
        exportJSON,
        exportCSV,

        // Constants
        CATEGORIES,
        GOAL_PROGRESS_TYPES,
        formatDisplayDate
    }), [
        data, currentDate, currentMonth, currentYear, currentTime,
        viewYear, viewMonth, viewDate, selectedDate, activeView,
        showMonthSetup, isLoading, isDataReady,
        navigateToYear, navigateToMonth, selectDate, resetToToday,
        addTask, toggleTask, editTask, deleteTask,
        goals, addGoal, updateGoal, deleteGoal, updateGoalProgress, setGoalProgress,
        activeGoals, completedGoals, expiredGoals, getGoalProgress, getDaysRemaining,
        showGoalModal, editingGoal,
        setMonthlyGoals, setRoutineTasks, skipMonthSetup,
        calculateStreak, todayProgress, monthProgress, todayTasks,
        completedToday, categoryBreakdown, weeklyProgress, heatmapData,
        getSelectedDayData, getTodayData, getCurrentMonthData,
        getDayData, getMonthData, getAllMonths, isToday, isLocked, lockDay,
        exportJSON, exportCSV, setActiveView
    ]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}

export default AppContext;
