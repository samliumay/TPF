import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.scss'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { PlanningProvider } from './features/planing/PlanningContext'
import { ObservationsProvider } from './features/observations/ObservationsContext'
import { DiamondProvider } from './features/diamond/DiamondContext'
import { ThemeProvider } from './contexts/ThemeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <PlanningProvider>
          <ObservationsProvider>
            <DiamondProvider>
              <App />
            </DiamondProvider>
          </ObservationsProvider>
        </PlanningProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
