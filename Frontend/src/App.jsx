import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { homePathFor, useAuth } from './auth.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Team from './pages/Team.jsx';
import WorkshopDetail from './pages/WorkshopDetail.jsx';
import Workshops from './pages/Workshops.jsx';

function RequireAuth() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequireAbility({ ability, children }) {
  const { user, can } = useAuth();
  return can[ability] ? children : <Navigate to={homePathFor(user.role)} replace />;
}

function Home() {
  const { user } = useAuth();
  return <Navigate to={homePathFor(user.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="workshops" element={<RequireAbility ability="viewWorkshops"><Workshops /></RequireAbility>} />
          <Route path="workshops/:id" element={<RequireAbility ability="viewWorkshops"><WorkshopDetail /></RequireAbility>} />
          <Route path="team" element={<RequireAbility ability="manageUsers"><Team /></RequireAbility>} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
