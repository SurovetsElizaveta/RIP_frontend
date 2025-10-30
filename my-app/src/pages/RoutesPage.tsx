import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import type { Route } from '../types/types';
import { RouteCard } from '../components/RouteCard';
import { RequestLink } from '../components/RequestLink';
import { FilterBar } from '../components/FilterBar';
import { getRoutes } from '../api/api';
import { useSearchParams } from 'react-router-dom';
import styles from './Routes.module.css';
import { BreadCrumbs } from '../components/BreadCrumbs';

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

  const breadcrumbs = [
    { label: 'Маршруты', path: '/routes' }
  ];

  return (
    <Container fluid className="p-0">
      <RequestLink />
      <Container className={`${styles['main-space']} pt-5`}>
        <Row className="justify-content-center mb-4">
          <Col xs={12} className="d-flex justify-content-center">
            <FilterBar />
          </Col>
        </Row>
        <BreadCrumbs crumbs={breadcrumbs} />
        <Row className="g-3">
          {routes.map(route => (
            <Col key={route.RouteID} xs={12} sm={6} md={6} lg={4} xl={3} className={styles['custom-col']}>
              <RouteCard route={route} />
            </Col>
          ))}
        </Row>
      </Container>
    </Container>
  );
};