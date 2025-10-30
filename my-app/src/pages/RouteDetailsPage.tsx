import { Container, Row, Col, Card } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { Route } from '../types/types';
import { getRouteById } from '../api/api';
import styles from './RouteDetails.module.css';
import { BreadCrumbs } from '../components/BreadCrumbs';

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

  const breadcrumbs = [
    { label: 'Маршруты', path: '/routes' },
    { label: route ? route.Title : 'Загрузка...' }
  ];

  return (
    <Container className={styles['mainSpace']}>
      <BreadCrumbs crumbs={breadcrumbs} />
      <Card className={styles['card']}>
        <Row className="g-0 h-100">
          <Col md={7}>
            <Card.Body className={styles['cardInfo']}>
              <Card.Title as="h1" className="mb-4">{route.Title}</Card.Title>
              
              <Card.Subtitle as="h2" className="mb-2">О перевозке</Card.Subtitle>
              <Card.Text as="p" className="mb-4">{route.Description}</Card.Text>
              
              <Card.Subtitle as="h2" className="mb-2">Расстояние</Card.Subtitle>
              <Card.Text as="p" className="mb-0">{route.Distance} km</Card.Text>
            </Card.Body>
          </Col>
          <Col md={5}>
            <Card.Img 
              className={styles['cardImg']}
              src={route.ImageURL} 
              alt={`route${route.RouteID}`}
            />
          </Col>
        </Row>
      </Card>
    </Container>
  );
};