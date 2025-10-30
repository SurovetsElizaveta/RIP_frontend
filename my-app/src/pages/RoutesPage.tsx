import { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import type { Route } from '../types/types';
import { RouteCard } from '../components/RouteCard';
import { RequestLink } from '../components/RequestLink';
import { FilterBar } from '../components/FilterBar';
import { getRoutes } from '../api/api';
import { useSearchParams } from 'react-router-dom';
import styles from './Routes.module.css';

export const RoutesPage = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const fetchRoutes = async () => {
      const min = searchParams.get('min_distance');
      const max = searchParams.get('max_distance');
      
      const minNum = min ? parseInt(min, 10) : undefined;
      const maxNum = max ? parseInt(max, 10) : undefined;
      
      const routesData = await getRoutes(minNum, maxNum);
      setRoutes(routesData);
    };
    
    fetchRoutes();
  }, [searchParams]);

  return (
    <Container fluid className="p-0">
      <RequestLink />
      <Container className={`${styles['main-space']} pt-5`}>
        <FilterBar />
        <Row className={styles['cards']}>
          {routes.map(route => (
            <Col key={route.RouteID} xs={12} sm={6} lg={4} xl={3} className="mb-4">
              <RouteCard route={route} />
            </Col>
          ))}
        </Row>
      </Container>
    </Container>
  );
};