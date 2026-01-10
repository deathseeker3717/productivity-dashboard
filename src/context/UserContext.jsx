import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../supabase";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const isInitialBootRef = useRef(true);

    useEffect(() => {
        let isMounted = true;

        supabase.auth.getSession().then(({ data }) => {
            if (isMounted) {
                setUser(data.session?.user || null);
                setLoading(false);
                setIsInitialized(true);
            }
        }).catch(() => {
            // Gracefully handle auth errors
            if (isMounted) {
                setUser(null);
                setLoading(false);
                setIsInitialized(true);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (!isMounted) return;

                setUser(session?.user || null);

                // Only redirect after initial boot is complete
                if (event === "SIGNED_IN" && !isInitialBootRef.current) {
                    window.location.href = "/";
                }

                // Mark initial boot as complete after first auth state
                isInitialBootRef.current = false;
            }
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, isInitialized }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
