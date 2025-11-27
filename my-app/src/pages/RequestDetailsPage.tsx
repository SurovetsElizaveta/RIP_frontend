import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchSpeedRequestById } from '../slices/speedRequestsSlice';
import { Spinner } from 'react-bootstrap';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { ROUTES } from '../routes';
import styles from './RequestDetailsPage.module.css';

export const RequestDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { current, loadingCurrent } = useSelector(
    (state: RootState) => state.speedRequests,
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchSpeedRequestById(parseInt(id, 10)));
    }
  }, [id, dispatch]);

  if (loadingCurrent || !current) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner animation="border" />
      </div>
    );
  }

  const speedRequest = current.speed_request;
  const routes = current.routes || [];
  const routeReqs = current.route_req || [];

  const crumbs = [
    { label: 'Мои заявки', path: ROUTES.REQUESTS },
    { label: `Заявка #${speedRequest?.id}` },
  ];

  return (
    <div className={styles.mainSpace}>
      <BreadCrumbs crumbs={crumbs} />
      <h2 className={styles.pageTitle}>Заявка #{speedRequest?.id}</h2>
      
      <div className={styles.statusSection}>
        <div className={styles.dateContainer}>
          <h4>Статус:</h4>
          <div className={styles.statusBadge}>
            {speedRequest?.status}
          </div>
        </div>
      </div>

      <div className={styles.departureDate}>
        <div className={styles.dateContainer}>
          <h4>Дата создания:</h4>
          <div className={styles.dateValue}>
            {speedRequest?.creation_date}
          </div>
        </div>
      </div>

      {speedRequest?.departure_date && (
        <div className={styles.departureDate}>
          <div className={styles.dateContainer}>
            <h4>Дата отправления:</h4>
            <div className={styles.dateValue}>
              {speedRequest.departure_date}
            </div>
          </div>
        </div>
      )}

      {speedRequest?.formation_date && (
        <div className={styles.departureDate}>
          <div className={styles.dateContainer}>
            <h4>Дата формирования:</h4>
            <div className={styles.dateValue}>
              {speedRequest.formation_date}
            </div>
          </div>
        </div>
      )}

      {speedRequest?.completion_date && (
        <div className={styles.departureDate}>
          <div className={styles.dateContainer}>
            <h4>Дата завершения:</h4>
            <div className={styles.dateValue}>
              {speedRequest.completion_date}
            </div>
          </div>
        </div>
      )}

      <h3 className={styles.routesTitle}>Маршруты</h3>
      
      {routes.length === 0 ? (
        <div className={styles.emptyState}>
          Нет маршрутов в заявке
        </div>
      ) : (
        <div className={styles.routesList}>
          {routes.map((route, index) => {
            const routeReq = routeReqs[index];
            const isCompleted = speedRequest?.status === 'завершена' || 
                              speedRequest?.status === 'completed';

            return (
              <div key={route.route_id} className={styles.route}>
                <div className={styles.routeImg}>
                  <img
                    src={route.image_url || '/images/default_route.svg'}
                    alt={route.title}
                    className={styles.routeImage}
                    onError={(e) => {
                      e.currentTarget.src = '/images/default_route.svg';
                    }}
                  />
                </div>
                <div className={styles.routeInfo}>
                  <h4>{route.title}, {route.distance} км</h4>
                </div>

                <div className={styles.routeArrivalInfo}>
                  {routeReq?.arrival_date && (
                    <div className={styles.arrivalDateContainer}>
                      <h4 className={styles.arrivalDateLabel}>Дата прибытия:</h4>
                      <div className={styles.dateValue}>
                        {routeReq.arrival_date}
                      </div>
                    </div>
                  )}

                  {isCompleted && routeReq?.ship_speed && (
                    <div className={styles.shipSpeed}>
                      <h4>Средняя скорость контейнеровоза:</h4>
                      <h4 className={styles.speedValue}>{routeReq.ship_speed} узл.</h4>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};