import React, { useState, useEffect } from 'react';
import PaintingCard from '../components/PaintingCard';
import Modal from '../components/Modal';
import PaintingDetails from '../components/PaintingDetails';
import { getArtworks } from '../services/api';
import './Gallery.css';

interface Painting {
  id: number;
  title: string;
  description: string;
  images: string[];
  price: number;
  category: string;
  year: number;
  medium: string;
  size: string;
}

const Gallery: React.FC = () => {
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['Все']);

  useEffect(() => {
    loadArtworks();
  }, []);

  const loadArtworks = async () => {
    try {
      setLoading(true);
      const data = await getArtworks();
      setPaintings(data);
      
      // Извлекаем уникальные категории
      const uniqueCategories: string[] = ['Все', ...Array.from(new Set(data.map((item) => item.category)))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Ошибка загрузки работ:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPaintings =
    selectedCategory === 'Все'
      ? paintings
      : paintings.filter((item) => item.category === selectedCategory);

  const handleCardClick = (id: number) => {
    const painting = paintings.find((item) => item.id === id);
    if (painting) {
      setSelectedPainting(painting);
    }
  };

  const handleNextPainting = () => {
    if (!selectedPainting) return;
    const currentIndex = paintings.findIndex(
      (item) => item.id === selectedPainting.id
    );
    const nextIndex = (currentIndex + 1) % paintings.length;
    setSelectedPainting(paintings[nextIndex]);
  };

  const handlePreviousPainting = () => {
    if (!selectedPainting) return;
    const currentIndex = paintings.findIndex(
      (item) => item.id === selectedPainting.id
    );
    const prevIndex =
      currentIndex === 0 ? paintings.length - 1 : currentIndex - 1;
    setSelectedPainting(paintings[prevIndex]);
  };

  if (loading) {
    return <div className="gallery"><div className="loading">Загрузка...</div></div>;
  }

  return (
    <div className="gallery">
      <div className="gallery-header">
        <h2>Галерея</h2>
        <p>Коллекция моих работ</p>
      </div>

      <div className="category-filter">
        {categories.map((category) => (
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
        {filteredPaintings.length === 0 ? (
          <p>Работы не найдены</p>
        ) : (
          filteredPaintings.map((painting) => (
            <PaintingCard
              key={painting.id}
              painting={{
                ...painting,
                image: painting.images && painting.images.length > 0 ? painting.images[0] : '',
              }}
              onClick={handleCardClick}
            />
          ))
        )}
      </div>

      <Modal
        isOpen={selectedPainting !== null}
        onClose={() => setSelectedPainting(null)}
      >
        {selectedPainting && (
          <PaintingDetails
            title={selectedPainting.title}
            description={selectedPainting.description}
            images={selectedPainting.images}
            price={selectedPainting.price}
            year={selectedPainting.year}
            medium={selectedPainting.medium}
            size={selectedPainting.size}
            onNext={handleNextPainting}
            onPrevious={handlePreviousPainting}
            totalCount={paintings.length}
            currentIndex={
              paintings.findIndex(
                (item) => item.id === selectedPainting.id
              ) + 1
            }
          />
        )}
      </Modal>
    </div>
  );
};

export default Gallery;
