import type { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { ROUTES } from '../routes';
import styles from './Header.module.css';

export const Header: FC = () => {
  const location = useLocation();

  return (
    <Navbar className={styles['custom-header']} fixed="top">
      <Container fluid className={styles['header-container']}>
        {/* Логотип и ссылка в одной группе */}
        <div className={styles['header-left']}>
          <Navbar.Brand 
            as={Link} 
            to={ROUTES.HOME}
            className={styles['custom-navbar-brand']}
          >
            <img 
              src="/images/main_ship.svg" 
              alt="Главная страница" 
              className={styles['header-logo']}
            />
          </Navbar.Brand>
          
          {/* Ссылка "Маршруты" рядом с логотипом */}
          <Nav className={styles['routes-nav']}>
            <Nav.Link 
              as={Link}
              to={ROUTES.ROUTES}
              className={`${styles['nav-link']} ${
                location.pathname === ROUTES.ROUTES ? styles['active'] : ''
              }`}
            >
              Маршруты
            </Nav.Link>
          </Nav>
        </div>
      </Container>
    </Navbar>
  );
};