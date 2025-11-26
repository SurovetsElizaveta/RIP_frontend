import { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUserAsync } from '../slices/userSlice';
import type { AppDispatch, RootState } from '../store';
import { ROUTES } from '../routes';
import styles from './LoginPage.module.css'; // Импорт стилей

export const LoginPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { error, loading } = useSelector((state: RootState) => state.user);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return;
    await dispatch(loginUserAsync(formData));
    navigate(ROUTES.ROUTES);
  };

  return (
    <Container className={styles.loginContainer}>
      <h2 className={styles.loginTitle}>Вход</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className={styles.formGroup}>
          <Form.Label className={styles.formLabel}>Имя пользователя</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Введите имя пользователя"
            className={styles.formControl}
          />
        </Form.Group>
        <Form.Group className={styles.formGroup}>
          <Form.Label className={styles.formLabel}>Пароль</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Введите пароль"
            className={styles.formControl}
          />
        </Form.Group>
        <Button
          type="submit"
          variant="primary"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Вход...' : 'Войти'}
        </Button>
        <Button
          type="button"
          variant="link"
          className={styles.registerButton}
          onClick={() => navigate(ROUTES.REGISTER)}
        >
          Нет аккаунта? Зарегистрируйтесь
        </Button>
      </Form>
    </Container>
  );
};