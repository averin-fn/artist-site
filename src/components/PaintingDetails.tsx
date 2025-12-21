import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Plus, Minus } from 'lucide-react';
import ImageWithLoader from './ImageWithLoader';
import './PaintingDetails.css';

interface PaintingDetailsProps {
  title: string;
  description: string;
  images: string[];
  price: number;
  year: number;
  medium: string;
  size: string;
  onNext?: () => void;
  onPrevious?: () => void;
  totalCount?: number;
  currentIndex?: number;
}

const PaintingDetails: React.FC<PaintingDetailsProps> = ({
  title,
  description,
  images,
  price,
  year,
  medium,
  size,
  onNext,
  onPrevious,
  totalCount,
  currentIndex,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [currentIndex, title]);

  // Сброс увеличения при переключении изображения
  useEffect(() => {
    setScale(1);
    setPanX(0);
    setPanY(0);
    panRef.current = { x: 0, y: 0 };
  }, [currentImageIndex]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  }, [images.length]);

  const handleSelectImage = useCallback((index: number) => {
    setCurrentImageIndex(index);
  }, []);

  const toggleZoom = useCallback(() => {
    setIsZoomed((prev) => !prev);
    setScale(1);
    setPanX(0);
    setPanY(0);
    panRef.current = { x: 0, y: 0 };
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const newScale = Math.max(prev - 0.5, 1);
      if (newScale <= 1) {
        setPanX(0);
        setPanY(0);
        panRef.current = { x: 0, y: 0 };
      }
      return newScale;
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (scale > 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - panRef.current.x,
        y: e.clientY - panRef.current.y,
      };
      e.preventDefault();
    }
  }, [scale]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (!isDragging || scale <= 1) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const moveX = e.clientX - dragStartRef.current.x;
      const moveY = e.clientY - dragStartRef.current.y;

      const maxPan = (scale - 1) * 150;
      const newPanX = Math.max(-maxPan, Math.min(maxPan, moveX));
      const newPanY = Math.max(-maxPan, Math.min(maxPan, moveY));

      panRef.current = { x: newPanX, y: newPanY };
      setPanX(newPanX);
      setPanY(newPanY);
    });
  }, [isDragging, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="painting-details">
      <div className="image-section">
        <div className="details-image-wrapper">
          {images.length > 1 && (
            <button
              className="image-nav-button prev-image"
              onClick={handlePrevImage}
              aria-label="Предыдущее изображение"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <ImageWithLoader
            src={images[currentImageIndex]}
            alt={`${title} - изображение ${currentImageIndex + 1}`}
            className="details-image"
          />
          {images.length > 1 && (
            <button
              className="image-nav-button next-image"
              onClick={handleNextImage}
              aria-label="Следующее изображение"
            >
              <ChevronRight size={24} />
            </button>
          )}
          <button
            className="zoom-button"
            onClick={toggleZoom}
            aria-label="Увеличить изображение"
            title="Развернуть на весь экран"
          >
            <Maximize2 size={20} />
          </button>
          {images.length > 1 && (
            <div className="image-counter">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="images-gallery">
            {images.map((img, index) => (
              <button
                key={index}
                className={`gallery-thumbnail ${
                  index === currentImageIndex ? 'active' : ''
                }`}
                onClick={() => handleSelectImage(index)}
                aria-label={`Изображение ${index + 1}`}
              >
                <ImageWithLoader src={img} alt={`Превью ${index + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {isZoomed && (
        <div className="zoom-overlay" onClick={() => setIsZoomed(false)}>
          <button
            className="zoom-close"
            onClick={() => setIsZoomed(false)}
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>
          
          {images.length > 1 && (
            <>
              <button
                className="zoom-nav-button zoom-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                aria-label="Предыдущее изображение"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                className="zoom-nav-button zoom-next"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                aria-label="Следующее изображение"
              >
                <ChevronRight size={32} />
              </button>
              <div className="zoom-image-counter">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}
          
          <div className="zoom-controls">
            <button
              className="zoom-control-button"
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              disabled={scale <= 1}
              aria-label="Уменьшить"
              title="Уменьшить"
            >
              <Minus size={20} />
            </button>
            <button
              className="zoom-control-button"
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              disabled={scale >= 3}
              aria-label="Увеличить"
              title="Увеличить"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="zoom-container" onClick={(e) => e.stopPropagation()}>
            <ImageWithLoader
              src={images[currentImageIndex]}
              alt={`${title} - увеличено`}
              className="zoom-image"
              loading="eager"
              style={{
                transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'auto',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        </div>
      )}

      <div className="details-content">
        <h2 className="details-title">{title}</h2>
        <p className="details-description">{description}</p>

        <div className="details-info">
          <div className="info-item">
            <span className="info-label">Год:</span>
            <span className="info-value">{year}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Техника:</span>
            <span className="info-value">{medium}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Размер:</span>
            <span className="info-value">{size}</span>
          </div>
        </div>

        <div className="details-footer">
          <span className="details-price">{price.toLocaleString('ru-RU')} ₽</span>
          <button className="buy-button">Купить</button>
        </div>
      </div>

      <div className="details-nav-controls">
        {onPrevious && (
          <button
            className="details-nav-button prev-button"
            onClick={onPrevious}
            aria-label="Предыдущая картина"
          >
            ‹ Назад
          </button>
        )}
        <div className="details-counter">
          Картина {currentIndex} / {totalCount}
        </div>
        {onNext && (
          <button
            className="details-nav-button next-button"
            onClick={onNext}
            aria-label="Следующая картина"
          >
            Вперед ›
          </button>
        )}
      </div>
    </div>
  );
};

export default PaintingDetails;
