import React, { useState, ImgHTMLAttributes } from 'react';

interface ImageFallbackProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  fallbackSrc?: string;
  alt: string;
}

const ImageFallback: React.FC<ImageFallbackProps> = ({ 
  src, 
  fallbackSrc = '/placeholder.svg', 
  alt, 
  className,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imageSrc !== fallbackSrc) {
      setHasError(true);
      setImageSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setHasError(false);
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};

export default ImageFallback; 