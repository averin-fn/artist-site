import React, { useCallback } from 'react';
import ImageWithLoader from './ImageWithLoader';
import './PaintingCard.css';

interface Painting {
  id: number;
  title: string;
  image: string;
  price: number | null;
}

interface PaintingCardProps {
  painting: Painting;
  onClick: (id: number) => void;
}

const PaintingCard: React.FC<PaintingCardProps> = ({ painting, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(painting.id);
  }, [painting.id, onClick]);

  return (
    <div className="painting-card" onClick={handleClick}>
      <div className="painting-image-container">
        <ImageWithLoader
          src={painting.image}
          alt={painting.title}
          className="painting-image"
          loading="lazy"
        />
      </div>
      <div className="painting-info">
        <h3 className="painting-title">{painting.title}</h3>
        <p className="painting-price">
          {painting.price ? `${painting.price.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
        </p>
      </div>
    </div>
  );
};

export default React.memo(PaintingCard, (prevProps, nextProps) => {
  // Оптимизированное сравнение для мемоизации
  return (
    prevProps.painting.id === nextProps.painting.id &&
    prevProps.painting.title === nextProps.painting.title &&
    prevProps.painting.image === nextProps.painting.image &&
    prevProps.painting.price === nextProps.painting.price &&
    prevProps.onClick === nextProps.onClick
  );
});
