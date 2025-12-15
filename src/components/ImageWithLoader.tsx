import React, { useState } from 'react';
import './ImageWithLoader.css';

interface ImageWithLoaderProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
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
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="image-with-loader">
      {isLoading && (
        <div className="image-loader">
          <div className="loader-spinner"></div>
        </div>
      )}
      {hasError ? (
        <div className="image-error">Не удалось загрузить изображение</div>
      ) : (
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
        />
      )}
    </div>
  );
};

export default ImageWithLoader;
