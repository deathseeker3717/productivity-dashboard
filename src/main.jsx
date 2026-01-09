import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './design-system.css'
import { AppProvider } from './context/AppContext.jsx'
import { UserProvider } from './context/UserContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AppProvider>
            <UserProvider>
                <App />
            </UserProvider>
        </AppProvider>
    </React.StrictMode>,
)

