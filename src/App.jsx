import { useUser } from "./context/UserContext";
import Auth from "./components/Auth";
import AppLayout from "./components/AppLayout";

export default function App() {
    const { user, loading } = useUser();

    if (loading) return null;

    return user ? <AppLayout /> : <Auth />;
}
