// src/components/ProductImageZoom.tsx
import React, { useState, useEffect } from 'react';
import InnerImageZoom from 'react-inner-image-zoom'; // <<<--- Usamos la nueva librería
import { ProductImage } from '../types';
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.css'; // <<<--- Importamos sus estilos base
import './css/ProductImageZoom.css'; // Y nuestros estilos personalizados

interface ProductImageZoomProps {
  images: ProductImage[];
  productName: string;
}

const ProductImageZoom: React.FC<ProductImageZoomProps> = ({ images, productName }) => {
  const [activeImage, setActiveImage] = useState<ProductImage | null>(null);

  useEffect(() => {
    if (images && images.length > 0) {
      setActiveImage(images[0]);
    }
  }, [images]);

  if (!activeImage) {
    return (
      <div className="image-zoom-container">
        <div className="no-product-image-zoom">Sin Imagen</div>
      </div>
    );
  }

  return (
    <div className="image-zoom-container">
      <div className="main-image-wrapper">
        <InnerImageZoom
          src={activeImage.src}
          zoomSrc={activeImage.src} // Para un mejor efecto, esta debería ser una imagen de mayor resolución
          zoomType="hover" // El zoom se activa al pasar el ratón
          fullscreenOnMobile={true} // En móvil, al tocar se abre en pantalla completa
        />
      </div>

      <div className="thumbnails-wrapper">
        {images.map((image) => (
          <img
            key={image.id}
            src={image.src}
            alt={image.alt || `Thumbnail de ${productName}`}
            className={`thumbnail-item ${activeImage?.id === image.id ? 'active' : ''}`}
            onClick={() => setActiveImage(image)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductImageZoom;