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

const getTodayDate = () => new Date().toISOString().split('T')[0];
const getCurrentMonth = () => getTodayDate().slice(0, 7);
const getMonthFromDate = (dateStr) => dateStr.slice(0, 7);

const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
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
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
};

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// ============================================
// PROVIDER COMPONENT
// ============================================

export function AppProvider({ children }) {
    // Core state
    const [data, setData] = useState({});
    const [currentDate, setCurrentDate] = useState(getTodayDate());
    const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [activeView, setActiveViewState] = useState(() => {
        // Load persisted view from localStorage
        const saved = localStorage.getItem('activeView');
        return saved || 'dashboard';
    });
    const [showMonthSetup, setShowMonthSetup] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Wrapper to persist activeView changes
    const setActiveView = useCallback((view) => {
        setActiveViewState(view);
        localStorage.setItem('activeView', view);
    }, []);

    // Goal state (independent of daily tasks)
    const [goals, setGoals] = useState([]);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);

    // Real-time clock state
    const [currentTime, setCurrentTime] = useState(new Date());
    const midnightTimeoutRef = useRef(null);
    const clockIntervalRef = useRef(null);

    // ============================================
    // REAL-TIME CLOCK (Updates every second)
    // ============================================

    useEffect(() => {
        const updateClock = () => setCurrentTime(new Date());
        clockIntervalRef.current = setInterval(updateClock, 1000);
        return () => clearInterval(clockIntervalRef.current);
    }, []);

    // ============================================
    // DATA PERSISTENCE
    // ============================================

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setData(parsed);
            }
            // Load goals separately
            const savedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
            if (savedGoals) {
                setGoals(JSON.parse(savedGoals));
            }
        } catch (e) {
            console.error('Failed to load data:', e);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!isLoading && Object.keys(data).length > 0) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            } catch (e) {
                console.error('Failed to save data:', e);
            }
        }
    }, [data, isLoading]);

    // Persist goals independently
    useEffect(() => {
        if (!isLoading) {
            try {
                localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
            } catch (e) {
                console.error('Failed to save goals:', e);
            }
        }
    }, [goals, isLoading]);

    // ============================================
    // DAY/MONTH INITIALIZATION
    // ============================================

    useEffect(() => {
        if (isLoading) return;

        setData(prev => {
            const newData = deepClone(prev);

            if (!newData[currentMonth]) {
                newData[currentMonth] = initMonthData();
            }

            if (!newData[currentMonth].days[currentDate]) {
                newData[currentMonth].days[currentDate] = initDayData();

                const routines = newData[currentMonth].routines || [];
                routines.forEach(routine => {
                    newData[currentMonth].days[currentDate].tasks.push({
                        id: Date.now() + Math.random(),
                        name: routine.name,
                        category: routine.category || 'other',
                        completed: false,
                        createdAt: new Date().toISOString(),
                        isRoutine: true
                    });
                });
            }

            return newData;
        });

        // Auto-show Month Setup only on the 1st day of a new month
        const dayOfMonth = new Date(currentDate).getDate();
        const isFirstDayOfMonth = dayOfMonth === 1;
        const monthData = data[currentMonth];

        if (monthData && !monthData.setupComplete) {
            if (isFirstDayOfMonth) {
                // On the 1st, auto-show the modal
                setShowMonthSetup(true);
            }
            // Note: Notification is added when skipMonthSetup is called
        }
    }, [currentMonth, currentDate, isLoading, data]);

    // ============================================
    // MIDNIGHT LOCK SYSTEM
    // ============================================

    const lockDay = useCallback((dateStr) => {
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
        const prevDate = currentDate;
        lockDay(prevDate);

        const newDate = getTodayDate();
        const newMonth = getCurrentMonth();

        setCurrentDate(newDate);
        setCurrentMonth(newMonth);
        setSelectedDate(newDate);

        console.log(`[Midnight] Locked ${prevDate}, transitioned to ${newDate}`);
    }, [currentDate, lockDay]);

    useEffect(() => {
        const scheduleMidnight = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const msUntilMidnight = midnight.getTime() - now.getTime();

            console.log(`[Scheduler] Midnight in ${Math.round(msUntilMidnight / 60000)} minutes`);

            midnightTimeoutRef.current = setTimeout(() => {
                handleMidnight();
                scheduleMidnight();
            }, msUntilMidnight);
        };

        scheduleMidnight();
        return () => clearTimeout(midnightTimeoutRef.current);
    }, [handleMidnight]);

    // ============================================
    // TASK OPERATIONS (Unified)
    // ============================================

    const addTask = useCallback((taskName, category = 'other', targetDate = null) => {
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
        setData(prev => {
            const newData = deepClone(prev);
            if (!newData[currentMonth]) newData[currentMonth] = initMonthData();
            newData[currentMonth].goals = goals;
            return newData;
        });
    }, [currentMonth]);

    const setRoutineTasks = useCallback((routines) => {
        setData(prev => {
            const newData = deepClone(prev);
            if (!newData[currentMonth]) newData[currentMonth] = initMonthData();

            newData[currentMonth].routines = routines;
            newData[currentMonth].setupComplete = true;

            const today = newData[currentMonth].days[currentDate];
            if (today && !today.locked) {
                routines.forEach(routine => {
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
        const newGoal = {
            id: Date.now(),
            title: goalData.title,
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
        setGoals(prev => prev.map(g =>
            g.id === goalId ? { ...g, ...updates } : g
        ));
        setEditingGoal(null);
    }, []);

    const deleteGoal = useCallback((goalId) => {
        setGoals(prev => prev.filter(g => g.id !== goalId));
    }, []);

    const updateGoalProgress = useCallback((goalId, amount) => {
        setGoals(prev => prev.map(g => {
            if (g.id !== goalId) return g;
            const newProgress = Math.min(g.progressTarget, Math.max(0, g.progressCurrent + amount));
            const newState = newProgress >= g.progressTarget ? 'completed' : g.state;
            return { ...g, progressCurrent: newProgress, state: newState };
        }));
    }, []);

    const setGoalProgress = useCallback((goalId, value) => {
        setGoals(prev => prev.map(g => {
            if (g.id !== goalId) return g;
            const newProgress = Math.min(g.progressTarget, Math.max(0, value));
            const newState = newProgress >= g.progressTarget ? 'completed' : g.state;
            return { ...g, progressCurrent: newProgress, state: newState };
        }));
    }, []);

    // Auto-expire goals past their end date
    useEffect(() => {
        if (isLoading) return;
        const today = getTodayDate();
        setGoals(prev => prev.map(g => {
            if (g.state === 'active' && g.endDate < today) {
                return { ...g, state: 'expired' };
            }
            return g;
        }));
    }, [currentDate, isLoading]);

    // Derived goal values
    const activeGoals = useMemo(() => {
        return goals.filter(g => g.state === 'active');
    }, [goals]);

    const completedGoals = useMemo(() => {
        return goals.filter(g => g.state === 'completed');
    }, [goals]);

    const expiredGoals = useMemo(() => {
        return goals.filter(g => g.state === 'expired');
    }, [goals]);

    const getGoalProgress = useCallback((goal) => {
        if (goal.progressType === 'percentage') {
            return Math.round((goal.progressCurrent / goal.progressTarget) * 100);
        }
        return goal.progressCurrent;
    }, []);

    const getDaysRemaining = useCallback((goal) => {
        const today = new Date(getTodayDate());
        const end = new Date(goal.endDate);
        const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    }, []);

    // ============================================
    // DERIVED ANALYTICS (Memoized)
    // ============================================

    const calculateStreak = useMemo(() => {
        let streak = 0;
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
        const daysWithTasks = days.filter(d => d.tasks.length > 0);
        if (daysWithTasks.length === 0) return 0;

        const total = daysWithTasks.reduce((sum, d) => sum + (d.progress || 0), 0);
        return Math.round(total / daysWithTasks.length);
    }, [data, currentMonth]);

    const todayTasks = useMemo(() => {
        return data[currentMonth]?.days[currentDate]?.tasks || [];
    }, [data, currentMonth, currentDate]);

    const completedToday = useMemo(() => {
        return todayTasks.filter(t => t.completed).length;
    }, [todayTasks]);

    const categoryBreakdown = useMemo(() => {
        const breakdown = {};
        CATEGORIES.forEach(c => breakdown[c] = { total: 0, completed: 0 });

        Object.values(data).forEach(monthData => {
            if (!monthData.days) return;
            Object.values(monthData.days).forEach(dayData => {
                dayData.tasks.forEach(task => {
                    const cat = task.category || 'other';
                    if (breakdown[cat]) {
                        breakdown[cat].total++;
                        if (task.completed) breakdown[cat].completed++;
                    }
                });
            });
        });

        return breakdown;
    }, [data]);

    const weeklyProgress = useMemo(() => {
        const result = [];
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
                completed: dayData?.tasks?.filter(t => t.completed).length || 0
            });
        }
        return result;
    }, [data]);

    const heatmapData = useMemo(() => {
        const result = {};
        Object.entries(data).forEach(([month, monthData]) => {
            if (!monthData.days) return;
            Object.entries(monthData.days).forEach(([date, dayData]) => {
                result[date] = {
                    progress: dayData.progress || 0,
                    tasks: dayData.tasks?.length || 0,
                    completed: dayData.tasks?.filter(t => t.completed).length || 0,
                    locked: dayData.locked || false
                };
            });
        });
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
        const month = getMonthFromDate(dateStr);
        return data[month]?.days[dateStr] || initDayData();
    }, [data]);

    const getMonthData = useCallback((monthStr) => {
        return data[monthStr] || initMonthData();
    }, [data]);

    const getAllMonths = useCallback(() => {
        return Object.keys(data)
            .filter(k => k.match(/^\d{4}-\d{2}$/))
            .sort()
            .reverse();
    }, [data]);

    const isToday = useCallback((dateStr) => dateStr === currentDate, [currentDate]);

    const isLocked = useCallback((dateStr) => {
        if (dateStr === currentDate) return false;
        const month = getMonthFromDate(dateStr);
        return data[month]?.days[dateStr]?.locked || dateStr < currentDate;
    }, [data, currentDate]);

    // ============================================
    // EXPORT
    // ============================================

    const exportJSON = useCallback(() => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `productivity-export-${getTodayDate()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [data]);

    const exportCSV = useCallback(() => {
        let csv = 'Date,Task,Category,Completed,Progress\n';
        Object.entries(data).forEach(([month, monthData]) => {
            if (!monthData.days) return;
            Object.entries(monthData.days).forEach(([date, dayData]) => {
                dayData.tasks.forEach(task => {
                    csv += `${date},"${task.name}",${task.category},${task.completed},${dayData.progress}%\n`;
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
    }, [data]);

    // ============================================
    // CONTEXT VALUE
    // ============================================

    const value = useMemo(() => ({
        // Core State
        data,
        currentDate,
        currentMonth,
        selectedDate,
        activeView,
        showMonthSetup,
        isLoading,
        currentTime,

        // Setters
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
        data, currentDate, currentMonth, selectedDate, activeView,
        showMonthSetup, isLoading, currentTime,
        addTask, toggleTask, editTask, deleteTask,
        goals, addGoal, updateGoal, deleteGoal, updateGoalProgress, setGoalProgress,
        activeGoals, completedGoals, expiredGoals, getGoalProgress, getDaysRemaining,
        showGoalModal, editingGoal,
        setMonthlyGoals, setRoutineTasks, skipMonthSetup,
        calculateStreak, todayProgress, monthProgress, todayTasks,
        completedToday, categoryBreakdown, weeklyProgress, heatmapData,
        getSelectedDayData, getTodayData, getCurrentMonthData,
        getDayData, getMonthData, getAllMonths, isToday, isLocked, lockDay,
        exportJSON, exportCSV
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
