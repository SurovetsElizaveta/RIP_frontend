import { type FC, type FormEvent, useState, useRef } from "react";
import styles from './FilterBar.module.css';
import { useNavigate } from "react-router-dom";
import { Button, Col, Form, Row, Overlay, Popover } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { 
    useMinDistance, 
    useMaxDistance, 
    setMinDistanceAction, 
    setMaxDistanceAction
} from "../slices/filterSlice";

interface FilterBarProps {
  onImageSearchClick?: () => void;
  showImageSearchButton?: boolean;
  onImageUpload?: (file: File) => void;
  isModelReady?: boolean;
  isProcessingImage?: boolean;
}

export const FilterBar: FC<FilterBarProps> = ({ 
  onImageSearchClick,
  showImageSearchButton = true,
  onImageUpload,
  isModelReady = true,
  isProcessingImage = false
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const targetRef = useRef<HTMLButtonElement>(null);
  
  const minDistance = useMinDistance();
  const maxDistance = useMaxDistance();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const min = minDistance ? Number(minDistance) : "";
    const max = maxDistance ? Number(maxDistance) : "";
    
    navigate(`/routes?min_distance=${min}&max_distance=${max}`);
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

  const handleImageButtonClick = () => {
    if (onImageSearchClick) {
      onImageSearchClick();
    } else {
      setShowImageUpload(!showImageUpload);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      setUploadedImage(file);
      onImageUpload(file);
      setShowImageUpload(false); // Закрываем после загрузки
    }
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit} className={styles['distance-filter-bar']}>
        <Row className="align-items-center g-2">
          <Col xs="auto">
            <Form.Label className="mb-0" style={{ color: '#333333', fontSize: '14px' }}>
              Расстояние от
            </Form.Label>
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
            <Form.Label className="mb-0" style={{ color: '#333333', fontSize: '14px' }}>
              до
            </Form.Label>
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
          
          {showImageSearchButton && (
            <Col xs="auto">
              <Button 
                ref={targetRef}
                variant={uploadedImage ? "success" : "outline-primary"}
                onClick={handleImageButtonClick}
                className={`${styles['image-search-btn']} ${showImageUpload ? styles['active'] : ''} p-2 position-relative`}
                title={uploadedImage ? "Изображение загружено" : "Поиск по изображению"}
                disabled={!isModelReady || isProcessingImage}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                </svg>
                
                {uploadedImage && (
                  <span className={`${styles['upload-indicator']} position-absolute`}>
                    <span className="visually-hidden">Изображение загружено</span>
                  </span>
                )}
              </Button>
            </Col>
          )}
        </Row>
      </Form>

      <Overlay
        show={showImageUpload}
        target={targetRef.current}
        placement="bottom"
        container={targetRef.current}
        containerPadding={20}
        rootClose
        onHide={() => setShowImageUpload(false)}
      >
        <Popover id="image-upload-popover" className={styles['image-upload-popover']}>
          <Popover.Header as="h3" className={`${styles['popover-header']} text-center`}>
            Поиск по изображению
            <Button 
              variant="link" 
              className={`${styles['close-btn']} p-0 position-absolute end-0 top-0 me-2`}
              onClick={() => setShowImageUpload(false)}
            >
              ×
            </Button>
          </Popover.Header>
          <Popover.Body>
            <div className="text-center">
              {uploadedImage ? (
                <div className="mb-3">
                  <img 
                    src={URL.createObjectURL(uploadedImage)} 
                    alt="Загруженное изображение" 
                    className={`${styles['uploaded-image']} img-fluid rounded mb-2`}
                  />
                  <div className="small text-muted mb-3" style={{ fontSize: '13px', color: '#666666' }}>
                    {uploadedImage.name} ({(uploadedImage.size / 1024).toFixed(1)} KB)
                  </div>
                  <div className="d-flex gap-2 justify-content-center">
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={handleClearImage}
                      className={styles['upload-secondary-btn']}
                    >
                      Удалить
                    </Button>
                    <Button 
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        if (uploadedImage && onImageUpload) {
                          onImageUpload(uploadedImage);
                        }
                        setShowImageUpload(false);
                      }}
                      className={styles['upload-action-btn']}
                    >
                      Искать
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div 
                    className={`${styles['upload-placeholder']} mb-3`}
                    onClick={() => fileInputRef.current?.click()}
                    style={{ cursor: 'pointer' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M4.5 5a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 1 0V7h1.5a.5.5 0 0 0 0-1h-2zm3 0a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 1 0V8.5h1.5a.5.5 0 0 0 0-1h-2zm3.5-.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V6.5H9.5a.5.5 0 0 1 0-1h2z"/>
                      <path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2zm12 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h12z"/>
                    </svg>
                    <div className="mt-2 small text-muted">
                      Перетащите сюда или нажмите для выбора
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                    
                    <Button 
                      variant="primary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!isModelReady || isProcessingImage}
                      className={styles['choose-file-btn']}
                    >
                      {isProcessingImage ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Обработка...
                        </>
                      ) : (
                        'Выбрать изображение'
                      )}
                    </Button>
                  </div>
                  
                  {!isModelReady && (
                    <div className={`${styles['model-loading-alert']} alert alert-warning small mb-0 d-flex align-items-center`}>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Модель загружается...
                    </div>
                  )}
                </>
              )}
            </div>
          </Popover.Body>
        </Popover>
      </Overlay>
    </>
  );
};