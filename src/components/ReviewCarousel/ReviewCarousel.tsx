// src/components/ReviewCarousel.tsx

// ======================================================================
// *** Importaciones de React ***
// ======================================================================
// Importaciones de componentes y datos locales
import ReviewCard from '../ReviewCard/ReviewCard';
import { ReviewData } from '../../types';
import reviewsData from '../../data/reviews.json'; // Ajusta la ruta si es diferente

// ======================================================================
// *** Importaciones de react-slick ***
// ======================================================================
// Importa el componente Slider
import Slider from 'react-slick';
// Importa los estilos base de Slick Carousel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Importa el archivo CSS local (para estilos de sección y contenedor)
import './ReviewCarousel.css'; // Ajusta la ruta si es diferente


// Define las propiedades que recibirá el componente (similar a antes)
interface ReviewCarouselProps {
    title?: string;
    reviewsToShow?: number; // Número de diapositivas visibles a la vez
    autoPlayInterval?: number; // Intervalo de auto-play en ms
}

// Componente funcional para el carrusel de reseñas usando react-slick
function ReviewCarousel({ title, reviewsToShow = 2, autoPlayInterval = 5000 }: ReviewCarouselProps) {

    const allReviews: ReviewData[] = reviewsData; // Tu lista original de reseñas

    // ======================================================================
    // *** Configuración de react-slick (Props del componente <Slider>) ***
    // ======================================================================
    const settings = {
        dots: true, // Puedes poner true si quieres puntos de navegación
        infinite: true, // Habilita el loop suave (react-slick lo maneja)
        speed: 500, // Velocidad de la animación de desplazamiento (en ms)
        slidesToShow: reviewsToShow, // *** Número de diapositivas visibles a la vez ***
        slidesToScroll: 1, // Cuántas diapositivas avanzan por paso (igual que las visibles para que se vean grupos completos)
        autoplay: true, // Habilita el auto-play
        autoplaySpeed: autoPlayInterval, // Intervalo del auto-play (en ms)
        pauseOnHover: true, // Detiene el auto-play al pasar el ratón (buena UX)
        // fade: true, // Opcional: Si quieres un efecto de fundido en lugar de desplazamiento
        // cssEase: "linear", // Opcional: Función de timing para la animación
        // arrows: false, // Puedes poner true si quieres flechas de navegación (necesitan estilos)

        // Opcional: Configuración de responsividad (breakpoints) si la necesitas
        responsive: [
        {
            breakpoint: 1024, // Para pantallas de hasta 1024px de ancho (tabletas grandes)
            settings: {
                slidesToShow: 2, // Muestra 2 tarjetas
                slidesToScroll: 1 // Avanza de 1 en 1
            }
        },
        {
            breakpoint: 767, // Para pantallas de hasta 767px de ancho (tabletas pequeñas y móviles grandes)
            settings: {
                slidesToShow: 1, // Muestra 1 sola tarjeta
                slidesToScroll: 1,
                arrows: false // Ocultamos las flechas en móvil, ya que se usa el swipe
            }
        }
        // Puedes añadir más breakpoints si lo necesitas, por ejemplo para 480px.
    ]
};

    // Si no hay reseñas, no renderizamos el carrusel para evitar errores.
    if (!allReviews || allReviews.length === 0) {
        return null;
    }

    return ( // *** Abre paréntesis para el return ***
        // Contenedor principal de la sección
        <section className="review-carousel-section"> {/* Usamos clases CSS */}

             {/* Título de la sección */}
             {title && <h2>{title}</h2>} {/* Usamos clases CSS si las hay para h2 en ReviewCarousel.css */}

            {/* ============================================================== */}
            {/* ============================================================== */}
             <Slider {...settings}> {/* Pasamos la configuración como props */}
                {/* Mapeamos sobre la lista ORIGINAL de reseñas. Slick maneja el loop y la duplicación interna. */}
                {allReviews.map((review) => ( // Abre paréntesis para el retorno implícito
                <ReviewCard
                    key={review.id}
                    name={review.name}
                    text={review.text}
                    // rating={review.rating}
                /> // Cierra el elemento JSX
            ))} {/* Cierre del mapeo */}    
                    
                </Slider> {/* Cierre del componente Slider */}


            {/* ============================================================== */}
            {/* ============================================================== */}
             <div className="reviews-google-link-container"> {/* Contenedor si quieres aplicar margen superior */}
                 <a
                     href="https://www.google.com/search?sca_esv=046182418b1cd8f1&hl=es-ES&sxsrf=AHTn8zq651FKtslk8KkYPGPp8WPyOh1n_Q:1746202102886&si=APYL9bs7Hg2KMLB-4tSoTdxuOx8BdRvHbByC_AuVpNyh0x2KzVuMDCubjkCG2QAiMNxSYTSTtB79n_hj2Brc8jzXjp0cHIDMVSABAzQjg5k6A-CvYg9vcwxAKcszEjTc4kaPbG7x4cTJwRdquW5owyNjZ_58WwFesg%3D%3D&q=Soluciones+T%C3%A1cticas+Rese%C3%B1as&sa=X&ved=2ahUKEwinv7HglYWNAxVsnf0HHdLQANsQ0bkNegQIQRAD&biw=1920&bih=953&dpr=1"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="reviews-google-link" // Usa la clase CSS para estilos de enlace
                 >
                    Ver todas las reseñas en Google
                </a>
             </div> {/* Cierre del contenedor del enlace */}


         </section>
     ); 
 } 

export default ReviewCarousel; // Exporta el componente