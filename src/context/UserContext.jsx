import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user || null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user || null);

                // Redirect to dashboard after OAuth login
                if (event === "SIGNED_IN") {
                    window.location.href = "/";
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    return (
        <UserContext.Provider value={{ user, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
