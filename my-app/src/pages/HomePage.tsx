import { Container, Row, Col } from 'react-bootstrap';
import styles from './Home.module.css';

export const HomePage = () => {

  return (
    <div className={styles['videoBackground']}>
      <video 
        autoPlay 
        muted 
        loop 
        playsInline
        className={styles['backgroundVideo']}
      >
        <source src='./videos/ship_home_video.mp4' type="video/mp4" />
        Ваш браузер не поддерживает видео.
      </video>
      
      <div className={styles['videoOverlay']}></div>
      
      <Container fluid className={styles['simpleHomePage']}>
        <Row className="justify-content-center align-items-center w-100 min-vh-100">
          <Col xs={12} md={8} lg={6} xl={5}>
            <div className={styles['simpleContent']}>
              <h1>Морские грузоперевозки</h1>
              <p>
                Современная платформа для планирования и управления морскими 
                грузоперевозками.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};