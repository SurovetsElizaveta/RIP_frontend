import { Container, Row, Col, Card, Spinner, Form, Button } from 'react-bootstrap';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { 
  completeSpeedRequest, 
  fetchSpeedRequestsList, 
  rejectSpeedRequest,
  fetchSpeedRequestById 
} from '../slices/speedRequestsSlice';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';
import styles from './RequestsPage.module.css';

interface RequestWithResult {
  id?: number;
  status?: string;
  creation_date?: string;
  departure_date?: string;
  formation_date?: string;
  completion_date?: string;
  creator_login?: string;
  moderator_login?: string;
  result?: number;
  loadingResult?: boolean;
}

export const RequestsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { list, loadingList } = useSelector((state: RootState) => state.speedRequests);
  const { isModerator } = useSelector((state: RootState) => state.user);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('');
  const [creator, setCreator] = useState('');
  const [filteredList, setFilteredList] = useState<RequestWithResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [statusUpdatingIds, setStatusUpdatingIds] = useState<Record<number, boolean>>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [appliedFilters, setAppliedFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    creator: '',
  });

  const pollingTimeoutRef = useRef<number | null>(null);
  const POLL_INTERVAL_MS = 5000;

  useEffect(() => {
    dispatch(fetchSpeedRequestsList({}));
  }, [dispatch]);

  const fetchRequestFullInfo = useCallback(async (requestId: number): Promise<{
    status: string;
    result: number;
    moderator_login?: string;
  }> => {
    try {
      const response = await dispatch(fetchSpeedRequestById(requestId)).unwrap();
      return {
        status: response?.speed_request?.status || '',
        result: response?.result || 0,
        moderator_login: response?.speed_request?.moderator_login
      };
    } catch (error) {
      console.error(`Error fetching full info for request ${requestId}:`, error);
      return {
        status: '',
        result: 0
      };
    }
  }, [dispatch]);

  const updateStatusAndResultsForRequests = useCallback(async (requests: RequestWithResult[]) => {
    try {
      const updatePromises = requests.map(async (request) => {
        if (!request.id) return request;
        
        try {
          const newInfo = await fetchRequestFullInfo(request.id);
          
          return { 
            ...request, 
            status: newInfo.status,
            result: newInfo.result,
            moderator_login: newInfo.moderator_login || request.moderator_login
          };
        } catch (error) {
          console.error(`Error updating info for request ${request.id}:`, error);
          return request;
        }
      });

      const updatedRequests = await Promise.all(updatePromises);
      return updatedRequests;
    } catch (error) {
      console.error('Error updating statuses and results:', error);
      return requests;
    }
  }, [fetchRequestFullInfo]);

  const loadResultsForRequests = useCallback(async (requests: any[], filters = appliedFilters) => {
    setLoadingResults(true);
    
    try {
      const filteredRequests = requests;
      
      const requestsWithLoading = filteredRequests.map(req => ({
        ...req,
        result: undefined,
        loadingResult: true
      }));
      
      let initialList = requestsWithLoading;
      if (isModerator && filters.creator.trim()) {
        const normalizedCreator = filters.creator.trim().toLowerCase();
        initialList = requestsWithLoading.filter(request => 
          (request.creator_login || '').toLowerCase().includes(normalizedCreator)
        );
      }
      
      setFilteredList(initialList);
      
      const infoPromises = filteredRequests.map((request: any) => 
        request.id ? fetchRequestFullInfo(request.id) : Promise.resolve({
          status: request.status || '',
          result: 0,
          moderator_login: request.moderator_login
        })
      );
      
      const infos = await Promise.all(infoPromises);
      
      const updatedRequests = filteredRequests.map((request: any, index: number) => ({
        ...request,
        status: infos[index].status,
        result: infos[index].result,
        moderator_login: infos[index].moderator_login || request.moderator_login,
        loadingResult: false
      }));
      
      let finalList = updatedRequests;
      if (isModerator && filters.creator.trim()) {
        const normalizedCreator = filters.creator.trim().toLowerCase();
        finalList = updatedRequests.filter(request => 
          (request.creator_login || '').toLowerCase().includes(normalizedCreator)
        );
      }
      
      setFilteredList(finalList);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoadingResults(false);
      setIsInitialLoad(false);
    }
  }, [fetchRequestFullInfo, appliedFilters, isModerator]);

  useEffect(() => {
    if (list.length > 0 && !loadingList) {
      loadResultsForRequests(list);
    }
  }, [list, loadingList, loadResultsForRequests]);

  const handleApplyFilters = async () => {
    const newFilters = {
      status,
      dateFrom,
      dateTo,
      creator,
    };
    
    setAppliedFilters(newFilters);
    setLoadingResults(true);
    
    try {
      const payload = await dispatch(
        fetchSpeedRequestsList({
          status: status || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        })
      ).unwrap();
      
      if (payload && payload.length > 0) {
        await loadResultsForRequests(payload, newFilters);
      } else {
        setFilteredList([]);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
      if (list.length > 0) {
        await loadResultsForRequests(list, newFilters);
      }
    } finally {
      setLoadingResults(false);
    }
  };

  const startPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      window.clearTimeout(pollingTimeoutRef.current);
    }

    pollingTimeoutRef.current = window.setTimeout(async () => {
      try {
        if (filteredList.length > 0) {
          const requestsWithUpdatedInfo = await updateStatusAndResultsForRequests(filteredList);
          
          let finalFiltered = requestsWithUpdatedInfo;
          if (isModerator && appliedFilters.creator.trim()) {
            const normalizedCreator = appliedFilters.creator.trim().toLowerCase();
            finalFiltered = requestsWithUpdatedInfo.filter(request => 
              (request.creator_login || '').toLowerCase().includes(normalizedCreator)
            );
          }
          
          setFilteredList(finalFiltered);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }

      startPolling();
    }, POLL_INTERVAL_MS);
  }, [filteredList, updateStatusAndResultsForRequests, appliedFilters, isModerator]);

  useEffect(() => {
    if (filteredList.length === 0) return;
    
    startPolling();
    
    return () => {
      if (pollingTimeoutRef.current) {
        window.clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [startPolling, filteredList]);

  const handleRequestClick = (request: RequestWithResult) => {
    if (!request.id) return;
    navigate(`${ROUTES.REQUESTS}/${request.id}`);
  };

  const handleStatusChange = async (
    requestId: number,
    action: 'complete' | 'reject',
  ) => {
    if (!requestId || !isModerator) return;

    setStatusUpdatingIds((prev) => ({ ...prev, [requestId]: true }));

    try {
      if (action === 'complete') {
        await dispatch(completeSpeedRequest(requestId)).unwrap();
      } else {
        await dispatch(rejectSpeedRequest(requestId)).unwrap();
      }
      
      const updatedInfo = await fetchRequestFullInfo(requestId);
      
      setFilteredList(prevList => 
        prevList.map(request => 
          request.id === requestId 
            ? { 
                ...request, 
                status: updatedInfo.status,
                result: updatedInfo.result,
                moderator_login: updatedInfo.moderator_login
              } 
            : request
        )
      );
    } catch (error) {
      console.error(
        `Error updating status for request ${requestId} with action ${action}`,
        error,
      );
      alert('Не удалось обновить статус заявки');
    } finally {
      setStatusUpdatingIds((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const formatDateForDisplay = (dateString?: string) => {
    return dateString || 'Не указана';
  };

  const formatDatesLine = (request: RequestWithResult) => {
    const parts = [];
    
    if (request.creation_date) {
      parts.push(`Создание: ${formatDateForDisplay(request.creation_date)}`);
    }
    
    if (request.departure_date) {
      parts.push(`Отправление: ${formatDateForDisplay(request.departure_date)}`);
    }
    
    if (request.formation_date) {
      parts.push(`Формирование: ${formatDateForDisplay(request.formation_date)}`);
    }
    
    if (request.completion_date) {
      parts.push(`Завершение: ${formatDateForDisplay(request.completion_date)}`);
    }
    
    return parts.join(' • ');
  };

  useEffect(() => {
    if (!isModerator) {
      setCreator('');
    }
  }, [isModerator]);

  const showLoading = isInitialLoad && (loadingList || loadingResults);

  return (
    <Container className={styles.mainContainer}>
      <h2 className={styles.pageTitle}>
        {isModerator ? 'Все заявки' : 'Мои заявки'}
      </h2>
      
      <Card className={styles.filterCard}>
        <Card.Body>
          <Form>
            <Row className="align-items-end">
              <Col md={isModerator ? 2 : 3}>
                <Form.Group>
                  <Form.Label>Статус</Form.Label>
                  <Form.Select 
                    className={styles.statusSelect}
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">Все статусы</option>
                    <option value="сформирована">Сформирована</option>
                    <option value="завершена">Завершена</option>
                    <option value="отклонена">Отклонена</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={isModerator ? 3 : 4}>
                <Form.Group>
                  <Form.Label>Дата от</Form.Label>
                  <Form.Control 
                    className={styles.dateInput}
                    type="date" 
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </Form.Group>
              </Col>
              
              <Col md={isModerator ? 3 : 4}>
                <Form.Group>
                  <Form.Label>Дата до</Form.Label>
                  <Form.Control 
                    className={styles.dateInput}
                    type="date" 
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </Form.Group>
              </Col>
              
              {isModerator && (
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Создатель</Form.Label>
                    <Form.Control
                      className={styles.loginInput}
                      type="text"
                      value={creator}
                      placeholder="Логин"
                      onChange={(e) => setCreator(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              )}

              <Col md={isModerator ? 2 : 1} className="d-flex align-items-end">
                <Button 
                  type="button"
                  onClick={handleApplyFilters}
                  className={styles.applyButton}
                  disabled={loadingList || loadingResults}
                >
                  Применить
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      
      {showLoading ? (
        <div className={styles.loadingContainer}>
          <Spinner animation="border" />
          <div className="mt-2">Загрузка заявок...</div>
        </div>
      ) : filteredList.length === 0 ? (
        <Card className={styles.emptyCard}>
          <Card.Body className="text-center">
            <Card.Text>Заявки не найдены</Card.Text>
          </Card.Body>
        </Card>
      ) : (
        <div className={styles.requestsList}>
          {filteredList.map((request) => {
            const isTerminalStatus = request.status === 'завершена' || request.status === 'отклонена';
            const isUpdating = request.id ? statusUpdatingIds[request.id] : false;

            return (
              <Card 
                key={request.id}
                className={styles.requestCard}
                onClick={() => handleRequestClick(request)}
              >
                <Card.Body className={styles.cardBody}>
                  <div className={styles.cardHeader}>
                    <div className={styles.headerLeft}>
                      <Card.Title className={styles.cardTitle}>
                        Заявка #{request.id}
                      </Card.Title>
                      <div className={styles.creatorContainer}>
                        <span className={styles.creatorLabel}>Создатель:</span>
                        <span className={styles.creatorName}>
                          {request.creator_login || '—'}
                        </span>
                      </div>
                      {request.moderator_login && (
                        <div className={styles.moderatorContainer}>
                          <span className={styles.moderatorLabel}>Модератор:</span>
                          <span className={styles.moderatorName}>{request.moderator_login}</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.headerRight}>
                      <div className={styles.statusBadge}>
                        {request.status}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.datesRow}>
                    <span className={styles.datesLine}>
                      {formatDatesLine(request)}
                    </span>
                  </div>
                  
                  <div className={styles.footerRow}>
                    <div className={styles.resultsContainer}>
                      <span className={styles.resultsLabel}>Результатов:</span>
                      <div className={styles.resultBadgeContainer}>
                        {request.loadingResult ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <div className={styles.resultBadge}>
                            {request.result || 0}
                          </div>
                        )}
                      </div>
                    </div>

                    {isModerator && (
                      <div className={styles.statusActions} onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          className={styles.completeButton}
                          disabled={isTerminalStatus || isUpdating}
                          onClick={(e) => {
                            e.stopPropagation();
                            request.id && handleStatusChange(request.id, 'complete');
                          }}
                        >
                          Завершить
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className={styles.rejectButton}
                          disabled={isTerminalStatus || isUpdating}
                          onClick={(e) => {
                            e.stopPropagation();
                            request.id && handleStatusChange(request.id, 'reject');
                          }}
                        >
                          Отклонить
                        </Button>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
};