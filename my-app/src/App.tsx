import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { RoutesPage } from './pages/RoutesPage';
import { RouteDetailsPage } from './pages/RouteDetailsPage';
import { ROUTES } from './routes';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router basename="/RIP_frontend">
      <div className="App">
        <Header />
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.ROUTES} element={<RoutesPage />} />
          <Route path={ROUTES.ROUTE_DETAILS} element={<RouteDetailsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;