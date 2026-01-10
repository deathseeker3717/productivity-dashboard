import { useEffect } from "react";
import { useUser } from "./context/UserContext";
import { useApp } from "./context/AppContext";
import { useBoot } from "./context/BootContext";
import Auth from "./components/Auth";
import AppLayout from "./components/AppLayout";
import { SkeletonAppLayout } from "./components/SkeletonUI";

export default function App() {
    const { user, loading: userLoading, isInitialized: userInitialized } = useUser();
    const { isLoading: dataLoading, isDataReady } = useApp();
    const { isReady, markSubsystemReady } = useBoot();

    // Signal boot readiness when subsystems are ready
    useEffect(() => {
        if (userInitialized) {
            markSubsystemReady('user');
        }
    }, [userInitialized, markSubsystemReady]);

    useEffect(() => {
        if (isDataReady) {
            markSubsystemReady('data');
        }
    }, [isDataReady, markSubsystemReady]);

    useEffect(() => {
        // Preferences are initialized synchronously, mark as ready
        markSubsystemReady('preferences');
    }, [markSubsystemReady]);

    // Show skeleton during boot sequence
    if (!isReady || userLoading || dataLoading) {
        return <SkeletonAppLayout />;
    }

    // Show auth or app based on user state
    return (
        <div className="app-root boot-ready">
            {user ? <AppLayout /> : <Auth />}
        </div>
    );
}
