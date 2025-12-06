import { useEffect, type FC } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { RouteCard } from '../components/RouteCard';
import { RequestLink } from '../components/RequestLink';
import { FilterBar } from '../components/FilterBar';
import { useSearchParams } from "react-router-dom";
import styles from './Routes.module.css';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { setMinDistanceAction, setMaxDistanceAction } from '../slices/filterSlice';
import { fetchRoutesList } from '../slices/routesSlice';
import type { AppDispatch, RootState } from '../store';
import { Spinner } from 'react-bootstrap';

export const RoutesPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { items: routes, loadingList } = useSelector((state: RootState) => state.routes);

  useEffect(() => {
    const hasFilters = searchParams.has('min_distance') || searchParams.has('max_distance');
    
    if (hasFilters) {
      searchParams.delete('min_distance');
      searchParams.delete('max_distance');
      setSearchParams(searchParams);
      dispatch(setMinDistanceAction(''));
      dispatch(setMaxDistanceAction(''));
    }
  }, []);

  const fetchRoutes = async () => {
    const min = searchParams.get('min_distance');
    const max = searchParams.get('max_distance');
    
    const minNum = min ? parseInt(min, 10) : undefined;
    const maxNum = max ? parseInt(max, 10) : undefined;
    
    if (min !== null) dispatch(setMinDistanceAction(min));
    if (max !== null) dispatch(setMaxDistanceAction(max));

    dispatch(fetchRoutesList({ minDistance: minNum, maxDistance: maxNum }));
  };

  useEffect(() => {
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
        {loadingList ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <Row className="g-3">
            {routes.map((route, index) => (
              <Col
                key={`${route.RouteID}-${index}`}
                xs={12}
                sm={6}
                md={6}
                lg={4}
                xl={3}
                className={styles['custom-col']}
              >
                <RouteCard route={route} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </Container>
  );
};