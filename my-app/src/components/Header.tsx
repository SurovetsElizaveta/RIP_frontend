import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';
import './Header.css'

export const Header: FC = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate(ROUTES.ROUTES);
  };

  return (
    <header>
        <img 
          src="http://127.0.0.1:9000/test/main_ship.svg" 
          alt="home" 
          onClick={handleLogoClick}
        />
    </header>
  );
};