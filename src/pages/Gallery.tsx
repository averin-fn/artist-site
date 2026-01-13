import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

// Мемоизированный компонент кнопки категории
const CategoryButton = React.memo<{
  category: string;
  isActive: boolean;
  onClick: (category: string) => void;
}>(({ category, isActive, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(category);
  }, [category, onClick]);

  return (
    <button
      className={`category-btn ${isActive ? 'active' : ''}`}
      onClick={handleClick}
    >
      {category}
    </button>
  );
});

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

  // Мемоизация фильтрованных работ
  const filteredPaintings = useMemo(() => {
    return selectedCategory === 'Все'
      ? paintings
      : paintings.filter((item) => item.category === selectedCategory);
  }, [paintings, selectedCategory]);

  const handleCardClick = useCallback((id: number) => {
    const painting = paintings.find((item) => item.id === id);
    if (painting) {
      setSelectedPainting(painting);
    }
  }, [paintings]);

  const handleNextPainting = useCallback(() => {
    if (!selectedPainting) return;
    const currentIndex = paintings.findIndex(
      (item) => item.id === selectedPainting.id
    );
    const nextIndex = (currentIndex + 1) % paintings.length;
    setSelectedPainting(paintings[nextIndex]);
  }, [selectedPainting, paintings]);

  const handlePreviousPainting = useCallback(() => {
    if (!selectedPainting) return;
    const currentIndex = paintings.findIndex(
      (item) => item.id === selectedPainting.id
    );
    const prevIndex =
      currentIndex === 0 ? paintings.length - 1 : currentIndex - 1;
    setSelectedPainting(paintings[prevIndex]);
  }, [selectedPainting, paintings]);

  if (loading) {
    return <div className="gallery"><div className="loading">Загрузка...</div></div>;
  }

  return (
    <div className="gallery">
      <div className="category-filter">
        {categories.map((category) => (
          <CategoryButton
            key={category}
            category={category}
            isActive={selectedCategory === category}
            onClick={setSelectedCategory}
          />
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
