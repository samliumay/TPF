import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import DailyPlan from './pages/DailyPlan';
import Observations from './pages/Observations';
import DiamondSystem from './pages/DiamondSystem';
import Settings from './pages/Settings';
import { ROUTES } from './config/routes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path={ROUTES.DAILY_PLAN} element={<DailyPlan />} />
          <Route path={ROUTES.OBSERVATION_INPUT} element={<Observations />} />
          <Route path={ROUTES.DIAMOND_VIEW} element={<DiamondSystem />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
