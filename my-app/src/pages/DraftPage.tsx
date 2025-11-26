import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import {
  fetchSpeedRequestById,
  updateSpeedRequestDepartureDate,
  updateRouteArrivalDate,
  deleteRouteFromSpeedRequest,
  deleteSpeedRequest,
  submitSpeedRequest,
} from '../slices/speedRequestsSlice';
import { Spinner, Button, Form, Alert } from 'react-bootstrap';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { ROUTES } from '../routes';
import { useNavigate } from 'react-router-dom';
import styles from './DraftPage.module.css';

export const DraftPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { current, loadingCurrent, draftId } = useSelector(
    (state: RootState) => state.speedRequests,
  );
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated,
  );

  const [departureDate, setDepartureDate] = useState('');
  const [arrivalDates, setArrivalDates] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!isAuthenticated || !draftId) {
      navigate(ROUTES.ROUTES);
      return;
    }
    dispatch(fetchSpeedRequestById(draftId));
  }, [dispatch, draftId, isAuthenticated, navigate]);

  useEffect(() => {
    if (current?.speed_request) {
      setDepartureDate(current.speed_request.departure_date || '');
      
      const dates: Record<number, string> = {};
      if (current.routes && current.route_req) {
        current.routes.forEach((route, index) => {
          if (route.route_id && current.route_req?.[index]) {
            dates[route.route_id] = current.route_req[index].arrival_date || '';
          }
        });
      }
      setArrivalDates(dates);
    }
  }, [current]);

  if (!isAuthenticated || !draftId) {
    return null;
  }

  if (loadingCurrent || !current) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner animation="border" />
      </div>
    );
  }

  const speedRequest = current.speed_request;
  const isDraft = speedRequest?.status === 'черновик' || speedRequest?.status === 'draft';

  if (!isDraft) {
    navigate(`${ROUTES.REQUESTS}/${draftId}`);
    return null;
  }

  const routes = current.routes || [];
  const routeReqs = current.route_req || [];

  const handleSaveDepartureDate = async () => {
    if (!draftId || !departureDate) return;
    await dispatch(updateSpeedRequestDepartureDate({ id: draftId, departureDate }));
    await dispatch(fetchSpeedRequestById(draftId));
  };

  const handleUpdateArrivalDate = async (routeId: number, arrivalDate: string) => {
    if (!draftId) return;
    await dispatch(updateRouteArrivalDate({ speedRequestId: draftId, routeId, arrivalDate }));
    await dispatch(fetchSpeedRequestById(draftId));
  };

  const handleDeleteRoute = async (routeId: number) => {
    if (!draftId) return;
    await dispatch(deleteRouteFromSpeedRequest({ speedRequestId: draftId, routeId }));
    await dispatch(fetchSpeedRequestById(draftId));
  };

  const handleDeleteRequest = async () => {
    if (!draftId) return;
    if (window.confirm('Вы уверены, что хотите удалить эту заявку?')) {
      await dispatch(deleteSpeedRequest(draftId));
      navigate(ROUTES.ROUTES);
    }
  };

  const handleSubmit = async () => {
    if (!draftId) return;
    const allRoutesHaveArrivalDates = routes.every((route) => {
      if (!route.route_id) return false;
      return arrivalDates[route.route_id] && arrivalDates[route.route_id].trim() !== '';
    });

    if (!departureDate || !allRoutesHaveArrivalDates) {
      alert('Пожалуйста, заполните дату отправления и даты прибытия для всех маршрутов');
      return;
    }

    await dispatch(submitSpeedRequest(draftId));
    navigate(`${ROUTES.REQUESTS}/${draftId}`);
  };

  const allRoutesHaveArrivalDates = routes.every((route) => {
    if (!route.route_id) return false;
    return arrivalDates[route.route_id] && arrivalDates[route.route_id].trim() !== '';
  });
  const canSubmit = departureDate.trim() !== '' && allRoutesHaveArrivalDates && routes.length > 0;

  const crumbs = [
    { label: 'Мои заявки', path: ROUTES.REQUESTS },
    { label: `Черновик #${speedRequest?.id}` },
  ];

  return (
    <div className={styles.mainSpace}>
      <BreadCrumbs crumbs={crumbs} />
      <h3 className={styles.pageTitle}>Черновик заявки #{speedRequest?.id}</h3>
      <div className={styles.departureDate}>
        <div className={styles.dateInputContainer}>
          <h4>Дата отправления:</h4>
          <Form.Control
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            disabled={!isDraft}
            className={styles.dateInput}
          />
          <Button
            onClick={handleSaveDepartureDate}
            disabled={!isDraft || !departureDate}
            className={styles.saveButton}
          >
            Сохранить
          </Button>
        </div>
      </div>

      <div className={styles.routes}>
        {routes.length === 0 ? (
          <Alert variant="info" className={styles.emptyState}>
            Нет маршрутов в заявке
          </Alert>
        ) : (
          <div className={styles.routesList}>
            {routes.map((route, index) => {
              const routeReq = routeReqs[index];
              const routeId = route.route_id;
              if (!routeId) return null;

              const currentArrivalDate = arrivalDates[routeId] || '';
              const isCompleted = speedRequest?.status === 'завершена' || speedRequest?.status === 'completed';

              return (
                <div key={routeId} className={styles.route}>
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
                    <div className={styles.arrivalDateContainer}>
                      <h4 className={styles.arrivalDateLabel}>Дата прибытия:</h4>
                      <Form.Control
                        type="date"
                        value={currentArrivalDate}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          setArrivalDates({ ...arrivalDates, [routeId]: newDate });
                        }}
                        onBlur={(e) => {
                          const newDate = e.target.value;
                          if (newDate && newDate !== (routeReqs[index]?.arrival_date || '')) {
                            handleUpdateArrivalDate(routeId, newDate);
                          }
                        }}
                        disabled={!isDraft}
                        className={styles.dateInput}
                      />
                    </div>

                    {/* Скорость судна (только для завершенных заявок) */}
                    {isCompleted && routeReq?.ship_speed && (
                      <div className={styles.shipSpeed}>
                        <h4>Средняя скорость контейнеровоза:</h4>
                        <h4 className={styles.speedValue}>{routeReq.ship_speed} узл.</h4>
                      </div>
                    )}

                    {/* Кнопка удаления маршрута */}
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteRoute(routeId)}
                      disabled={!isDraft}
                      className={styles.deleteRouteButton}
                    >
                      Удалить маршрут
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Кнопки действий */}
      {isDraft && (
        <div className={styles.actions}>
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={styles.submitButton}
          >
            Сформировать заявку
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteRequest}
            className={styles.deleteButton}
          >
            Удалить заявку
          </Button>
        </div>
      )}
    </div>
  );
};