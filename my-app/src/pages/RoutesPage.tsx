import { useEffect, type FC, useRef, useState } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
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
import { useRouteSearch } from '../hooks/useRouteSearch';

export const RoutesPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { items: routes, loadingList } = useSelector((state: RootState) => state.routes);
  
  const {
    processedRoutes,
    uploadedImage,
    isModelReady,
    isLoading,
    isProcessingImage,
    searchProgress,
    uploadImage,
    startSearch,
    resetSearch,
    hasActiveSearch
  } = useRouteSearch(routes);

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

  const handleImageUpload = (file: File) => {
    uploadImage(file);
    // Автоматически запускаем поиск после загрузки
    setTimeout(() => {
      if (uploadedImage) {
        startSearch();
      }
    }, 100);
  };

  const handleClearSearch = () => {
    resetSearch();
  };

  const displayRoutes = hasActiveSearch 
    ? processedRoutes.filter(r => r.isVisible !== false)
    : routes;

  const breadcrumbs = [
    { label: 'Маршруты', path: '/routes' }
  ];

  return (
    <Container fluid className="p-0">
      <RequestLink />

      <Container className={`${styles['main-space']} pt-5`}>
        <Row className="justify-content-center mb-4">
          <Col xs={12} md={10} lg={8} className="d-flex justify-content-center">
            {/* Используем обновленный FilterBar */}
            <FilterBar 
              onImageUpload={handleImageUpload}
              isModelReady={isModelReady}
              isProcessingImage={isProcessingImage}
              showImageSearchButton={true}
            />
          </Col>
        </Row>
        
        <BreadCrumbs crumbs={breadcrumbs} />
        {loadingList ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" />
            <span className="ms-2">Загрузка маршрутов...</span>
          </div>
        ) : (
          <Row className="g-3">
            {displayRoutes.map((route, index) => (
              <Col
                key={`${route.RouteID}-${index}`}
                xs={12}
                sm={6}
                md={6}
                lg={4}
                xl={3}
                className={styles['custom-col']}
              >
                <RouteCard 
                  route={route} 
                  showSimilarity={hasActiveSearch}
                  similarityScore={hasActiveSearch ? (route as any).similarityScore : undefined}
                />
              </Col>
            ))}
            
            {hasActiveSearch && processedRoutes.filter(r => r.isVisible !== false).length === 0 && !isLoading && !isProcessingImage && (
              <Col xs={12} className="text-center py-5">
                <div className="text-muted">
                  <h5>Похожие маршруты не найдены</h5>
                  <p>Попробуйте загрузить другое изображение</p>
                </div>
              </Col>
            )}
          </Row>
        )}
      </Container>
    </Container>
  );
};