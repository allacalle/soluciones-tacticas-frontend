// src/components/ImageCarousel.tsx (o src/components/ImageCarousel.jsx)
import  { useEffect, useState } from 'react';

// *** Importa tus imágenes específicas del carrusel ***
// Asegúrate de que las rutas sean correctas desde src/components a donde pusiste las imágenes
import militarImage from '../assets/hero-carousel/militar.jpg'; // <-- Ruta a militar.jpg
import outdoorImage from '../assets/hero-carousel/outdoor.jpg'; // <-- Ruta a outdoor.jpg
import policialImage from '../assets/hero-carousel/policial.jpg'; // <-- Ruta a policial.jpg


// Define el array con las imágenes del carrusel usando las importaciones
const carouselImages = [
  militarImage,
  outdoorImage,
  policialImage,
];

// Define el intervalo de tiempo para cambiar de imagen (en milisegundos)
const carouselInterval = 5000; // 5 segundos


function ImageCarousel() {
  // Estado para saber qué imagen mostrar actualmente (índice en el array)
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Efecto para manejar la rotación automática
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % carouselImages.length // Calcula el siguiente índice, volviendo a 0 al final
      );
    }, carouselInterval);

    // Función de limpieza: Detiene el temporizador al desmontar el componente
    return () => {
      clearInterval(timer);
    };

  }, []); // Dependencia vacía: se ejecuta solo una vez al montar

  // Renderiza la imagen actual
  return (
    // Contenedor para posicionar y estilizar el carrusel
    <div className="image-carousel-container" style={{
        width: '100%',
        height: '100%',
        position: 'absolute', // Posicionamiento absoluto para el fondo
        top: 0,
        left: 0,
        overflow: 'hidden', // Oculta partes que se salgan
        zIndex: 1 // Z-index bajo para que el texto esté encima
    }}>
       <img
           src={carouselImages[currentImageIndex]} // La imagen a mostrar
           alt={`Carousel Image ${currentImageIndex + 1}`} // Texto alternativo
           className="carousel-image"
           style={{
               width: '100%',
               height: '100%',
               objectFit: 'cover', // Asegura que la imagen cubra el área
               transition: 'opacity 1s ease-in-out', // Transición suave al cambiar (requiere más CSS para un efecto completo)
               opacity: 1 // Asegura que la opacidad inicial sea 1
           }}
       />
    </div>
  );
}

export default ImageCarousel;