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

  useEffect(() => {
    dispatch(fetchDraftInfo());
  }, [dispatch]);

  const hasItems = draftCount > 0;

  const handleClick = () => {
    if (!draftId) return;
    navigate(ROUTES.DRAFT);
  };

  return (
    <Button 
      className={`${styles['requestLink']} ${hasItems ? styles['requestLinkFilled'] : styles['requestLinkEmpty']}`}
      onClick={handleClick}
      disabled={!draftId}
    >
      <img 
        src={hasItems ? "./images/sea_request.svg" : "./images/sea_request_null.svg"} 
        alt="request"
        className={styles['requestIcon']}
      />
      <Badge 
        bg="#FFFFFF"
        className={styles['requestCounter']}
      >
        {draftCount}
      </Badge>
    </Button>
  );
};