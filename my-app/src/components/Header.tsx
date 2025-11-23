import type { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { ROUTES } from '../routes';
import styles from './Header.module.css';
import { useState } from 'react';

export const Header: FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <Navbar className={styles['custom-header']} fixed="top">
      <Container fluid className={styles['header-container']}>
        <div className={styles['header-left']}>
          <Navbar.Brand 
            as={Link} 
            to={ROUTES.HOME}
            className={styles['custom-navbar-brand']}
            onClick={closeMobileMenu}
          >
            <img 
              src="./images/main_ship.svg" 
              alt="Главная страница" 
              className={styles['header-logo']}
            />
          </Navbar.Brand>
          
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

        <div 
          className={`${styles['nav-mobile-wrapper']} ${isMobileMenuOpen ? styles['active'] : ''}`}
          onClick={toggleMobileMenu}
        >
          <div className={styles['nav-mobile-target']}></div>
          
          <div className={styles['nav-mobile-menu']}>
            <Nav.Link 
              as={Link}
              to={ROUTES.HOME}
              className={styles['nav-link']}
              onClick={closeMobileMenu}
            >
              Главная
            </Nav.Link>
            <Nav.Link 
              as={Link}
              to={ROUTES.ROUTES}
              className={styles['nav-link']}
              onClick={closeMobileMenu}
            >
              Маршруты
            </Nav.Link>
          </div>
        </div>
      </Container>
    </Navbar>
  );
};