import { Container, Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import type { RootState, AppDispatch } from '../store';
import { api } from '../api';
import { loginUserAsync } from '../slices/userSlice';
import styles from './ProfilePage.module.css';

export const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { username, loading } = useSelector((state: RootState) => state.user);

  const [formData, setFormData] = useState({
    currentLogin: username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setMessage('');
    setError('');
  };

  const handleUpdateLogin = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.currentLogin || formData.currentLogin === username) {
      setError('Введите новый логин');
      return;
    }

    if (formData.currentLogin.length < 3) {
      setError('Логин должен быть не менее 3 символов');
      return;
    }

    try {
      const response = await api.users.putUsers({
        login: formData.currentLogin,
      });

      if (response.data.message) {
        setMessage('Логин успешно изменен');
        dispatch(loginUserAsync({
          username: formData.currentLogin,
          password: '', 
        }));
      }
    } catch (error: any) {
      console.error('Update login error:', error);
      const serverMessage = error.response?.data?.error || 
                           error.response?.data?.message ||
                           'Ошибка при изменении логина';
      setError(serverMessage);
    }
  };

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.newPassword) {
      setError('Введите новый пароль');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Новый пароль должен быть не менее 6 символов');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      const response = await api.users.putUsers({
        password: formData.newPassword,
      });

      if (response.data.message) {
        setMessage('Пароль успешно изменен');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      }
    } catch (error: any) {
      console.error('Update password error:', error);
      const serverMessage = error.response?.data?.error || 
                           error.response?.data?.message ||
                           'Ошибка при изменении пароля';
      setError(serverMessage);
    }
  };

  return (
    <Container className={styles.profileContainer}>
      <h2 className={styles.profileTitle}>Личный кабинет</h2>
      
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className={styles.formCard}>
        <Card.Body>
          <Form onSubmit={handleUpdateLogin}>
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>Логин</Form.Label>
              <Form.Control
                type="text"
                name="currentLogin"
                value={formData.currentLogin}
                onChange={handleChange}
                placeholder="Введите новый логин"
                minLength={3}
                className={styles.formControl}
              />
            </Form.Group>
            <Button 
              type="submit" 
              variant="primary" 
              className={styles.submitButton}
              disabled={loading || formData.currentLogin === username}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Сохранение...
                </>
              ) : (
                'Сохранить логин'
              )}
            </Button>
          </Form>
          <Form onSubmit={handleUpdatePassword}>
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>Новый пароль</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Введите новый пароль"
                minLength={6}
                className={styles.formControl}
              />
            </Form.Group>
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>Подтвердите пароль</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Повторите новый пароль"
                className={styles.formControl}
              />
            </Form.Group>
            <Button 
              type="submit" 
              variant="primary" 
              className={styles.submitButton}
              disabled={loading || !formData.newPassword || !formData.confirmPassword}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Сохранение...
                </>
              ) : (
                'Изменить пароль'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};