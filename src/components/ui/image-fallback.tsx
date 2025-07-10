import React, { useState, ImgHTMLAttributes } from 'react';

interface ImageFallbackProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  fallbackSrc?: string;
  alt: string;
  showLoadingPlaceholder?: boolean;
}

const ImageFallback: React.FC<ImageFallbackProps> = ({ 
  src, 
  fallbackSrc = '/placeholder.svg', 
  alt, 
  className = '',
  showLoadingPlaceholder = true,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = 2;

  const handleError = () => {
    console.log(`Image failed to load: ${imageSrc}`);
    
    // Try to retry loading the original image first
    if (retryCount < maxRetries && imageSrc === src) {
      console.log(`Retrying image load (attempt ${retryCount + 1}/${maxRetries}): ${src}`);
      setRetryCount(prev => prev + 1);
      // Force reload by adding timestamp (handle existing query params properly)
      const separator = src.includes('?') ? '&' : '?';
      setImageSrc(`${src}${separator}t=${Date.now()}`);
      return;
    }

    // If retries failed or we're already on fallback, use fallback
    if (!hasError && imageSrc !== fallbackSrc) {
      console.log(`Using fallback image: ${fallbackSrc}`);
      setHasError(true);
      setImageSrc(fallbackSrc);
      setRetryCount(0);
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setHasError(false);
    setIsLoading(false);
    if (retryCount > 0) {
      console.log(`Image loaded successfully after ${retryCount} retries: ${imageSrc}`);
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Loading Placeholder */}
      {isLoading && showLoadingPlaceholder && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Actual Image */}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        onLoadStart={handleLoadStart}
        {...props}
      />
      
      {/* Error Badge (only show if using fallback) */}
      {hasError && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-75">
          Image Error
        </div>
      )}
    </div>
  );
};

export default ImageFallback; 