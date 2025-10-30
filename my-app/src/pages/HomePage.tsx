import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';
import styles from './Home.module.css';

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Container fluid className={styles['simpleHomePage']}>
      <Row className="justify-content-center align-items-center w-100 min-vh-100">
        <Col xs={12} md={8} lg={6} xl={5}>
          <div className={styles['simpleContent']}>
            <h1>Морские грузоперевозки</h1>
            <p>
              Современная платформа для планирования и управления морскими 
              грузоперевозками.
            </p>
            <Button 
              className={styles['simpleButton']}
              onClick={() => navigate(ROUTES.ROUTES)}
              size="lg"
            >
              Перейти к маршрутам
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};