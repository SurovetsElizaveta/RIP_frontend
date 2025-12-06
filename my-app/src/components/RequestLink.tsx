import { Badge, Button } from 'react-bootstrap';
import { useEffect, type FC } from "react";
import styles from './RequestLink.module.css';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchDraftInfo } from '../slices/speedRequestsSlice';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';

export const RequestLink: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { draftCount, draftId } = useSelector((state: RootState) => state.speedRequests);
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDraftInfo());
    }
  }, [dispatch, isAuthenticated]);

  const hasItems = draftCount > 0;

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    
    if (draftId) {
      // Если есть черновик - переходим на его страницу
      navigate(`${ROUTES.REQUESTS}/${draftId}`);
    } else {
      // Если нет черновика - переходим на список заявок
      navigate(ROUTES.REQUESTS);
    }
  };

  // Если пользователь не авторизован, не показываем счетчик
  const showBadge = isAuthenticated && draftCount > 0;

  return (
    <Button 
      className={`${styles['requestLink']} ${hasItems ? styles['requestLinkFilled'] : styles['requestLinkEmpty']}`}
      onClick={handleClick}
      disabled={!isAuthenticated}
    >
      <img 
        src={hasItems ? "./images/sea_request.svg" : "./images/sea_request_null.svg"} 
        alt="request"
        className={styles['requestIcon']}
      />
      {showBadge && (
        <Badge 
          bg="#FFFFFF"
          className={styles['requestCounter']}
        >
          {draftCount}
        </Badge>
      )}
    </Button>
  );
};