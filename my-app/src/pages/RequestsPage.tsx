import { Container, Table, Spinner } from 'react-bootstrap';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchSpeedRequestsList } from '../slices/speedRequestsSlice';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';

export const RequestsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { list, loadingList } = useSelector((state: RootState) => state.speedRequests);

  useEffect(() => {
    dispatch(fetchSpeedRequestsList());
  }, [dispatch]);

  return (
    <Container style={{ marginTop: '120px' }}>
      <h2 className="mb-4">Мои заявки</h2>
      {loadingList ? (
        <div className="d-flex justify-content-center py-4">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Номер заявки</th>
              <th>Статус</th>
              <th>Дата создания</th>
            </tr>
          </thead>
          <tbody>
            {list.map((req, index) => (
              <tr
                key={req.id}
                style={{ cursor: 'pointer' }}
                onClick={() => req.id && navigate(`${ROUTES.REQUESTS}/${req.id}`)}
              >
                <td>{index + 1}</td>
                <td>{req.id}</td>
                <td>{req.status}</td>
                <td>{req.creation_date}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};


