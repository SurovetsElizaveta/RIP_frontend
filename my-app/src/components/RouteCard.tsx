import { useNavigate } from 'react-router-dom';
import './RouteCard.css';
import type { Route } from '../types/types';
import { ROUTES } from '../routes';

interface RouteCardProps {
  route: Route;
  onAddToDraft?: (routeId: number) => void;
}

export const RouteCard = ({ route, onAddToDraft }: RouteCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`${ROUTES.ROUTES}/${route.RouteID}`);
  };

  const handleAddToDraft = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToDraft?.(route.RouteID);
  };

  return (
    <div className="route-card-flex" onClick={handleCardClick}>
      <div className="card-info-flex">
        <div className="card-info-text">
          <h4>{route.Title}</h4>
          <h5>{route.Distance} km</h5>
        </div>
        <button 
          type="button" 
          className="add-to-draft-btn"
          onClick={handleAddToDraft}
        >
          Добавить в заявку
        </button>
      </div>
      <img 
        className="card-img-flex" 
        src={route.ImageURL} 
        alt={`route${route.RouteID}`} 
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/images/default_route.svg';
        }}
      />
    </div>
  );
};