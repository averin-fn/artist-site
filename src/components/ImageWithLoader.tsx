import React, { useState, useCallback, useRef, useEffect } from 'react';
import './ImageWithLoader.css';

interface ImageWithLoaderProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  onMouseDown?: (e: React.MouseEvent<HTMLImageElement>) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLImageElement>) => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
}

const ImageWithLoader: React.FC<ImageWithLoaderProps> = ({
  src,
  alt,
  className = '',
  style,
  loading = 'lazy',
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(loading === 'eager');
  const imgRef = useRef<HTMLImageElement>(null);

  // Используем Intersection Observer для ленивой загрузки
  useEffect(() => {
    if (loading === 'eager' || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Загружаем изображения за 50px до видимости
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [loading, shouldLoad]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  return (
    <div className="image-with-loader" ref={imgRef}>
      {isLoading && shouldLoad && (
        <div className="image-loader">
          <div className="loader-spinner"></div>
        </div>
      )}
      {hasError ? (
        <div className="image-error">Не удалось загрузить изображение</div>
      ) : shouldLoad ? (
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoading ? 'loading' : 'loaded'}`}
          style={style}
          onLoad={handleLoad}
          onError={handleError}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          decoding="async"
        />
      ) : (
        <div className="image-placeholder" />
      )}
    </div>
  );
};

export default React.memo(ImageWithLoader);
