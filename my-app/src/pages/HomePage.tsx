import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';
import styles from './Home.module.css';

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.simpleHomePage}>
      <div className={styles.simpleContent}>
        <h1>Морские грузоперевозки</h1>
        <p>
          Современная платформа для планирования и управления морскими 
          грузоперевозками. Оптимизируйте ваши логистические процессы 
          с помощью наших инструментов.
        </p>
        <button 
          className={styles.simpleButton}
          onClick={() => navigate(ROUTES.ROUTES)}
        >
          Перейти к маршрутам
        </button>
      </div>
    </div>
  );
};