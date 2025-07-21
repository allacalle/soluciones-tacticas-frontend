// src/components/ProductImageGallery.tsx - ADAPTADO CON ZOOM
import React from 'react';
import { ProductImage as ImageType } from '../../types'; // Renombramos a ProductImage en types.ts
import InnerImageZoom from 'react-inner-image-zoom'; // Importamos la librería de zoom
import 'react-inner-image-zoom/lib/styles.min.css'; // <<<--- ESTA ES LA LÍNEA CORRECTA
import './ProductImageGallery.css'; // Tus estilos personalizados

interface ProductImageGalleryProps {
  productName: string;
  images: ImageType[];
  displayedImage?: string; // La URL de la imagen principal a mostrar
  activeThumbnailSrc?: string; // La URL de la miniatura activa
  onThumbnailClick: (imageUrl: string) => void;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  productName,
  images,
  displayedImage,
  activeThumbnailSrc,
  onThumbnailClick,
}) => {
  // Determinamos qué imagen mostrar, asegurándonos de que siempre haya un valor si es posible.
  const imageToShow = displayedImage || (images && images.length > 0 ? images[0].src : undefined);

  return (
    <div className="product-images-gallery">
      {/* Imagen principal grande */}
      {imageToShow ? (
        // --- ESTE ES EL CAMBIO PRINCIPAL ---
        // Envolvemos el componente de zoom en un div para aplicar estilos y posición.
        <div className="main-image-zoom-wrapper">
          <InnerImageZoom
            src={imageToShow}
            zoomSrc={imageToShow} // Idealmente, esta sería una imagen de mayor resolución
            imgAttributes={{ alt: productName }}
            zoomType="hover" // El zoom se activa al pasar el ratón
            fullscreenOnMobile={true} // En móvil, al tocar se abre en pantalla completa (muy buena UX)
            hideHint={true} // Opcional: oculta el texto "Hover to zoom"
          />
        </div>
      ) : (
        // El fallback si no hay ninguna imagen
        <div className="no-product-image">Imagen no disponible</div>
      )}

      {/* Miniaturas (esta parte no cambia, sigue funcionando igual) */}
      {images && images.length > 1 && ( // Solo mostramos miniaturas si hay más de 1 imagen
        <div className="product-thumbnails">
          {images.map((image, index) => (
            <img
              key={image.id || index}
              src={image.src}
              alt={image.alt || `Thumbnail de ${productName} ${index + 1}`}
              className={`product-thumbnail ${activeThumbnailSrc === image.src ? 'active' : ''}`}
              onClick={() => onThumbnailClick(image.src)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;