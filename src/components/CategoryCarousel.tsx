// src/components/CategoryCarousel.tsx

import  { useEffect, useState } from 'react';
// Ya no necesitamos Link aquí si ProductCarousel se encarga de los enlaces internos de cada item
// import { Link } from 'react-router-dom'; 

// Importamos la función getProducts desde WooApi.ts
import { getProducts } from '../api/wooApi';
// Importamos la interfaz Product desde types.ts
import { Product } from '../types';

// === YA NO NECESITAMOS LAS IMPORTACIONES DE REACT-SLICK AQUÍ ===
// Estas las maneja ProductCarousel.tsx
// import Slider from 'react-slick';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';

// Importa el NUEVO ProductCarousel que acabamos de crear
import ProductCarousel from './ProductCarousel'; // Ajusta la ruta si es diferente

// Los estilos CSS específicos de la sección de categoría (si los hay) pueden quedarse,
// pero los estilos del carrusel en sí los maneja ProductCarousel.css
import './css/CategoryCarousel.css'; // Puede que este archivo CSS ahora sea más simple o incluso innecesario

// Define las propiedades que recibirá el componente CategoryCarousel (se mantienen similares)
interface CategoryCarouselProps {
    title?: string;
    categoryIdentifier: number | string;
    productsToShow?: number; // Esta prop se la pasaremos a ProductCarousel
    productsPerFetch?: number;
    autoPlayInterval?: number; // Esta prop se la pasaremos a ProductCarousel
    excludeProductId?: number;
}

function CategoryCarousel({
    title,
    categoryIdentifier,
    productsToShow = 5,     // Lo usaremos al pasar a ProductCarousel
    productsPerFetch = 10,
    autoPlayInterval = 3000, // Lo usaremos al pasar a ProductCarousel
    excludeProductId
}: CategoryCarouselProps) {

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!categoryIdentifier) {
            setError("No se proporcionó un identificador de categoría.");
            setLoading(false);
            setProducts([]);
            return;
        }

        console.log(`[CategoryCarousel] useEffect disparado para cargar productos de categoría: ${categoryIdentifier}`);

        const fetchProductsForCategory = async () => {
            try {
                setLoading(true);
                setError(null);
                setProducts([]);

                let categoryIdsString: string | undefined = undefined;
                if (typeof categoryIdentifier === 'number') {
                    categoryIdsString = categoryIdentifier.toString();
                } else {
                    categoryIdsString = categoryIdentifier;
                }

                const excludeIds = excludeProductId ? [excludeProductId] : undefined;

                const result = await getProducts({
                    page: 1,
                    per_page: productsPerFetch,
                    category: categoryIdsString,
                    orderby: 'date',
                    order: 'desc',
                    exclude: excludeIds
                });

                const productsWithImages = result.products.filter(product => product.images && product.images.length > 0);

                if (productsWithImages.length === 0) {
                    if (result.products.length > 0) {
                        console.log("[CategoryCarousel] Se encontraron productos, pero ninguno con imágenes.");
                    } else {
                        console.log(`[CategoryCarousel] No se encontraron productos para la categoría: ${categoryIdentifier}`);
                    }
                    setProducts([]);
                } else {
                    setProducts(productsWithImages);
                    console.log(`[CategoryCarousel] Productos de categoría cargados (${productsWithImages.length} con imagen).`);
                }
            } catch (caughtError: unknown) {
                console.error(`[CategoryCarousel] Error al cargar productos para categoría ${categoryIdentifier}:`, caughtError);
                if (caughtError instanceof Error) {
                    setError(caughtError.message);
                } else {
                    setError("Error al cargar los productos de la categoría.");
                }
                setProducts([]);
            } finally {
                setLoading(false);
                console.log(`[CategoryCarousel] Carga de productos para categoría ${categoryIdentifier} finalizada.`);
            }
        };

        fetchProductsForCategory();
    }, [categoryIdentifier, excludeProductId, productsPerFetch]);


    // === YA NO NECESITAMOS LA CONFIGURACIÓN DE REACT-SLICK AQUÍ ===
    // const settings = { ... };

    // --- Renderizado ---
    // Ahora, en lugar de renderizar <Slider> directamente, usamos <ProductCarousel>

    if (loading) {
        // Puedes tener un loader específico para la sección de categoría o dejar que ProductCarousel lo maneje
        // si le pasaras la prop 'loading'. Por ahora, un mensaje simple aquí.
        return (
            <section className="category-carousel-section loading">
                {title && <div className="section-title-container"><h2>{title}</h2></div>}
                <p style={{ textAlign: 'center' }}>Cargando productos de la categoría...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="category-carousel-section error">
                {title && <div className="section-title-container"><h2>{title}</h2></div>}
                <p style={{ textAlign: 'center', color: 'var(--color-call-to-action)' }}>Error: {error}</p>
            </section>
        );
    }

    // Si no hay productos (y no está cargando ni hay error),
    // ProductCarousel internamente podría retornar null o mostrar un mensaje.
    // O podemos decidir no renderizar ProductCarousel aquí si products está vacío.
    if (products.length === 0) {
        // Opcional: Mostrar un mensaje si no hay productos y hay un título.
        // Si ProductCarousel ya muestra un mensaje cuando está vacío y tiene título, esto puede ser redundante.
        // if (title) {
        //     return (
        //         <section className="category-carousel-section empty">
        //             {title && <div className="section-title-container"><h2>{title}</h2></div>}
        //             <p style={{ textAlign: 'center' }}>No hay productos disponibles en esta categoría.</p>
        //         </section>
        //     );
        // }
        return null; // No renderiza nada si no hay productos (ProductCarousel también hace esto)
    }

    return (
        // La clase 'category-carousel-section' puede seguir siendo útil para el contenedor de esta sección específica.
        // El ProductCarousel interno tendrá su propia clase 'product-carousel-section'.
        // Podrías renombrar la clase externa si quieres evitar confusión, ej. 'category-products-display-section'
        <section className="category-carousel-section-wrapper"> 
            <ProductCarousel
                title={title}
                products={products} // Le pasamos los productos obtenidos
                productsToShow={productsToShow} // Le pasamos la prop de configuración
                autoPlayInterval={autoPlayInterval} // Le pasamos la prop de configuración
                // No necesitamos pasar loading/error aquí si ya los manejamos arriba
            />
        </section>
    );
}

export default CategoryCarousel;