import React from 'react';
import './PaintingDetails.css';

interface PaintingDetailsProps {
  title: string;
  description: string;
  image: string;
  price: number;
  year: number;
  medium: string;
  size: string;
}

const PaintingDetails: React.FC<PaintingDetailsProps> = ({
  title,
  description,
  image,
  price,
  year,
  medium,
  size,
}) => {
  return (
    <div className="painting-details">
      <img src={image} alt={title} className="details-image" />
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
    </div>
  );
};

export default PaintingDetails;
