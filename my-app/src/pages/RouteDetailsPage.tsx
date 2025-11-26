import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './RouteDetails.module.css';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchRouteById } from '../slices/routesSlice';

export const RouteDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { current: route, loadingCurrent } = useSelector((state: RootState) => state.routes);

  useEffect(() => {
    if (id) {
      dispatch(fetchRouteById(parseInt(id, 10)));
    }
  }, [id, dispatch]);

  if (loadingCurrent || !route) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" />
      </div>
    );
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