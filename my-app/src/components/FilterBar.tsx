import { useState, type FC, type FormEvent } from "react";
import './FilterBar.css'
import { useNavigate } from "react-router-dom";

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
    <form className="distance-filter-bar" onSubmit={handleSubmit}>
      <h4>Расстояние от</h4>
      <input 
        className="distance-filter-input" 
        type="number" 
        name="min_distance" 
        value={minDistance}
        onChange={handleInputChange(setMinDistance)}
        min="0"
      />
      <h4>до</h4>
      <input 
        className="distance-filter-input" 
        type="number" 
        name="max_distance" 
        value={maxDistance}
        onChange={handleInputChange(setMaxDistance)}
        min="0"
      />
      <button className="distance-filter-btn" type="submit">
        Применить
      </button>
      <button 
        type="button" 
        className="distance-filter-btn" 
        onClick={handleReset}
      >
        Сбросить
      </button>
    </form>
  );
};