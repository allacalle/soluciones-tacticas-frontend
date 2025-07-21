// src/components/ProductCarousel.tsx
import React from 'react'; // Siempre importa React
import { Link } from 'react-router-dom';
import { Product } from '../../types';

// Importaciones de react-slick
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css'; // Sigue siendo bueno tenerlo por si algún estilo base ayuda

// Tu CSS personalizado para este componente
import './ProductCarousel.css';

// --- COMPONENTES DE FLECHAS PERSONALIZADAS ---
interface ArrowProps {
    className?: string;
    style?: React.CSSProperties;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const NextArrow: React.FC<ArrowProps> = (props) => {
    const { className, style, onClick } = props;
    // Asegúrate de que className (pasado por react-slick) se incluya para los estilos base de .slick-arrow
    return (
        <div
            className={`${className || ''} custom-slick-arrow custom-slick-next`} // Tus clases personalizadas
            style={{ ...style }} // Estilos inline pasados por react-slick (a veces para display)
            onClick={onClick}
        >
            <span>{'>'}</span> {/* O tu icono SVG */}
        </div>
    );
};

const PrevArrow: React.FC<ArrowProps> = (props) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className || ''} custom-slick-arrow custom-slick-prev`} // Tus clases personalizadas
            style={{ ...style }}
            onClick={onClick}
        >
            <span>{'<'}</span> {/* O tu icono SVG */}
        </div>
    );
};
// --- FIN COMPONENTES DE FLECHAS ---

interface ProductCarouselProps {
    title?: string;
    products: Product[];
    productsToShow?: number;
    autoPlayInterval?: number;
    showArrows?: boolean;
}

function ProductCarousel({
    title,
    products,
    productsToShow = 4,
    autoPlayInterval = 5000,
    showArrows = true,
}: ProductCarouselProps) {

    if (!products || products.length === 0) {
        if (title) {
             return (
                 <section className="product-carousel-section empty">
                     {title && <div className="section-title-container"><h2>{title}</h2></div>}
                     <p style={{ textAlign: 'center', padding: '20px' }}>No hay productos para mostrar en este carrusel.</p>
                 </section>
             );
        }
        return null;
    }

    // Log para depurar la condición de las flechas
    const shouldRenderArrows = showArrows && (products.length > productsToShow);
    console.log('PRODUCT CAROUSEL - FLECHAS PERSONALIZADAS:', {
        passedShowArrowsProp: showArrows,
        actualProductsLength: products.length,
        actualProductsToShow: productsToShow,
        calculatedArrowFlag: shouldRenderArrows
    });

    const settings = {
        dots: true,
        infinite: products.length > productsToShow,
        speed: 500,
        slidesToShow: productsToShow,
        slidesToScroll: 1,
        autoplay: products.length > productsToShow && autoPlayInterval > 0,
        autoplaySpeed: autoPlayInterval,
        pauseOnHover: true,
        // === USAR FLECHAS PERSONALIZADAS ===
        arrows: shouldRenderArrows, // La condición sigue siendo la misma
        nextArrow: <NextArrow />,   // Tu componente NextArrow
        prevArrow: <PrevArrow />,   // Tu componente PrevArrow
        // === FIN USO FLECHAS PERSONALIZADAS ===
        responsive: [
         {
             breakpoint: 1024,
             settings: {
                 slidesToShow: Math.min(productsToShow, 3),
                 // Actualizar la condición de arrows también en responsive
                 arrows: showArrows && (products.length > Math.min(productsToShow, 3)),
             }
         },
         {
             breakpoint: 768,
             settings: {
                 slidesToShow: Math.min(productsToShow, 2),
                 arrows: showArrows && (products.length > Math.min(productsToShow, 2)),
             }
         },
         {
             breakpoint: 480,
             settings: {
                 slidesToShow: Math.min(productsToShow, 1),
                 arrows: showArrows && (products.length > Math.min(productsToShow, 1)),
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
            <Slider {...settings}>
                {products.map((product) => (
                    <div key={product.id} className="carousel-slide-item-wrapper">
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
                            {product.price && <div className="product-price">{product.price}€</div>}
                        </Link>
                    </div>
                ))}
            </Slider>
        </section>
    );
}
export default ProductCarousel;