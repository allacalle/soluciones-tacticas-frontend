// src/components/ProductCarousel.tsx
import { Link } from 'react-router-dom';
import { Product } from '../types'; // La interfaz Product sigue siendo necesaria

// Importaciones de react-slick
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Estilos CSS para el carrusel genérico (puedes crear uno nuevo o reutilizar)
import './css/ProductCarousel.css'; // Asegúrate de que este archivo CSS exista o ajusta la ruta

// Define las propiedades que recibirá el componente ProductCarousel
interface ProductCarouselProps {
    title?: string;                 // Título opcional para la sección del carrusel
    products: Product[];            // Array de productos a mostrar (¡prop principal!)
    productsToShow?: number;        // Cuántos productos mostrar a la vez en el carrusel
    autoPlayInterval?: number;    // Intervalo para el auto-play en milisegundos
    // Puedes añadir más props de configuración de react-slick si quieres controlarlas desde fuera
    // ej: arrows, dots, etc.
}

function ProductCarousel({
    title,
    products,
    productsToShow = 5,      // Valor por defecto si no se proporciona
    autoPlayInterval = 3000, // Valor por defecto
}: ProductCarouselProps) {

    // Si no hay productos, podemos decidir no renderizar nada o mostrar un mensaje.
    // Por ahora, si no hay productos, no se renderizará el Slider.
    // El componente padre puede decidir no renderizar ProductCarousel si la lista está vacía.
    if (products.length === 0) {
        // Opcional: Si hay un título, podrías querer mostrar el título y "No hay productos".
        // if (title) {
        //     return (
        //         <section className="product-carousel-section empty">
        //             {title && <div className="section-title-container"><h2>{title}</h2></div>}
        //             <p style={{ textAlign: 'center' }}>No hay productos para mostrar.</p>
        //         </section>
        //     );
        // }
        return null; // Si no hay productos, no renderiza nada.
    }

    // Configuración de react-slick
    const settings = {
        dots: false, // Puedes hacer esto una prop si quieres controlarlo desde fuera
        infinite: products.length >= productsToShow, // Solo es infinito si hay suficientes items
        speed: 500,
        slidesToShow: productsToShow,
        slidesToScroll: 1,
        autoplay: products.length > productsToShow && autoPlayInterval > 0, // Solo autoplay si hay suficientes y un intervalo válido
        autoplaySpeed: autoPlayInterval,
        pauseOnHover: true,
        arrows: products.length > productsToShow, // Solo mostrar flechas si hay más items de los que se ven
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: Math.min(productsToShow, 4),
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: Math.min(productsToShow, 3),
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: Math.min(productsToShow, 2), // En móviles más pequeños, podrías poner 1 o 2
                    slidesToScroll: 1
                }
            }
        ]
    };

    return (
        <section className="product-carousel-section">
            {title && (
                <div className="section-title-container">
                    <h2>{title}</h2>
                </div>
            )}

            {/* El Slider ahora usa directamente la prop 'products' */}
            <Slider {...settings}>
                {products.map((product) => (
                    <div key={product.id} className="product-slide">
                        <Link to={`/producto/${product.slug}`} className="product-slide-link" onClick={() => window.scrollTo(0, 0)}>
                            {product.images && product.images[0]?.src ? (
                                <img
                                    src={product.images[0].src}
                                    alt={product.images[0].alt || product.name}
                                    className="product-image"
                                />
                            ) : (
                                <div className="no-product-image">Sin Imagen</div>
                            )}
                            <div className="product-name">{product.name}</div>
                            {/* Opcional: Precio, etc. */}
                            {/* <div className="product-price">{product.price}€</div> */}
                        </Link>
                    </div>
                ))}
            </Slider>
        </section>
    );
}

export default ProductCarousel;