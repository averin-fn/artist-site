import React, { useCallback } from 'react';
import ImageWithLoader from './ImageWithLoader';
import './PaintingCard.css';

interface Painting {
  id: number;
  title: string;
  image: string;
  price: number;
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
        />
      </div>
      <div className="painting-info">
        <h3 className="painting-title">{painting.title}</h3>
        <p className="painting-price">{painting.price.toLocaleString('ru-RU')} ₽</p>
      </div>
    </div>
  );
};

export default React.memo(PaintingCard);
