import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { Route } from '../types/types';
import { getRouteById } from '../api/api';
import styles from './RouteDetails.module.css';

export const RouteDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [route, setRoute] = useState<Route | null>(null);

  useEffect(() => {
    if (id) {
      const fetchRoute = async () => {
        const routeData = await getRouteById(parseInt(id));
        setRoute(routeData);
      };
      fetchRoute();
    }
  }, [id]);

  if (!route) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className={styles.mainSpace}>
      <div className={styles.card}>
        <div className={styles.cardInfo}>
          <h1>{route.Title}</h1>
          <h2>О перевозке</h2>
          <h3>{route.Description}</h3>
          <h2>Расстояние</h2>
          <h3>{route.Distance} km</h3>
        </div>
        <img 
          className={styles.cardImg} 
          src={route.ImageURL} 
          alt={`route${route.RouteID}`}
        />
      </div>
    </div>
  );
};