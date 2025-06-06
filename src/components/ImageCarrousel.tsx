// src/components/ImageCarousel.tsx
import { useEffect, useState } from 'react'; // React se importa implícitamente si usas JSX

// *** YA NO IMPORTAMOS LAS IMÁGENES DIRECTAMENTE COMO MÓDULOS ***
// import militarImage from '@/assets/hero-carousel/militar.jpg';
// import outdoorImage from '@/assets/hero-carousel/outdoor.jpg';
// import policialImage from '@/assets/hero-carousel/policial.jpg';


// Define el array con las rutas a las imágenes en la carpeta `public`
const carouselImagePaths = [ // Cambiado el nombre de la variable para mayor claridad
  "/assets/hero-carousel/outdoor.jpg", 
  "/assets/hero-carousel/policial.jpg",   // Ruta absoluta desde la raíz del sitio web
  "/assets/hero-carousel/militar.jpg"     // Ruta absoluta desde la raíz del sitio web
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
        (prevIndex + 1) % carouselImagePaths.length // Usa carouselImagePaths
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
           src={carouselImagePaths[currentImageIndex]} // Usa la ruta de cadena del array
           alt={`Carousel Image ${currentImageIndex + 1}`} // Texto alternativo
           className="carousel-image"
           style={{
               width: '100%',
               height: '100%',
               objectFit: 'cover', // Asegura que la imagen cubra el área
               transition: 'opacity 1s ease-in-out', // Transición suave al cambiar
               opacity: 1 // Asegura que la opacidad inicial sea 1
           }}
       />
    </div>
  );
}

export default ImageCarousel;