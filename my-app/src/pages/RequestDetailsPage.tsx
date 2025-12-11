import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Spinner, Button, Form } from 'react-bootstrap';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { ROUTES } from '../routes';
import styles from './RequestDetailsPage.module.css';
import { formatDateForFrontend } from '../api/dateFormatter';

export const RequestDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { current, loadingCurrent } = useSelector(
    (state: RootState) => state.speedRequests,
  );
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated,
  );

  const [departureDate, setDepartureDate] = useState('');
  const [arrivalDates, setArrivalDates] = useState<Record<number, string>>({});
  const [savingDepartureDate, setSavingDepartureDate] = useState(false);
  const [savingArrivalDates, setSavingArrivalDates] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (id) {
      dispatch(fetchSpeedRequestById(parseInt(id, 10)));
    }
  }, [id, dispatch, isAuthenticated, navigate]);

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

  const isDraft = () => {
    const status = current?.speed_request?.status?.toLowerCase();
    return status === 'черновик' || status === 'draft';
  };

  const handleSaveDepartureDate = async () => {
    if (!id || !departureDate) return;
    
    setSavingDepartureDate(true);
    try {
      await dispatch(updateSpeedRequestDepartureDate({ 
        id: parseInt(id, 10), 
        departureDate 
      })).unwrap();
      dispatch(fetchSpeedRequestById(parseInt(id, 10)));
    } catch (error) {
      console.error('Failed to save departure date:', error);
    } finally {
      setSavingDepartureDate(false);
    }
  };

  const handleUpdateArrivalDate = async (routeId: number) => {
    if (!id) return;

    const arrivalDate = arrivalDates[routeId];
    if (!arrivalDate) {
      alert('Пожалуйста, выберите дату прибытия');
      return;
    }

    setSavingArrivalDates(prev => ({ ...prev, [routeId]: true }));
    
    try {
      await dispatch(updateRouteArrivalDate({ 
        speedRequestId: parseInt(id, 10), 
        routeId, 
        arrivalDate 
      })).unwrap();
      dispatch(fetchSpeedRequestById(parseInt(id, 10)));
    } catch (error) {
      console.error('Failed to save arrival date:', error);
      alert('Ошибка при сохранении даты прибытия');
    } finally {
      setSavingArrivalDates(prev => ({ ...prev, [routeId]: false }));
    }
  };

  const handleDeleteRoute = async (routeId: number) => {
    if (!id) return;
    try {
      await dispatch(deleteRouteFromSpeedRequest({ 
        speedRequestId: parseInt(id, 10), 
        routeId 
      })).unwrap();
      dispatch(fetchSpeedRequestById(parseInt(id, 10)));
    } catch (error) {
      console.error('Failed to delete route:', error);
      alert('Ошибка при удалении маршрута');
    }
  };

  const handleDeleteRequest = async () => {
    if (!id) return;
    try {
      await dispatch(deleteSpeedRequest(parseInt(id, 10))).unwrap();
      navigate(ROUTES.REQUESTS);
    } catch (error) {
      console.error('Failed to delete request:', error);
      alert('Ошибка при удалении заявки');
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    
    const routes = current?.routes || [];
    const allRoutesHaveArrivalDates = routes.every((route) => {
      if (!route.route_id) return false;
      return arrivalDates[route.route_id] && arrivalDates[route.route_id].trim() !== '';
    });

    if (!departureDate || !allRoutesHaveArrivalDates) {
      alert('Пожалуйста, заполните дату отправления и даты прибытия для всех маршрутов');
      return;
    }

    try {
      await dispatch(submitSpeedRequest(parseInt(id, 10))).unwrap();
      dispatch(fetchSpeedRequestById(parseInt(id, 10)));
    } catch (error) {
      console.error('Failed to submit request:', error);
      alert('Ошибка при формировании заявки');
    }
  };

  if (!isAuthenticated) {
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
  const routes = current.routes || [];
  const routeReqs = current.route_req || [];
  const draft = isDraft();

  const allRoutesHaveArrivalDates = routes.every((route) => {
    if (!route.route_id) return false;
    return arrivalDates[route.route_id] && arrivalDates[route.route_id].trim() !== '';
  });
  const canSubmit = draft && departureDate.trim() !== '' && allRoutesHaveArrivalDates && routes.length > 0;

  const crumbs = [
    { label: 'Мои заявки', path: ROUTES.REQUESTS },
    { label: `Заявка #${speedRequest?.id}` },
  ];

  const formatDatesLine = () => {
    const parts = [];
    
    if (speedRequest?.creation_date) {
      parts.push(`Создание: ${speedRequest.creation_date}`);
    }
    
    if (speedRequest?.departure_date) {
      parts.push(`Отправление: ${speedRequest.departure_date}`);
    }
    
    if (speedRequest?.formation_date) {
      parts.push(`Формирование: ${speedRequest.formation_date}`);
    }
    
    if (speedRequest?.completion_date) {
      parts.push(`Завершение: ${speedRequest.completion_date}`);
    }
    
    return parts.join(' • ');
  };

  return (
    <div className={styles.mainSpace}>
      <BreadCrumbs crumbs={crumbs} />
      <h2 className={styles.pageTitle}>
        {draft ? 'Черновик заявки' : 'Заявка'} #{speedRequest?.id}
      </h2>
      <div className={styles.statusSection}>
        <div className={styles.statusContainer}>
          <h4 className={styles.statusTitle}>Статус:</h4>
          <div className={styles.statusBadge}>
            {speedRequest?.status}
          </div>
        </div>
      </div>

      <div className={styles.datesRow}>
        <span className={styles.datesLine}>
          {formatDatesLine()}
        </span>
      </div>

      {draft && !speedRequest?.departure_date && (
        <div className={styles.departureDateEdit}>
          <div className={styles.dateEditContainer}>
            <h4 className={styles.dateEditLabel}>Дата отправления:</h4>
            <div className={styles.dateInputContainer}>
              <Form.Control
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                disabled={!draft || savingDepartureDate}
                className={styles.dateInput}
              />
              <Button
                onClick={handleSaveDepartureDate}
                disabled={!draft || !departureDate || savingDepartureDate}
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
            const routeId = route.route_id;
            if (!routeId) return null;

            const currentArrivalDate = arrivalDates[routeId] || '';
            const isCompleted = speedRequest?.status === 'завершена' || 
                              speedRequest?.status === 'completed';
            const isSaving = savingArrivalDates[routeId];

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
                  <h4 className={styles.routeTitle}>{route.title}, {route.distance} км</h4>
                </div>

                <div className={styles.routeRightPanel}>
                  <div className={styles.arrivalDateContainer}>
                    <h4 className={styles.arrivalDateLabel}>Дата прибытия:</h4>
                    {draft ? (
                      <div className={styles.arrivalDateControls}>
                        <Form.Control
                          type="date"
                          value={currentArrivalDate}
                          onChange={(e) => {
                            const newDate = e.target.value;
                            setArrivalDates(prev => ({ ...prev, [routeId]: newDate }));
                          }}
                          disabled={!draft || isSaving}
                          className={styles.dateInput}
                        />
                        <Button
                          variant="outline-success"
                          onClick={() => handleUpdateArrivalDate(routeId)}
                          disabled={!draft || !currentArrivalDate || isSaving}
                          className={styles.saveArrivalButton}
                          title="Сохранить дату прибытия"
                        >
                          {isSaving ? (
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />
                          ) : (
                            '✓'
                          )}
                        </Button>
                      </div>
                    ) : routeReq?.arrival_date ? (
                      <div className={styles.dateValue}>
                        {routeReq.arrival_date}
                      </div>
                    ) : null}
                  </div>

                  <div className={styles.shipSpeedContainer}>
                    <h4 className={styles.shipSpeedLabel}>Скорость контейнеровоза:</h4>
                    <h4 className={styles.speedValue}>
                      {routeReq?.ship_speed ? `${routeReq.ship_speed} узл.` : '—'}
                    </h4>
                  </div>

                  {draft && (
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteRoute(routeId)}
                      disabled={!draft}
                      className={styles.deleteRouteButton}
                    >
                      Удалить маршрут
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {draft && (
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