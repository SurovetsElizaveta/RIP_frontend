import { useState, type FC, type FormEvent } from "react";
import './FilterBar.css'
import { useNavigate } from "react-router-dom";
import { Button, Col, Form, Row } from "react-bootstrap";

export const FilterBar = () => {
  const navigate = useNavigate();
  const [minDistance, setMinDistance] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const min = minDistance ? Number(minDistance) : 0;
    const max = maxDistance ? Number(maxDistance) : 0;
    
    navigate(`/routes?min_distance=${min}&max_distance=${max}`);
  };

  const handleReset = () => {
    setMinDistance('');
    setMaxDistance('');
    navigate('/routes');
  };

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    value = value.replace(/^0+/, '') || '';
    
    setter(value);
  };

 return (
  <Form onSubmit={handleSubmit} className="distance-filter-bar">
    <Row className="align-items-center g-2">
      <Col xs="auto">
        <Form.Label className="mb-0">Расстояние от</Form.Label>
      </Col>
      <Col xs="auto">
        <Form.Control
          className="distance-filter-input"
          type="number"
          name="min_distance"
          value={minDistance}
          onChange={handleInputChange(setMinDistance)}
          min="0"
        />
      </Col>
      <Col xs="auto">
        <Form.Label className="mb-0">до</Form.Label>
      </Col>
      <Col xs="auto">
        <Form.Control
          className="distance-filter-input"
          type="number"
          name="max_distance"
          value={maxDistance}
          onChange={handleInputChange(setMaxDistance)}
          min="0"
        />
      </Col>
      <Col xs="auto">
        <Button 
          type="submit" 
          className="distance-filter-btn"
        >
          Применить
        </Button>
      </Col>
      <Col xs="auto">
        <Button 
          type="button" 
          className="distance-filter-btn"
          onClick={handleReset}
          variant="outline-secondary"
        >
          Сбросить
        </Button>
      </Col>
    </Row>
  </Form>
);
};