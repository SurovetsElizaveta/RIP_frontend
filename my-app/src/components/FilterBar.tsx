import { type FC, type FormEvent } from "react";
import styles from './FilterBar.module.css';
import { useNavigate } from "react-router-dom";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { 
    useMinDistance, 
    useMaxDistance, 
    setMinDistanceAction, 
    setMaxDistanceAction, 
    resetFiltersAction 
} from "../slices/filterSlice";

export const FilterBar: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const minDistance = useMinDistance();
  const maxDistance = useMaxDistance();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const min = minDistance ? Number(minDistance) : "";
    const max = maxDistance ? Number(maxDistance) : "";
    
    navigate(`/routes?min_distance=${min}&max_distance=${max}`);
  };

  const handleReset = () => {
    dispatch(resetFiltersAction());
    navigate('/routes');
  };

  const handleInputChange = (
    setter: (value: string) => void
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value !== '' && value !== '0') {
      value = value.replace(/^0+/, '');
    }
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
            onChange={handleInputChange((value) => dispatch(setMinDistanceAction(value)))}
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
            onChange={handleInputChange((value) => dispatch(setMaxDistanceAction(value)))}
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