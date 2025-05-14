// src/pages/ProductPage.tsx

// Importar hooks de React
import React, { useEffect, useState } from 'react';
// Importar hooks de react-router-dom
import { useParams, Link } from 'react-router-dom';
// Importar estilos CSS para esta página
import './css/ProductPage.css';

// Importar las interfaces necesarias (Product, Brand)
import { Product } from '../types';

// Importar las funciones de la API necesarias (getProductByIdOrSlug)
// YA NO NECESITAMOS getProducts AQUÍ para los similares de categoría
import { getProductByIdOrSlug } from '../api/wooApi';

// *** Importar el nuevo componente CategoryCarousel ***
import CategoryCarousel from '../components/CategoryCarousel';


/*
 * Componente de la página de detalle de producto individual (versión escaparate)
 * Muestra imágenes, precio, descripciones, metadatos y productos similares.
 */
function ProductPage() {
    // ... (hooks de estado para product, loading, error, mainImage)

    /*
     * Leemos el parámetro 'productSlug' de la URL.
     */
    const { productSlug } = useParams<{ productSlug: string }>();

    /*
     * Estado para guardar los datos del producto principal (inicialmente null)
     */
    const [product, setProduct] = useState<Product | null>(null);
    /*
     * Estado para el estado de carga del producto principal (true mientras se obtienen datos)
     */
    const [loading, setLoading] = useState(true); // Empezamos cargando por defecto
    /*
     * Estado para los errores al cargar el producto principal
     */
    const [error, setError] = useState<string | null>(null);

    /*
     * Estado para la URL de la imagen principal mostrada en la galería
     */
    const [mainImage, setMainImage] = useState<string | undefined>(undefined);

    // *** YA NO NECESITAS ESTADOS ESPECÍFICOS PARA similarProducts, similarLoading, similarError AQUÍ ***
    // Esos estados ahora los manejará internamente el componente CategoryCarousel.


    // *** EFECTO SECUNDARIO (useEffect) para cargar el producto principal ***

    useEffect(() => {
        if (!productSlug) {
            setError("No se proporcionó un identificador de producto en la URL.");
            setLoading(false);
            setProduct(null); // Asegurar que el producto est\u00E9 null si no hay slug
            setMainImage(undefined); // Asegurar que la imagen principal est\u00E9 undefined si no hay slug
            return;
        }

        console.log(`[ProductPage] Iniciando carga para slug: ${productSlug}`);

        const fetchProduct = async () => { // Renombramos la funci\u00F3n, ya no busca relacionados aqu\u00ED
            try {
                // --- 1. RESETEAR ESTADOS AL INICIO ---
                setLoading(true);
                setError(null);
                setProduct(null);
                setMainImage(undefined);

                // --- 2. FETCH DEL PRODUCTO PRINCIPAL ---
                const fetchedProduct = await getProductByIdOrSlug(productSlug);

                // --- 3. PROCESAR EL PRODUCTO PRINCIPAL ---
                if (fetchedProduct) {
                    setProduct(fetchedProduct);
                    console.log(`[ProductPage] Producto principal cargado: ${fetchedProduct.name}`);
                    // console.log("[ProductPage] Datos completos del producto principal:", fetchedProduct); // Log detallado opcional

                    if (fetchedProduct.images && fetchedProduct.images.length > 0) {
                        setMainImage(fetchedProduct.images[0].src);
                    }
                } else {
                    // --- Si el producto principal no fue encontrado ---
                    setError("Producto no encontrado.");
                    setProduct(null);
                    setMainImage(undefined);
                    console.warn(`[ProductPage] Producto con slug "${productSlug}" no encontrado por API.`);
                }
            } catch (caughtError: unknown) {
                const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
                console.error(`[ProductPage] Error al cargar el producto ${productSlug}:`, error);

                setError("Error al cargar la información del producto.");
                setProduct(null);
                setMainImage(undefined);
            } finally {
                setLoading(false);
                console.log(`[ProductPage] Carga del producto principal finalizada para slug: ${productSlug}`);
            }
        };

        fetchProduct(); // Ejecutamos la funci\u00F3n de carga del producto principal

        // Este efecto solo depende de productSlug
    }, [productSlug]);


    // *** MANEJADOR DE EVENTO para galer\u00EDa ***
    const handleThumbnailClick = (imageUrl: string) => {
        setMainImage(imageUrl);
    };


    // *** RENDERIZADO CONDICIONAL (Loading, Error, Not Found, o Producto) ***

    if (loading) {
        return (<div className="page-container"><div className="product-page-loading">Cargando producto...</div></div>);
    }

    if (error) {
         return (<div className="page-container"><div className="product-page-error">Error: {error}</div></div>);
    }

    if (!product) {
        return (<div className="page-container"><div className="product-page-not-found">Producto no encontrado.</div></div>);
    }


    /*
     * *** Si llegamos aquí, significa que se cargó exitosamente un producto. Mostramos sus detalles Y los relacionados. ***
     */

    // Preparamos el identificador de categoría para pasarlo al CategoryCarousel
    // Asumimos que el producto tiene al menos una categor\u00EDa y usamos la primera,
    // o puedes unir todos los IDs si quieres productos de CUALQUIERA de sus categor\u00EDas.
    const categoryIdentifierForCarousel = product.categories && product.categories.length > 0
                                            ? product.categories.map(cat => cat.id).join(',') // Pasamos una cadena de IDs
                                            : undefined; // No hay categor\u00EDas, no pasamos identificador


    return (
        <div className="page-container product-page-container">
            {/* ... (Título, Secci\u00F3n Principal de Detalles - Galer\u00EDa e Info, Descripci\u00F3n Completa - TODO ESTO SE MANTIENE IGUAL) ... */}

            {/* T\u00EDtulo principal del producto. */}
            <h1 className="product-title-heading">{product.name}</h1>

             {/* Contenedor principal que organiza la galer\u00EDa de im\u00Eaacute;genes y la secci\u00F3n de informaci\u00F3n principal. */}
             <div className="product-details-main">
                 {/* Secci\u00F3n de im\u00Eaacute;genes del producto */}
                 <div className="product-images-gallery">
                     {/* ... (Imagen principal y miniaturas) ... */}
                      {mainImage ? (
                         <img src={mainImage} alt={product.name} className="product-main-image" />
                     ) : product.images && product.images.length > 0 ? (
                         <img src={product.images[0].src} alt={product.images[0].alt || product.name} className="product-main-image" />
                     ) : (
                         <div className="no-product-image">Imagen no disponible</div>
                     )}

                     {product.images && product.images.length > 1 && (
                         <div className="product-thumbnails">
                             {product.images.map((image, index: number) => (
                                 <img
                                     key={image.id || index}
                                     src={image.src}
                                     alt={image.alt || `Thumbnail de ${product.name}`}
                                     className={`product-thumbnail ${mainImage === image.src ? 'active' : ''}`}
                                     onClick={() => handleThumbnailClick(image.src)}
                                 />
                             ))}
                         </div>
                     )}
                 </div>

                 {/* Secci\u00F3n de informaci\u00F3n b\u00Eaacute;sica del producto */}
                 <div className="product-info">
                     {/* ... (Precios, Metadatos - SKU, Stock, Categor\u00EDas, Marca, Descripci\u00F3n Breve) ... */}
                     <div className="product-price-container">
                         {product.on_sale && product.regular_price && product.regular_price !== product.price && (
                             <span className="regular-price">{product.regular_price}€</span>
                         )}
                         <span className={`current-price ${product.on_sale ? 'sale' : ''}`}>{product.price}€</span>
                     </div>

                     <div className="product-meta">
                         {product.sku && (<p className="product-sku"><strong>SKU:</strong> {product.sku}</p>)}
                         {product.stock_status && (
                              <p className={`stock-status ${product.stock_status}`}>
                                  <strong>Estado:</strong> {
                                          product.stock_status === 'instock' ? 'En Stock' :
                                          product.stock_status === 'outofstock' ? 'Agotado' :
                                          product.stock_status === 'onbackorder' ? 'En espera' :
                                          product.stock_status
                                      }
                              </p>
                          )}
                          {product.categories && product.categories.length > 0 && (
                             <p className="product-categories">
                                 <strong>Categoría:</strong> {
                                         product.categories.map((cat, index: number) => (
                                             <React.Fragment key={cat.id || index}>
                                                 <Link to={`/productos/${cat.slug}`}>{cat.name}</Link>
                                                 {index < product.categories.length - 1 && ', '}
                                             </React.Fragment>
                                         ))
                                     }
                             </p>
                         )}
                          {product.brand && product.brand.length > 0 && (
                             <p className="product-brands">
                                 <strong>Marca:</strong> {
                                         product.brand.map((b, index: number) => (
                                             <React.Fragment key={b.id || index}>
                                                 {b.image && b.image.src && (
                                                      <img
                                                          src={b.image.src}
                                                          alt={b.image.alt || `Logo de ${b.name}`}
                                                          className="brand-logo-product-page"
                                                      />
                                                 )}
                                                 <Link to={`/marca/${b.slug}`}>{b.name}</Link>
                                                 {product.brand && index < product.brand.length - 1 && ', '}
                                             </React.Fragment>
                                         ))
                                     }
                             </p>
                         )}
                     </div>

                     <div className="product-short-description">
                         <h3>Descripción Breve</h3>
                         {product.short_description ? (
                             <div dangerouslySetInnerHTML={{ __html: product.short_description }} />
                         ) : (
                             <p>No hay descripción breve disponible.</p>
                         )}
                     </div>
                 </div>
             </div>

             {/* SECCI\u00D3N DE DESCRIPCI\u00D3N COMPLETA DEL PRODUCTO. */}
             <div className="product-full-description">
                 <h3>Descripción Completa</h3>
                 {product.description ? (
                     <div dangerouslySetInnerHTML={{ __html: product.description }} />
                 ) : (
                     <p>No hay descripción completa disponible.</p>
                 )}
             </div>


            {/*
             * *** SECCIÓN DE PRODUCTOS RELACIONADOS (Implementada con CategoryCarousel) ***
             * Usamos el nuevo componente CategoryCarousel aqu\u00ED.
             * Le pasamos el identificador de la categor\u00EDa y el ID del producto actual para excluirlo.
             */}
            {categoryIdentifierForCarousel && ( // Solo renderizamos el carrusel si hay una categor\u00EDa v\u00E1lida
                 <CategoryCarousel
                     title={`Más en "${product.categories[0]?.name || 'esta categoría'}"`} // T\u00EDtulo din\u00E1mico
                     categoryIdentifier={categoryIdentifierForCarousel} // Le pasamos el ID o cadena de IDs de la categoría
                     productsToShow={5} // Muestra 5 productos en el carrusel
                     productsPerFetch={10} // Opcional: Pide m\u00E1s a la API si quieres que el carrusel rote por un pool m\u00E1s grande
                     excludeProductId={product.id} // Excluye el producto que estamos viendo
                 />
            )}
             {/* Si no hay categor\u00EDa para el carrusel, no se renderiza */}
             {!categoryIdentifierForCarousel && (
                 <div className="no-related-products-message">No se encontraron categor\u00EDas para mostrar productos relacionados.</div>
             )}


            {/*
             * Opcional: Podr\u00EDas a\u00F1adir aqu\u00ED un BrandCarousel si quisieras tener ambos.
             * Aseg\u00FArate de pasarle el ID/Slug de la marca.
             * Si quieres UN SOLO carrusel combinado (categor\u00EDa + marca), tendr\u00EDas que
             * modificar CategoryCarousel (o crear un nuevo CombinedCarousel) para hacer
             * ambas llamadas API, combinar los resultados y desduplicar.
             */}


            {/* ... (otras secciones futuras) ... */}

        </div>
    );
}

export default ProductPage;