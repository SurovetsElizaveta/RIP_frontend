import { Container, Row, Col, Card, Spinner, Form, Button } from 'react-bootstrap';
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchSpeedRequestsList } from '../slices/speedRequestsSlice';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';
import styles from './RequestsPage.module.css';
import { api } from '../api';
import { formatDateForBackend } from '../api/dateFormatter';

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

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('');
  const [requestsWithResults, setRequestsWithResults] = useState<RequestWithResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [filteredList, setFilteredList] = useState<RequestWithResult[]>([]);

  useEffect(() => {
    dispatch(fetchSpeedRequestsList({}));
  }, [dispatch]);

  const fetchRequestResult = useCallback(async (requestId: number): Promise<number> => {
    try {
      const response = await api.speedrequests.speedrequestsDetail(requestId);
      return response.data?.result || 0;
    } catch (error) {
      console.error(`Error fetching result for request ${requestId}:`, error);
      return 0;
    }
  }, []);

  const loadResultsForRequests = useCallback(async (requests: any[]) => {
    setLoadingResults(true);
    
    try {
      const requestsWithLoading = requests.map(req => ({
        ...req,
        result: undefined,
        loadingResult: true
      }));
      
      setRequestsWithResults(requestsWithLoading);
      setFilteredList(requestsWithLoading);
      
      const resultsPromises = requests.map(request => 
        request.id ? fetchRequestResult(request.id) : Promise.resolve(0)
      );
      
      const results = await Promise.all(resultsPromises);
      
      const updatedRequests = requests.map((request, index) => ({
        ...request,
        result: results[index],
        loadingResult: false
      }));
      
      setRequestsWithResults(updatedRequests);
      setFilteredList(updatedRequests);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoadingResults(false);
    }
  }, [fetchRequestResult]);

  useEffect(() => {
    if (list.length > 0 && !loadingList) {
      loadResultsForRequests(list);
    }
  }, [list, loadingList, loadResultsForRequests]);

  const handleApplyFilters = async () => {
    setLoadingResults(true);
    
    try {
      const params: {
        status?: string;
        date_from?: string;
        date_to?: string;
      } = {};
      
      if (status) {
        params.status = status;
      }
      
      if (dateFrom) {
        params.date_from = formatDateForBackend(dateFrom);
      }
      
      if (dateTo) {
        params.date_to = formatDateForBackend(dateTo);
      }
      
      const response = await api.speedrequests.speedrequestsList(params);
      
      if (response.data && response.data.length > 0) {
        await loadResultsForRequests(response.data);
      } else {
        setRequestsWithResults([]);
        setFilteredList([]);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
      if (list.length > 0) {
        await loadResultsForRequests(list);
      }
    } finally {
      setLoadingResults(false);
    }
  };

  const handleRequestClick = (request: RequestWithResult) => {
    if (!request.id) return;
    navigate(`${ROUTES.REQUESTS}/${request.id}`);
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

  return (
    <Container className={styles.mainContainer}>
      <h2 className={styles.pageTitle}>Мои заявки</h2>
      
      <Card className={styles.filterCard}>
        <Card.Body>
          <Form>
            <Row className="align-items-end">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Статус</Form.Label>
                  <Form.Select 
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
              
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Дата от</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Дата до</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </Form.Group>
              </Col>
              
              <Col md={3} className="d-flex align-items-end">
                <Button 
                  type="button"
                  onClick={handleApplyFilters}
                  className={`${styles.applyButton} me-2`}
                  disabled={loadingList || loadingResults}
                >
                  {loadingResults ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Применение...
                    </>
                  ) : (
                    'Применить'
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      
      {loadingList ? (
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
          {filteredList.map((request) => (
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
                  </div>
                  <div className={styles.headerRight}>
                    <div
                      className={styles.statusBadge}
                    >
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
                  
                  {request.moderator_login && (
                    <div className={styles.moderatorContainer}>
                      <span className={styles.moderatorLabel}>Модератор:</span>
                      <span className={styles.moderatorName}>{request.moderator_login}</span>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};