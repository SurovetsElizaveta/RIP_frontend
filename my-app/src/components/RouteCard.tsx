import { useNavigate } from 'react-router-dom';
import styles from './RouteCard.module.css';
import type { Route } from '../types/types';
import { ROUTES } from '../routes';
import { Card, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { addRouteToDraft } from '../slices/speedRequestsSlice';

interface RouteCardProps {
  route: Route;
}

export const RouteCard = ({ route }: RouteCardProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  const handleCardClick = () => {
    navigate(`${ROUTES.ROUTES}/${route.RouteID}`);
  };

  const handleAddToDraft = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    await dispatch(addRouteToDraft(route.RouteID));
  };

  return (
    <Card 
      className={styles['route-card-flex']} 
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className={`${styles['card-content-wrapper']} d-flex`}>
        <Card.Body className={`${styles['card-info-flex']} p-3 flex-grow-1`}>
          <div className={styles['card-info-text']}>
            <Card.Title as="h4" className={`${styles['custom-card-title']} mb-2`}>
              {route.Title}
            </Card.Title>
            <Card.Text as="h5" className={`${styles['custom-card-distance']} text-muted`}>
              {route.Distance} km
            </Card.Text>
          </div>
          {isAuthenticated && (
            <Button 
              variant="primary"
              className={`${styles['add-to-draft-btn']} w-100`}
              onClick={handleAddToDraft}
            >
              Добавить в заявку
            </Button>
          )}
        </Card.Body>
        <div className={styles['card-image-container']}>
          <Card.Img 
            className={`${styles['card-img-flex']} h-100`}
            src={route.ImageURL}
            alt={`route${route.RouteID}`}
            onError={(e) => {
              e.currentTarget.src = './images/default_route.svg';
            }}
          />
        </div>
      </div>
    </Card>
  );
};