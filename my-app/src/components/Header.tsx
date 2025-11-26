import type { FC } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { ROUTES } from '../routes';
import styles from './Header.module.css';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { logoutUserAsync } from '../slices/userSlice';

export const Header: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, username, loading } = useSelector(
    (state: RootState) => state.user,
  );

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await dispatch(logoutUserAsync());
    navigate(ROUTES.ROUTES);
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
                location.pathname.startsWith(ROUTES.ROUTES)
                  ? styles['active']
                  : ''
              }`}
            >
              Маршруты
            </Nav.Link>
            {isAuthenticated && (
              <Nav.Link
                as={Link}
                to={ROUTES.REQUESTS}
                className={styles['nav-link']}
              >
                Мои заявки
              </Nav.Link>
            )}
          </Nav>
        </div>

        <div className={styles['header-right']}>
          {isAuthenticated ? (
            <div className={styles['auth-buttons']}>
              <Nav className="me-3">
                <Nav.Link
                  as={Link}
                  to={ROUTES.PROFILE}
                  className={styles['nav-link']}
                >
                  {username || 'Профиль'}
                </Nav.Link>
              </Nav>
              <Button
                className={styles['sign-button']}
                onClick={handleLogout}
                disabled={loading}
              >
                Выйти
              </Button>
            </div>
          ) : (
            <Button
            className={styles['sign-button']}
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Войти
            </Button>
          )}
          <div
            className={`${styles['nav-mobile-wrapper']} ${
              isMobileMenuOpen ? styles['active'] : ''
            }`}
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
              {isAuthenticated && (
                <Nav.Link
                  as={Link}
                  to={ROUTES.REQUESTS}
                  className={styles['nav-link']}
                  onClick={closeMobileMenu}
                >
                  Мои заявки
                </Nav.Link>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Navbar>
  );
};