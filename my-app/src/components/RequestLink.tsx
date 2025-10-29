import { getDraftInfo } from "../api/api";
import { useEffect, useState, type FC } from "react";
import styles from './RequestLink.module.css'

export const RequestLink: FC = () => {
  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    const fetchDraftInfo = async () => {
      const draftInfo = await getDraftInfo();
      setDraftCount(draftInfo.count);
    };
    fetchDraftInfo();
  }, []);

  return (
    <div className={styles.requestLinkEmpty}>
        <img src="http://127.0.0.1:9000/test/sea_request_null.svg" alt="request"/>
        <div className={styles.requestCounterEmpty}>
          <h4>{draftCount}</h4>
        </div>
    </div>
  );
};