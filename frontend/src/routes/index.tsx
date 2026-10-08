import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { useSession } from '../utils/session';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Infrastructure from '../pages/Infrastructure';
import Predictions from '../pages/Predictions';
import PredictionDetail from '../pages/PredictionDetail';
import Incidents from '../pages/Incidents';
import IncidentDetail from '../pages/IncidentDetail';
import Recovery from '../pages/Recovery';
import RecoveryDetail from '../pages/RecoveryDetail';
import Experiments from '../pages/Experiments';
import ExperimentDetail from '../pages/ExperimentDetail';
import Metrics from '../pages/Metrics';
import Settings from '../pages/Settings';
import Help from '../pages/Help';
import Notifications from '../pages/Notifications';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';

function Protected({ children }: { children: JSX.Element }) {
  const { authed } = useSession();
  const loc = useLocation();
  if (!authed) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected><AppLayout /></Protected>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/infrastructure" element={<Infrastructure />} />
        <Route path="/predictions" element={<Predictions />} />
        <Route path="/predictions/:id" element={<PredictionDetail />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/incidents/:id" element={<IncidentDetail />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/recovery/:id" element={<RecoveryDetail />} />
        <Route path="/experiments" element={<Experiments />} />
        <Route path="/experiments/:id" element={<ExperimentDetail />} />
        <Route path="/metrics" element={<Metrics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
