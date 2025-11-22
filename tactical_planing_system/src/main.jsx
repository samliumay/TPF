import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PlanningProvider } from './features/planing/PlanningContext'
import { ObservationsProvider } from './features/observations/ObservationsContext'
import { DiamondProvider } from './features/diamond/DiamondContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PlanningProvider>
      <ObservationsProvider>
        <DiamondProvider>
          <App />
        </DiamondProvider>
      </ObservationsProvider>
    </PlanningProvider>
  </StrictMode>,
)
