import { useEffect, useState, type FormEvent } from 'react';
import type { Route } from '../types/types';
import { RouteCard } from '../components/RouteCard';
import { RequestLink } from '../components/RequestLink';
import { getRoutes } from '../api/api';
import './Routes.css';
import { useSearchParams } from 'react-router-dom';

export const RoutesPage = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [minDistance, setMinDistance] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams();
  
  useEffect(() => {
    const min = searchParams.get('min_distance');
    const max = searchParams.get('max_distance');
    
    if (min) setMinDistance(min);
    if (max) setMaxDistance(max);
  }, []);

  useEffect(() => {
    const fetchRoutes = async () => {
      const min = minDistance ? parseInt(minDistance, 10) : undefined;
      const max = maxDistance ? parseInt(maxDistance, 10) : undefined;
      
      const routesData = await getRoutes(min, max);
      setRoutes(routesData);
    };
    
    fetchRoutes();
  }, [searchParams]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const min = minDistance ? parseInt(minDistance, 10) : undefined;
    const max = maxDistance ? parseInt(maxDistance, 10) : undefined;
    
    const newParams = new URLSearchParams();
    if (min) newParams.append('min_distance', min.toString());
    if (max) newParams.append('max_distance', max.toString());
    
    setSearchParams(newParams);
  };

  const handleReset = () => {
    setMinDistance('');
    setMaxDistance('');
    setSearchParams(new URLSearchParams());
  };

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/^0+/, '') || '';
    setter(value);
  };

  return (
    <div>
      <RequestLink />
      <div className="main-space">
        <div className="filter-and-request">
          <form className="distance-filter-bar" onSubmit={handleSubmit}>
            <h4>Расстояние от</h4>
            <input 
              className="distance-filter-input" 
              type="number" 
              name="min_distance" 
              value={minDistance}
              onChange={handleInputChange(setMinDistance)}
              min="0"
            />
            <h4>до</h4>
            <input 
              className="distance-filter-input" 
              type="number" 
              name="max_distance" 
              value={maxDistance}
              onChange={handleInputChange(setMaxDistance)}
              min="0"
            />
            <button className="distance-filter-btn" type="submit">
              Применить
            </button>
            <button 
              type="button" 
              className="distance-filter-btn" 
              onClick={handleReset}
            >
              Сбросить
            </button>
          </form>
        </div>
        <div className="cards">
          {routes.map(route => (
            <RouteCard 
              key={route.RouteID} 
              route={route} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};