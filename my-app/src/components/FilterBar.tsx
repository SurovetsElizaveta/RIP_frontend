import { useState, type FC, type FormEvent, useEffect } from "react";
import styles from './FilterBar.module.css';
import { useNavigate } from "react-router-dom";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { setDistanceFilterAction, clearFiltersAction, useFilters } from "../slices/filterSlice";

export const FilterBar: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const filters = useFilters();
  
  const [minDistance, setMinDistance] = useState<string>(
    filters.minDistance ? filters.minDistance.toString() : ''
  );
  const [maxDistance, setMaxDistance] = useState<string>(
    filters.maxDistance ? filters.maxDistance.toString() : ''
  );

  useEffect(() => {
    setMinDistance(filters.minDistance ? filters.minDistance.toString() : '');
    setMaxDistance(filters.maxDistance ? filters.maxDistance.toString() : '');
  }, [filters.minDistance, filters.maxDistance]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const min = minDistance ? Number(minDistance) : null;
    const max = maxDistance ? Number(maxDistance) : null;
    
    dispatch(setDistanceFilterAction({
      minDistance: min,
      maxDistance: max
    }));
    
    navigate(`/routes?min_distance=${min || ''}&max_distance=${max || ''}`);
  };

  const handleReset = () => {
    setMinDistance('');
    setMaxDistance('');
    
    dispatch(clearFiltersAction());
    
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
    <Form onSubmit={handleSubmit} className={styles['distance-filter-bar']}>
      <Row className="align-items-center g-2">
        <Col xs="auto">
          <Form.Label className="mb-0">Расстояние от</Form.Label>
        </Col>
        <Col xs="auto">
          <Form.Control
            className={styles['distance-filter-input']}
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
            className={styles['distance-filter-input']}
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
            className={styles['distance-filter-btn']}
          >
            Применить
          </Button>
        </Col>
        <Col xs="auto">
          <Button 
            type="button" 
            className={styles['distance-filter-btn']}
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