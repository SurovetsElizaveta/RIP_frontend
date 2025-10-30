import React from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';
import styles from './BreadCrumbs.module.css';

interface Crumb {
  label: string;
  path?: string;
}

interface BreadCrumbsProps {
  crumbs: Crumb[];
}

export const BreadCrumbs: FC<BreadCrumbsProps> = ({ crumbs }) => {
  return (
    <ul className={styles['breadcrumbs']}>
      <li>
        <Link to={ROUTES.HOME}>Главная</Link>
      </li>
      {crumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          <li className={styles['slash']}>/</li>
          {index === crumbs.length - 1 ? (
            <li>{crumb.label}</li>
          ) : (
            <li>
              <Link to={crumb.path || ''}>{crumb.label}</Link>
            </li>
          )}
        </React.Fragment>
      ))}
    </ul>
  );
};