import React, { useState } from 'react';
import PaintingCard from '../components/PaintingCard';
import Modal from '../components/Modal';
import PaintingDetails from '../components/PaintingDetails';
import generalData from '../config/general.json';
import './Gallery.css';

interface Painting {
  id: number;
  title: string;
  description: string;
  image: string;
  price: number;
  category: string;
  year: number;
  medium: string;
  size: string;
}

const Gallery: React.FC = () => {
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');

  const filteredPaintings =
    selectedCategory === 'Все'
      ? generalData.items
      : generalData.items.filter((item) => item.category === selectedCategory);

  const handleCardClick = (id: number) => {
    const painting = generalData.items.find((item) => item.id === id);
    if (painting) {
      setSelectedPainting(painting);
    }
  };

  return (
    <div className="gallery">
      <div className="gallery-header">
        <h2>Галерея</h2>
        <p>{generalData.description}</p>
      </div>

      <div className="category-filter">
        {generalData.categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="paintings-grid">
        {filteredPaintings.map((painting) => (
          <PaintingCard
            key={painting.id}
            painting={painting}
            onClick={handleCardClick}
          />
        ))}
      </div>

      <Modal
        isOpen={selectedPainting !== null}
        onClose={() => setSelectedPainting(null)}
      >
        {selectedPainting && (
          <PaintingDetails
            title={selectedPainting.title}
            description={selectedPainting.description}
            image={selectedPainting.image}
            price={selectedPainting.price}
            year={selectedPainting.year}
            medium={selectedPainting.medium}
            size={selectedPainting.size}
          />
        )}
      </Modal>
    </div>
  );
};

export default Gallery;
