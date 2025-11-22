import { Badge, Button } from 'react-bootstrap';
import { getDraftInfo } from "../api/api";
import { useEffect, useState, type FC } from "react";
import styles from './RequestLink.module.css';

export const RequestLink: FC = () => {
  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    const fetchDraftInfo = async () => {
      const draftInfo = await getDraftInfo();
      setDraftCount(draftInfo.count);
    };
    fetchDraftInfo();
  }, []);

  const hasItems = draftCount > 0;

  return (
    <Button 
      className={`${styles['requestLink']} ${hasItems ? styles['requestLinkFilled'] : styles['requestLinkEmpty']}`}
    >
      <img 
        src="./images/sea_request_null.svg" 
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