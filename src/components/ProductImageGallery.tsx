// src/components/ProductImageGallery.tsx
import React from 'react';
import { Image as ImageType } from '../types'; // Usamos ImageType para evitar colisión con el elemento <img>
import './css/ProductImageGallery.css'; // Crearemos este archivo CSS después

interface ProductImageGalleryProps {
  productName: string;
  images: ImageType[]; // Imágenes del producto padre para las miniaturas
  displayedImage?: string; // URL de la imagen grande a mostrar
  activeThumbnailSrc?: string; // URL de la miniatura que debe estar activa
  onThumbnailClick: (imageUrl: string) => void; // Callback al hacer clic en miniatura
  // Opcional: si quieres que la galería use un placeholder si no hay displayedImage
  // placeholderImage?: string; 
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  productName,
  images,
  displayedImage,
  activeThumbnailSrc,
  onThumbnailClick,
  // placeholderImage // Descomenta si lo añades a las props
}) => {
  // Si no hay displayedImage y tienes un placeholder como prop, podrías usarlo aquí.
  // const imageToShow = displayedImage || placeholderImage || '/assets/default-placeholder.jpg'; 
  // Por ahora, asumiremos que ProductPage ya maneja el placeholder en displayedImage

  if (!images || images.length === 0) {
    // Si no hay imágenes en absoluto (ni siquiera para miniaturas),
    // mostramos un placeholder o mensaje.
    // O podrías pasar un placeholder general desde ProductPage para este caso.
    return (
      <div className="product-images-gallery">
        {displayedImage ? (
          <img src={displayedImage} alt={productName} className="product-main-image" />
        ) : (
          <div className="no-product-image">Imagen no disponible</div>
        )}
        {/* No hay miniaturas que mostrar */}
      </div>
    );
  }

  return (
    <div className="product-images-gallery">
      {/* Imagen principal grande */}
      {displayedImage ? (
        <img src={displayedImage} alt={productName} className="product-main-image" />
      ) : (
        // Este fallback podría ser un placeholder específico de la galería o el mismo que usa ProductPage
        <div className="no-product-image">Imagen no disponible</div>
      )}

      {/* Miniaturas */}
      {/* Solo mostrar la sección de miniaturas si hay más de una imagen, o siempre si hay al menos una */}
      {images.length > 0 && ( // O images.length > 1 si solo quieres miniaturas si hay varias
        <div className="product-thumbnails">
          {images.map((image, index) => (
            <img
              key={image.id || index}
              src={image.src}
              alt={image.alt || `Thumbnail de ${productName} ${index + 1}`}
              className={`product-thumbnail ${activeThumbnailSrc === image.src ? 'active' : ''}`}
              onClick={() => onThumbnailClick(image.src)} // Llama al callback pasado por ProductPage
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;