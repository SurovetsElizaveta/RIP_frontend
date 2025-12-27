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
import { formatDateForFrontend } from '../api/dateFormatter'; // добавлен импорт

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

  const getTodayDateString = useCallback(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(getTodayDateString());
  const [status, setStatus] = useState('');
  const [creator, setCreator] = useState('');
  const [filteredList, setFilteredList] = useState<RequestWithResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [statusUpdatingIds, setStatusUpdatingIds] = useState<Record<number, boolean>>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [appliedFilters, setAppliedFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: getTodayDateString(),
    creator: '',
  });

  const pollingTimeoutRef = useRef<number | null>(null);
  const POLL_INTERVAL_MS = 5000;

  useEffect(() => {
    dispatch(fetchSpeedRequestsList({
      dateTo: getTodayDateString(),
    }));
  }, [dispatch, getTodayDateString]);

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
      dateTo: dateTo || getTodayDateString(), 
      creator,
    };
    
    setAppliedFilters(newFilters);
    setLoadingResults(true);
    
    try {
      const payload = await dispatch(
        fetchSpeedRequestsList({
          status: status || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || getTodayDateString(), 
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

  // Обновленная функция форматирования дат
  const formatDateForDisplay = (dateString?: string) => {
    if (!dateString) return '—';
    
    // Если дата уже в формате ДД.ММ.ГГГГ, возвращаем как есть
    const parts = dateString.split('.');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${day}.${month}.${year}`;
    }
    
    // Если дата в формате YYYY-MM-DD, конвертируем в ДД.ММ.ГГГГ
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // если невалидная дата, возвращаем как есть
      }
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return dateString;
    }
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
                    max={dateTo || getTodayDateString()} 
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
                    max={getTodayDateString()} 
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
        <div className={styles.tableWrapper}>
          {/* Заголовок таблицы */}
          <div className={styles.tableHeader}>
            <div className={`${styles.headerRow} ${isModerator ? styles.headerRowWithActions : ''}`}>
              <div className={styles.headerCell}>№</div>
              <div className={styles.headerCell}>Дата создания</div>
              <div className={styles.headerCell}>Дата формирования</div>
              <div className={styles.headerCell}>Дата завершения</div>
              <div className={styles.headerCell}>Создатель</div>
              <div className={styles.headerCell}>Модератор</div>
              <div className={styles.headerCell}>Статус</div>
              <div className={styles.headerCell}>Результаты</div>
              {isModerator && <div className={styles.headerCell}>Действия</div>}
            </div>
          </div>
          
          {/* Строки-карточки */}
          <div className={styles.tableBody}>
            {filteredList.map((request) => {
              const isTerminalStatus = request.status === 'завершена' || request.status === 'отклонена';
              const isUpdating = request.id ? statusUpdatingIds[request.id] : false;

              return (
                <Card 
                  key={request.id}
                  className={styles.tableRowCard}
                  onClick={() => handleRequestClick(request)}
                >
                  <Card.Body className={styles.tableCardBody}>
                    <div className={`${styles.tableRow} ${isModerator ? styles.tableRowWithActions : ''}`}>
                      <div className={styles.tableCell}>
                        <span className={styles.cellLabelMobile}>№:</span>
                        <span className={styles.cellValue}>#{request.id}</span>
                      </div>
                      
                      <div className={styles.tableCell}>
                        <span className={styles.cellLabelMobile}>Дата создания:</span>
                        <span className={styles.cellValue}>{formatDateForDisplay(request.creation_date)}</span>
                      </div>
                      
                      <div className={styles.tableCell}>
                        <span className={styles.cellLabelMobile}>Дата формирования:</span>
                        <span className={styles.cellValue}>{formatDateForDisplay(request.formation_date)}</span>
                      </div>
                      
                      <div className={styles.tableCell}>
                        <span className={styles.cellLabelMobile}>Дата завершения:</span>
                        <span className={styles.cellValue}>{formatDateForDisplay(request.completion_date)}</span>
                      </div>
                      
                      <div className={styles.tableCell}>
                        <span className={styles.cellLabelMobile}>Создатель:</span>
                        <span className={styles.cellValue}>{request.creator_login || '—'}</span>
                      </div>
                      
                      <div className={styles.tableCell}>
                        <span className={styles.cellLabelMobile}>Модератор:</span>
                        <span className={styles.cellValue}>{request.moderator_login || '—'}</span>
                      </div>
                      
                      <div className={styles.tableCell}>
                        <span className={styles.cellLabelMobile}>Статус:</span>
                        <span className={`${styles.cellValue} ${styles.statusCell}`}>
                          <span className={styles.statusBadge}>
                            {request.status}
                          </span>
                        </span>
                      </div>
                      
                      <div className={styles.tableCell}>
                        <span className={styles.cellLabelMobile}>Результаты:</span>
                        <span className={styles.cellValue}>
                          {request.loadingResult ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <div className={styles.resultBadge}>
                              {request.result || 0}
                            </div>
                          )}
                        </span>
                      </div>
                      
                      {isModerator && (
                        <div 
                          className={styles.tableCell}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className={styles.cellLabelMobile}>Действия:</span>
                          <div className={styles.actionsCell}>
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
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </Container>
  );
};