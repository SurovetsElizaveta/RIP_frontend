import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Container } from 'react-bootstrap';
import { ROUTES } from '../routes';
import styles from './Header.module.css'; // Измените импорт

export const Header: FC = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate(ROUTES.ROUTES);
  };

  return (
    <Navbar className={styles['custom-header']} fixed="top">
      <Container fluid>
        <Navbar.Brand 
          onClick={handleLogoClick} 
          className={styles['custom-navbar-brand']}
          style={{ cursor: 'pointer' }}
        >
          <img 
            src="http://127.0.0.1:9000/test/main_ship.svg" 
            alt="home" 
            className={styles['header-logo']}
          />
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};