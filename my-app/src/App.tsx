import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from './store';
import { restoreUserSessionAsync } from './slices/userSlice';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { RoutesPage } from './pages/RoutesPage';
import { RouteDetailsPage } from './pages/RouteDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { RequestsPage } from './pages/RequestsPage';
import { RequestDetailsPage } from './pages/RequestDetailsPage';
import { ROUTES } from './routes';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Восстанавливаем сессию пользователя при загрузке приложения
    dispatch(restoreUserSessionAsync());
  }, [dispatch]);

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.ROUTES} element={<RoutesPage />} />
          <Route path={ROUTES.ROUTE_DETAILS} element={<RouteDetailsPage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.REQUESTS} element={<RequestsPage />} />
          <Route path={ROUTES.REQUEST_DETAILS} element={<RequestDetailsPage />} />
          {/* Удали маршрут для DRAFT, т.к. черновики теперь открываются через REQUEST_DETAILS */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;