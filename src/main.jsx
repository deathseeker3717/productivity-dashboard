import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './design-system.css'
import { BootProvider } from './context/BootContext.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { PreferencesProvider } from './context/PreferencesContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BootProvider>
            <AppProvider>
                <UserProvider>
                    <PreferencesProvider>
                        <App />
                    </PreferencesProvider>
                </UserProvider>
            </AppProvider>
        </BootProvider>
    </React.StrictMode>,
)
