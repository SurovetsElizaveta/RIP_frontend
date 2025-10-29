import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Tab, Tabs } from 'react-bootstrap';
import { api } from '../api/api';

interface AuthModalProps {
  show: boolean;
  onHide: () => void;
  onAuthSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ show, onHide, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (activeTab === 'login') {
        response = await api.signIn(login, password);
      } else {
        response = await api.signUp(login, password);
      }

      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      onAuthSuccess();
      onHide();
      setLogin('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Авторизация</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || 'login')}
          className="mb-3"
        >
          <Tab eventKey="login" title="Вход">
            <Form onSubmit={handleSubmit}>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form.Group className="mb-3">
                <Form.Label>Логин</Form.Label>
                <Form.Control
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Пароль</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Загрузка...' : 'Войти'}
              </Button>
            </Form>
          </Tab>
          <Tab eventKey="register" title="Регистрация">
            <Form onSubmit={handleSubmit}>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form.Group className="mb-3">
                <Form.Label>Логин</Form.Label>
                <Form.Control
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Пароль</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <Form.Text className="text-muted">
                  Пароль должен содержать минимум 6 символов
                </Form.Text>
              </Form.Group>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Загрузка...' : 'Зарегистрироваться'}
              </Button>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;