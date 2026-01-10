/**
 * BootContext.jsx - Application Boot Sequence Orchestrator
 * 
 * Manages a deterministic, staged initialization pipeline.
 * Ensures all critical data loads before UI renders.
 * 
 * Boot States:
 * - "booting" - Initial state, loading persistent data
 * - "ready" - All critical data loaded, UI can render
 * - "error" - Boot failed, showing fallback UI
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

const BootContext = createContext(null);

const BOOT_STATES = {
    BOOTING: 'booting',
    READY: 'ready',
    ERROR: 'error'
};

const BOOT_TIMEOUT = 10000; // 10 seconds max boot time

export function BootProvider({ children }) {
    const [bootState, setBootState] = useState(BOOT_STATES.BOOTING);
    const [bootError, setBootError] = useState(null);
    const [subsystems, setSubsystems] = useState({
        user: false,
        data: false,
        preferences: false,
        datetime: false
    });

    const bootTimeoutRef = useRef(null);
    const hasBootedRef = useRef(false);

    // Mark a subsystem as ready
    const markSubsystemReady = useCallback((subsystem) => {
        setSubsystems(prev => {
            if (prev[subsystem]) return prev; // Already marked
            return { ...prev, [subsystem]: true };
        });
    }, []);

    // Check if all subsystems are ready
    const allSubsystemsReady = useMemo(() => {
        return Object.values(subsystems).every(Boolean);
    }, [subsystems]);

    // Initialize datetime immediately (synchronous)
    useEffect(() => {
        // Date/time can be resolved immediately
        const now = new Date();
        if (now instanceof Date && !isNaN(now)) {
            markSubsystemReady('datetime');
        }
    }, [markSubsystemReady]);

    // Transition to ready when all subsystems complete
    useEffect(() => {
        if (allSubsystemsReady && bootState === BOOT_STATES.BOOTING) {
            // Small delay to ensure smooth transition
            const readyTimeout = setTimeout(() => {
                if (!hasBootedRef.current) {
                    hasBootedRef.current = true;
                    setBootState(BOOT_STATES.READY);
                }
            }, 50);
            return () => clearTimeout(readyTimeout);
        }
    }, [allSubsystemsReady, bootState]);

    // Boot timeout - force ready after timeout to prevent infinite loading
    useEffect(() => {
        bootTimeoutRef.current = setTimeout(() => {
            if (bootState === BOOT_STATES.BOOTING && !hasBootedRef.current) {
                hasBootedRef.current = true;
                setBootState(BOOT_STATES.READY);
            }
        }, BOOT_TIMEOUT);

        return () => {
            if (bootTimeoutRef.current) {
                clearTimeout(bootTimeoutRef.current);
            }
        };
    }, [bootState]);

    // Force ready (escape hatch)
    const forceReady = useCallback(() => {
        if (!hasBootedRef.current) {
            hasBootedRef.current = true;
            setBootState(BOOT_STATES.READY);
        }
    }, []);

    // Handle boot error
    const handleBootError = useCallback((error) => {
        setBootError(error);
        // Don't block on errors - still transition to ready
        // Components will handle their own error states
        forceReady();
    }, [forceReady]);

    const value = useMemo(() => ({
        bootState,
        bootError,
        isBooting: bootState === BOOT_STATES.BOOTING,
        isReady: bootState === BOOT_STATES.READY,
        isError: bootState === BOOT_STATES.ERROR,
        subsystems,
        markSubsystemReady,
        forceReady,
        handleBootError,
        BOOT_STATES
    }), [
        bootState,
        bootError,
        subsystems,
        markSubsystemReady,
        forceReady,
        handleBootError
    ]);

    return (
        <BootContext.Provider value={value}>
            {children}
        </BootContext.Provider>
    );
}

export function useBoot() {
    const context = useContext(BootContext);
    if (!context) {
        throw new Error('useBoot must be used within BootProvider');
    }
    return context;
}

// Hook for subsystems to signal readiness
export function useBootSignal(subsystemName) {
    const { markSubsystemReady } = useBoot();

    const signalReady = useCallback(() => {
        markSubsystemReady(subsystemName);
    }, [markSubsystemReady, subsystemName]);

    return signalReady;
}

export default BootContext;
