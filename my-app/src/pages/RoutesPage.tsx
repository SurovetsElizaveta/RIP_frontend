import { useEffect, useState, type FormEvent } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import type { Route } from '../types/types';
import { RouteCard } from '../components/RouteCard';
import { RequestLink } from '../components/RequestLink';
import { getRoutes } from '../api/api';
import { useSearchParams } from 'react-router-dom';
import styles from './Routes.module.css'; // Если будете использовать CSS Modules

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
    <Container fluid className="p-0">
      <RequestLink />
      <Container className={styles['main-space']}>
        <Row className="justify-content-center mb-4">
          <Col xs={12} lg={10}>
            <Card className="shadow-sm">
              <Card.Body>
                <Form onSubmit={handleSubmit} className={styles['distance-filter-bar']}>
                  <Row className="align-items-center justify-content-center g-3">
                    <Col xs="auto">
                      <Form.Label className="mb-0 fw-semibold">Расстояние от</Form.Label>
                    </Col>
                    <Col xs="auto">
                      <Form.Control
                        className={styles['distance-filter-input']}
                        type="number"
                        name="min_distance"
                        value={minDistance}
                        onChange={handleInputChange(setMinDistance)}
                        min="0"
                        placeholder="0"
                      />
                    </Col>
                    <Col xs="auto">
                      <Form.Label className="mb-0 fw-semibold">до</Form.Label>
                    </Col>
                    <Col xs="auto">
                      <Form.Control
                        className={styles['distance-filter-input']}
                        type="number"
                        name="max_distance"
                        value={maxDistance}
                        onChange={handleInputChange(setMaxDistance)}
                        min="0"
                        placeholder="100"
                      />
                    </Col>
                    <Col xs="auto">
                      <Button 
                        type="submit" 
                        className={styles['distance-filter-btn']}
                        variant="primary"
                      >
                        Применить
                      </Button>
                    </Col>
                    <Col xs="auto">
                      <Button 
                        type="button" 
                        className={styles['distance-filter-btn']}
                        onClick={handleReset}
                        variant="outline-secondary"
                      >
                        Сбросить
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
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