import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';

// Planning pages
import AllTasks from './pages/planning/AllTasks';
import DailyTasks from './pages/planning/DailyTasks';
import AddTask from './pages/planning/AddTask';
import TaskTreeView from './pages/planning/TaskTreeView';
import TaskConfiguration from './pages/planning/TaskConfiguration';

// Observations pages
import CurrentObservations from './pages/observations/CurrentObservations';
import ObservationsWaiting from './pages/observations/ObservationsWaiting';
import AllObservations from './pages/observations/AllObservations';
import ObservationsAnalysis from './pages/observations/ObservationsAnalysis';

// Diamond System pages
import DiamondDiagram from './pages/diamond/DiamondDiagram';
import AddEntity from './pages/diamond/AddEntity';
import AllEntities from './pages/diamond/AllEntities';

// Settings pages
import ColorSettings from './pages/settings/ColorSettings';
import EmergencySettings from './pages/settings/EmergencySettings';

import { ROUTES } from './config/routes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          
          {/* Planning routes */}
          <Route path={ROUTES.PLANNING.ALL_TASKS} element={<AllTasks />} />
          <Route path={ROUTES.PLANNING.DAILY_TASKS} element={<DailyTasks />} />
          <Route path={ROUTES.PLANNING.ADD_TASK} element={<AddTask />} />
          <Route path={ROUTES.PLANNING.TASK_TREE} element={<TaskTreeView />} />
          <Route path={ROUTES.PLANNING.TASK_CONFIGURATION} element={<TaskConfiguration />} />
          
          {/* Observations routes */}
          <Route path={ROUTES.OBSERVATIONS.CURRENT} element={<CurrentObservations />} />
          <Route path={ROUTES.OBSERVATIONS.WAITING_FOR_ANALYSIS} element={<ObservationsWaiting />} />
          <Route path={ROUTES.OBSERVATIONS.ALL} element={<AllObservations />} />
          <Route path={ROUTES.OBSERVATIONS.ANALYSIS} element={<ObservationsAnalysis />} />
          
          {/* Diamond System routes */}
          <Route path={ROUTES.DIAMOND.DIAGRAM} element={<DiamondDiagram />} />
          <Route path={ROUTES.DIAMOND.ADD_ENTITY} element={<AddEntity />} />
          <Route path={ROUTES.DIAMOND.ALL_ENTITIES} element={<AllEntities />} />
          
          {/* Settings routes */}
          <Route path={ROUTES.SETTINGS.COLOR} element={<ColorSettings />} />
          <Route path={ROUTES.SETTINGS.EMERGENCY} element={<EmergencySettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
