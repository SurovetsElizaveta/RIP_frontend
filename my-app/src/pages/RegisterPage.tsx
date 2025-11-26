import { useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '../routes';
import type { AppDispatch, RootState } from '../store';
import { signupUserAsync } from '../slices/userSlice';
import styles from './RegisterPage.module.css'; 

export const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.user);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [localError, setLocalError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setLocalError('');  
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');
  
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setLocalError('Заполните все поля');
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Пароли не совпадают');
      return;
    }
  
    if (formData.password.length < 6) {
      setLocalError('Пароль должен быть не менее 6 символов');
      return;
    }
  
    if (formData.username.length < 3) {
      setLocalError('Имя пользователя должно быть не менее 3 символов');
      return;
    }

    const result = await dispatch(signupUserAsync({
      username: formData.username,
      password: formData.password,
    }));

    if (signupUserAsync.fulfilled.match(result)) {
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <Container className={styles.registerContainer}>
      <h2 className={styles.registerTitle}>Регистрация</h2>
      
      {localError && <Alert variant="danger">{localError}</Alert>}
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
            required
            minLength={3}
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
            required
            minLength={6}
            className={styles.formControl}
          />
        </Form.Group>
        
        <Form.Group className={styles.formGroup}>
          <Form.Label className={styles.formLabel}>Повторите пароль</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Повторите пароль"
            required
            className={styles.formControl}
          />
        </Form.Group>
        
        <Button 
          type="submit" 
          variant="primary" 
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Регистрация...
            </>
          ) : (
            'Зарегистрироваться'
          )}
        </Button>
        
        <Button
          type="button"
          variant="link"
          className={styles.loginButton}
          onClick={() => navigate(ROUTES.LOGIN)}
        >
          Уже есть аккаунт? Войти
        </Button>
      </Form>
    </Container>
  );
};