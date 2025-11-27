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
import { formatDateForFrontend } from '../api/dateFormatter'

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
  const [savingDepartureDate, setSavingDepartureDate] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !draftId) {
      navigate(ROUTES.ROUTES);
      return;
    }
    dispatch(fetchSpeedRequestById(draftId));
  }, [dispatch, draftId, isAuthenticated, navigate]);

  useEffect(() => {
    if (current?.speed_request) {
      const backendDate = current.speed_request.departure_date;
      const frontendDate = backendDate ? formatDateForFrontend(backendDate) : '';
      setDepartureDate(frontendDate);
      
      const dates: Record<number, string> = {};
      if (current.routes && current.route_req) {
        current.routes.forEach((route, index) => {
          if (route.route_id && current.route_req?.[index]) {
            const backendArrivalDate = current.route_req[index].arrival_date;
            const frontendArrivalDate = backendArrivalDate ? formatDateForFrontend(backendArrivalDate) : '';
            dates[route.route_id] = frontendArrivalDate;
          }
        });
      }
      setArrivalDates(dates);
    }
  }, [current]);

  const handleSaveDepartureDate = async () => {
    if (!draftId || !departureDate) return;
    
    setSavingDepartureDate(true);
    try {
      await dispatch(updateSpeedRequestDepartureDate({ 
        id: draftId, 
        departureDate 
      })).unwrap();
      
      await dispatch(fetchSpeedRequestById(draftId));
    } catch (error) {
      console.error('Failed to save departure date:', error);
      alert('Ошибка при сохранении даты отправления');
    } finally {
      setSavingDepartureDate(false);
    }
  };

  const handleUpdateArrivalDate = async (routeId: number, arrivalDate: string) => {
    if (!draftId) return;
    try {
      await dispatch(updateRouteArrivalDate({ 
        speedRequestId: draftId, 
        routeId, 
        arrivalDate 
      })).unwrap();
      
      await dispatch(fetchSpeedRequestById(draftId));
    } catch (error) {
      console.error('Failed to save arrival date:', error);
      alert('Ошибка при сохранении даты прибытия');
    }
  };

  const handleDeleteRoute = async (routeId: number) => {
    if (!draftId) return;
    try {
      await dispatch(deleteRouteFromSpeedRequest({ 
        speedRequestId: draftId, 
        routeId 
      })).unwrap();
      await dispatch(fetchSpeedRequestById(draftId));
    } catch (error) {
      console.error('Failed to delete route:', error);
      alert('Ошибка при удалении маршрута');
    }
  };

  const handleDeleteRequest = async () => {
    if (!draftId) return;
    if (window.confirm('Вы уверены, что хотите удалить эту заявку?')) {
      try {
        await dispatch(deleteSpeedRequest(draftId)).unwrap();
        navigate(ROUTES.ROUTES);
      } catch (error) {
        console.error('Failed to delete request:', error);
        alert('Ошибка при удалении заявки');
      }
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

    try {
      await dispatch(submitSpeedRequest(draftId)).unwrap();
      navigate(`${ROUTES.REQUESTS}/${draftId}`);
    } catch (error) {
      console.error('Failed to submit request:', error);
      alert('Ошибка при формировании заявки');
    }
  };

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
            disabled={!isDraft || !departureDate || savingDepartureDate}
            className={styles.saveButton}
          >
            {savingDepartureDate ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Сохранение...
              </>
            ) : (
              'Сохранить'
            )}
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

                    {isCompleted && routeReq?.ship_speed && (
                      <div className={styles.shipSpeed}>
                        <h4>Средняя скорость контейнеровоза:</h4>
                        <h4 className={styles.speedValue}>{routeReq.ship_speed} узл.</h4>
                      </div>
                    )}

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