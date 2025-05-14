// src/components/CategoryCarousel.tsx

import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// *** Importamos la función getProducts desde WooApi.ts ***
import { getProducts } from '../api/wooApi';
// *** Importamos la interfaz Product desde types.ts ***
import { Product } from '../types';

// ======================================================================
// *** Importaciones de react-slick ***
// ======================================================================
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Importa el archivo CSS local para este carrusel (puedes reutilizar estilos si quieres)
import './css/CategoryCarousel.css'; // Creamos un nuevo archivo CSS o reutilizamos BrandCarousel.css si los estilos son similares


// Define las propiedades que recibirá el componente CategoryCarousel
interface CategoryCarouselProps {
    title?: string; // Título para la sección (ej: "Más en [Nombre Categoría]")
    categoryIdentifier: number | string; // ID o Slug de la categoría a mostrar
    productsToShow?: number; // Cuántos productos mostrar a la vez en el carrusel
    productsPerFetch?: number; // Cuántos productos solicitar a la API (puedes pedir más de los que muestras para tener variedad)
    autoPlayInterval?: number; // Intervalo de auto-play en ms
    excludeProductId?: number; // Opcional: ID de un producto a excluir (útil en la p\u00Eaacute;gina de detalle)
}

// Componente funcional para el carrusel de productos por categoría
function CategoryCarousel({
    title,
    categoryIdentifier,
    productsToShow = 5, // Muestra 5 por defecto en el carrusel
    productsPerFetch = 10, // Pero pide 10 a la API para tener un poco más de variedad si la categoría es grande
    autoPlayInterval = 3000,
    excludeProductId // Recibe el ID del producto actual para excluirlo
}: CategoryCarouselProps) {

    // ======================================================================
    // *** Estado para los datos de los productos y el estado de carga ***
    // ======================================================================
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    // ======================================================================
    // *** useEffect para cargar los datos de los productos desde la API ***
    // ======================================================================
    useEffect(() => {
        if (!categoryIdentifier) {
            setError("No se proporcionó un identificador de categoría.");
            setLoading(false);
            setProducts([]);
            return;
        }

        console.log(`[CategoryCarousel] useEffect disparado para cargar productos de categor\u00EDa: ${categoryIdentifier}`);

        const fetchProducts = async () => {
            try {
                setLoading(true); // Indicamos que la carga ha comenzado
                setError(null); // Limpiamos errores anteriores
                setProducts([]); // Limpiamos resultados anteriores

                // Preparamos el parámetro de categoría para la API
                let categoryIdsString: string | undefined = undefined;
                // Si categoryIdentifier es un número, lo convertimos a string
                if (typeof categoryIdentifier === 'number') {
                     categoryIdsString = categoryIdentifier.toString();
                } else { // Si es una cadena, asumimos que es un slug o una lista de IDs separada por comas
                     // Nota: getProducts espera IDs en string, pero para un solo slug necesitar\u00EDas convertirlo a ID primero.
                     // Sin embargo, si siempre le pasas un ID o una cadena de IDs como en ProductPage, esto est\u00E1 bien.
                     // Si quisieras pasar SLUGS a este componente, la l\u00F3gica ser\u00E1a m\u00E1s compleja:
                     // primero llamar a getCategoryIdBySlug, luego getProducts con el ID.
                     // Asumamos por ahora que le pasas un ID o una cadena de IDs.
                     categoryIdsString = categoryIdentifier; // Directamente usamos la cadena proporcionada
                }


                // Preparamos la lista de IDs a excluir (solo el producto actual si se proporciona)
                const excludeIds = excludeProductId ? [excludeProductId] : undefined;


                // Llama a la función getProducts de tu WooApi.ts
                const result = await getProducts(
                    1, // page: Siempre la primera página
                    productsPerFetch, // per_page: Cuántos productos solicitar a la API
                    categoryIdsString, // Filtra por la categoría proporcionada
                    undefined, // search
                    'date', // orderby (puedes usar 'rand' si la API lo soporta para carruseles de descubrimiento)
                    'desc', // order
                    undefined, // on_sale
                    undefined, // featured
                    undefined, // includeIds
                    excludeIds // Excluye el producto actual
                );

                // Filtramos los productos que no tienen imagen (opcional, pero bueno para carruseles visuales)
                 const productsWithImages = result.products.filter(product => product.images && product.images.length > 0);


                if (productsWithImages.length === 0) {
                     // Solo establecemos error si NO hay productos *con imágenes* después de una búsqueda exitosa
                     // Y solo si la carga principal fue exitosa (result no es null o vacío)
                     if (result.products.length > 0) { // Encontró productos, pero sin imagen
                          console.log("[CategoryCarousel] Se encontraron productos en la categor\u00EDa, pero ninguno con im\u00E1genes.");
                          // Puedes establecer un mensaje de error específico o simplemente dejar products vacío
                          // setError("No se encontraron productos con imágenes en esta categor\u00EDa.");
                     } else { // No encontró productos en la categoría
                           console.log(`[CategoryCarousel] No se encontraron productos para la categor\u00EDa: ${categoryIdentifier}`);
                            // No es necesariamente un error, es que no hay productos. Puedes no mostrar nada o un mensaje.
                     }
                     setProducts([]); // Asegura que el estado est\u00E9 vac\u00EDo si no hay con im\u00E1genes o si no hay ninguno.

                } else {
                     setProducts(productsWithImages); // Actualiza el estado con los productos que tienen imagen
                     console.log(`[CategoryCarousel] Productos de categor\u00EDa cargados exitosamente (${productsWithImages.length} con imagen).`);
                }


            } catch (caughtError: unknown) {
                console.error(`[CategoryCarousel] Error al cargar productos para categor\u00EDa ${categoryIdentifier}:`, caughtError);
                if (caughtError instanceof Error) {
                    setError(caughtError.message);
                } else {
                    setError("Error al cargar los productos de la categoría.");
                }
                setProducts([]); // Limpiar resultados en caso de error
            } finally {
                setLoading(false); // La carga termina siempre
                 console.log(`[CategoryCarousel] Carga de productos para categor\u00EDa ${categoryIdentifier} finalizada.`);
            }
        };

        fetchProducts(); // Ejecuta la función de carga al montar o al cambiar las dependencias

        // Dependencias: Se re-ejecuta si categoryIdentifier o excludeProductId cambian
    }, [categoryIdentifier, excludeProductId, productsPerFetch]); // A\u00F1adir productsPerFetch si puede cambiar por props


    // Si no hay productos que mostrar (después de carga y sin error), no renderizamos nada
     if (!loading && !error && products.length === 0) {
         return null;
     }


    // ======================================================================
    // *** Configuración de react-slick (Props del componente <Slider>) ***
    // ======================================================================
    const settings = {
        dots: false,
        infinite: products.length >= productsToShow, // Solo infinite si hay suficientes items para llenar la vista
        speed: 500,
        slidesToShow: productsToShow, // Cuántos mostrar a la vez
        slidesToScroll: 1,
        autoplay: products.length > productsToShow && autoPlayInterval > 0, // Solo auto-play si hay m\u00E1s items de los que se muestran y el intervalo es > 0
        autoplaySpeed: autoPlayInterval,
        pauseOnHover: true,
        arrows: products.length > productsToShow, // Solo mostrar flechas si hay m\u00E1s items de los que se muestran

        // Responsividad opcional (ajusta seg\u00FAn tus breakpoints)
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: Math.min(productsToShow, 4), // Mostrar m\u00E1ximo 4 en tablets grandes
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: Math.min(productsToShow, 3), // Mostrar m\u00E1ximo 3 en tablets
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: Math.min(productsToShow, 2), // Mostrar m\u00E1ximo 2 en m\u00F3viles
                    slidesToScroll: 1
                }
            }
            // Puedes a\u00F1adir m\u00E1s breakpoints si es necesario
        ]
    };


    // ======================================================================
    // --- Renderizado (Manejo de estados: Cargando, Error, Carrusel) ---
    // ======================================================================
    return (
        <section className="category-carousel-section"> {/* Clase para estilos de secci\u00F3n */}

            {/* Título de la sección (opcional) */}
            {title && (
                 <div className="category-section-title-container">
                     <h2>{title}</h2>
                 </div>
            )}


            {/* ============================================================== */}
            {/* ============================================================== */}
            {loading && <p style={{ textAlign: 'center' }}>Cargando productos...</p>} {/* Muestra mensaje de carga */}
            {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>} {/* Muestra mensaje de error */}

            {/* ============================================================== */}
            {/* Condición para renderizar el Slider: Hay productos, no está cargando y no hay error */}
            {products.length > 0 && !loading && !error && (
                <Slider {...settings}>
                    {/* Mapea sobre la lista de productos */}
                    {products.map((product) => (
                         <div key={product.id} className="category-slide"> {/* Clase para cada item del carrusel */}
                             <Link to={`/producto/${product.slug}`} className="category-slide-link" onClick={() => window.scrollTo(0, 0)}> {/* Enlace al producto */}
                                 {/* Imagen del producto o Placeholder */}
                                 {product.images && product.images[0]?.src ? (
                                      <img
                                          src={product.images[0].src}
                                          alt={product.images[0].alt || product.name}
                                          className="category-product-image" // Clase para la imagen del item
                                      />
                                 ) : (
                                      <div className="no-category-product-image">Sin Imagen</div>
                                 )}
                                  <div className="category-product-name">{product.name}</div> {/* Nombre del producto */}
                                  {/* Opcional: A\u00F1adir precio si quieres */}
                                  {/* <div className="category-product-price">{product.price}€</div> */}
                             </Link>
                         </div>
                    ))}
                </Slider>
            )}

            {/* Mostrar mensaje si no hay productos disponibles (solo si no está cargando ni hay error) */}
             {!loading && !error && products.length === 0 && !title && ( // No mostrar este mensaje si hay t\u00EDtulo, podr\u00EDa sentirse repetitivo
                 <p style={{ textAlign: 'center' }}>No hay productos disponibles en esta categor\u00EDa.</p>
             )}

        </section>
    );
}

export default CategoryCarousel;