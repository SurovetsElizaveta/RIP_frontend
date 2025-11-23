import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { RoutesPage } from './pages/RoutesPage';
import { RouteDetailsPage } from './pages/RouteDetailsPage';
import { ROUTES } from './routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import { invoke } from "@tauri-apps/api/core";
import { useEffect } from 'react';
import { dest_root } from "../target_config";

function App() {
  useEffect(()=>{
    invoke('tauri', {cmd:'create'})
      .then(() =>{console.log("Tauri launched")})
      .catch(() =>{console.log("Tauri not launched")})
    return () =>{
      invoke('tauri', {cmd:'close'})
        .then(() =>{console.log("Tauri launched")})
        .catch(() =>{console.log("Tauri not launched")})
    }
  }, [])

  return (
    <Router basename={dest_root}>
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