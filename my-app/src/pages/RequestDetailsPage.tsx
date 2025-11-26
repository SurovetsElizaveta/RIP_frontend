import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchSpeedRequestById } from '../slices/speedRequestsSlice';
import { Container, Spinner, Table } from 'react-bootstrap';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { ROUTES } from '../routes';

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
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  const crumbs = [
    { label: 'Мои заявки', path: ROUTES.REQUESTS },
    { label: `Заявка #${current.speed_request?.id}` },
  ];

  return (
    <Container style={{ marginTop: '120px' }}>
      <BreadCrumbs crumbs={crumbs} />
      <h2 className="mb-3">Заявка #{current.speed_request?.id}</h2>
      <p>Статус: {current.speed_request?.status}</p>
      <p>Дата создания: {current.speed_request?.creation_date}</p>
      <p>Дата отправления: {current.speed_request?.departure_date}</p>

      <h4 className="mt-4 mb-3">Маршруты</h4>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Маршрут</th>
            <th>Расстояние</th>
            <th>Дата прибытия</th>
            <th>Скорость судна</th>
          </tr>
        </thead>
        <tbody>
          {(current.routes || []).map((route, index) => {
            const routeReq = (current.route_req || [])[index];
            return (
              <tr key={route.route_id}>
                <td>{index + 1}</td>
                <td>{route.title}</td>
                <td>{route.distance}</td>
                <td>{routeReq?.arrival_date}</td>
                <td>{routeReq?.ship_speed}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
};


