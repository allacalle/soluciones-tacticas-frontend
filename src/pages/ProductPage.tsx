// src/pages/ProductPage.tsx

// Importar hooks de React
import React, { useEffect, useState } from 'react'; // Necesitamos React para React.Fragment en la visualización del precio
// Importar hooks de react-router-dom
import { useParams, Link } from 'react-router-dom'; // Importamos useParams para obtener el slug y Link para navegación
// Importar estilos CSS para esta página
import './css/ProductPage.css';

// *** Importa la interfaz Product (asegúrate de que esté actualizada con los metadatos Y la imagen de marca) ***
// La interfaz Product en tu archivo src/types.ts debe incluir las propiedades 'sku', 'stock_status', 'categories', y 'brand' (o el nombre correcto para la marca).
// CRUCIAL: La definición de 'brand' dentro de Product en types.ts debe incluir la propiedad 'image?'
import { Product } from '../types';

// Importar la función para obtener un producto específico desde la API
import { getProductByIdOrSlug , getProducts} from '../api/wooApi';


/*
 * Componente de la página de detalle de producto individual (versión mejorada para escaparate)
 * Enfocada en mostrar imágenes, precio, descripciones y metadatos clave con enlaces.
 */
function ProductPage() {
    /*
     * Leemos el parámetro 'productSlug' de la URL.
     * Asumimos que la ruta en tu router será algo como '/productos/:productSlug'
     */
    const { productSlug } = useParams<{ productSlug: string }>();


    /*
     * Estado para guardar los datos del producto cargado (inicialmente null)
     */
    const [product, setProduct] = useState<Product | null>(null);
    /*
     * Estado para el estado de carga (true mientras se obtienen los datos de la API, false cuando termina)
     */
    const [loading, setLoading] = useState(true); // Empezamos cargando por defecto
    /*
     * Estado para los errores (guarda un mensaje si ocurre algún problema, null si no hay error)
     */
    const [error, setError] = useState<string | null>(null);

    /*
     * Estado para la URL de la imagen principal mostrada en la galería básica (inicialmente undefined)
     */
    const [mainImage, setMainImage] = useState<string | undefined>(undefined);


    /*
     * useEffect para cargar el producto desde la API cuando el componente se monta o el slug de la URL cambia.
     * Se ejecuta al inicio y cada vez que 'productSlug' (la dependencia del efecto) cambia.
     */
    useEffect(() => {
        /*
         * Validamos si hay un productSlug en la URL. Si no, mostramos un error y detenemos la carga.
         */
        if (!productSlug) {
            setError("No se proporcionó un identificador de producto en la URL.");
            setLoading(false);
            // Opcional: usar navigate('/productos') aquí si quieres redirigir
            // import { useNavigate } from 'react-router-dom'; const navigate = useNavigate();
            // navigate('/productos'); // Ejemplo de redirección
            return; /* Salimos del efecto */
        }

        console.log(`[ProductPage] Iniciando carga para slug: ${productSlug}`); // Log de inicio para depuración


        /*
         * Función asíncrona para realizar la llamada a la API y obtener el producto.
         */
        const fetchProduct = async () => {
            try {
                /* Reiniciamos estados relacionados con la carga y los datos del producto */
                setLoading(true); // Empezamos la carga
                setError(null); // Limpiamos errores anteriores
                setProduct(null); // Limpiamos datos de producto anteriores
                setMainImage(undefined); // Limpiamos imagen principal anterior

                /* Realizamos la llamada a la función de la API para obtener el producto por su slug */
                /* Esta función ahora también fetchea la imagen de la marca si existe */
                const fetchedProduct = await getProductByIdOrSlug(productSlug);

                /* Verificamos si la llamada a la API fue exitosa y devolvió un producto (no null/undefined) */
                if (fetchedProduct) {
                    /* Si se encontró el producto, actualizamos el estado 'product' */
                    setProduct(fetchedProduct);
                    console.log(`[ProductPage] Producto cargado: ${fetchedProduct.name}`); // Log de éxito
                    console.log("[ProductPage] Datos completos del producto:", fetchedProduct); // *** A\u00D1ADE ESTA L\u00CDNEA ***


                    /*
                     * Si el producto tiene imágenes, establecemos la URL de la primera imagen como la imagen principal por defecto.
                     */
                    if (fetchedProduct.images && fetchedProduct.images.length > 0) {
                        setMainImage(fetchedProduct.images[0].src);
                    }
                    // Si no hay imágenes, mainImage permanecerá undefined, y el JSX mostrará el placeholder.

                } else {
                    /* Si la API devolvió null o el producto no fue encontrado */
                    setError("Producto no encontrado."); // Establecemos un mensaje de error para el usuario
                    setProduct(null); // Aseguramos que el estado de producto es null
                    setMainImage(undefined); // Aseguramos que no hay imagen principal
                    console.warn(`[ProductPage] Producto con slug "${productSlug}" no encontrado por API.`); // Log de advertencia interna
                }
            } catch (caughtError: unknown) {
                /*
                 * Bloque para manejar cualquier excepción que ocurra durante la ejecución asíncrona (ej. error de red, error en la API).
                 * Usamos 'unknown' para un manejo seguro de errores.
                 */
                const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError)); // Intentamos convertir a tipo Error

                console.error(`[ProductPage] Error al cargar el producto ${productSlug}:`, error); // Log detallado del error para depuración

                /* Establecemos un mensaje de error amigable para el usuario */
                setError("Error al cargar la información del producto.");
                setProduct(null); // Aseguramos que product es null en caso de error
                setMainImage(undefined); // Aseguramos que no hay imagen principal
            } finally {
                /* Este bloque se ejecuta siempre al finalizar la función fetchProduct, independientemente de si hubo éxito o error */
                setLoading(false); // Indicamos que la carga ha terminado
                console.log(`[ProductPage] Proceso de carga finalizado para slug: ${productSlug}`); // Log de finalización
            }
        };

        fetchProduct(); /* Llamamos a la función de carga al montar el componente o al cambiar el slug */

        /*
         * Array de dependencias de useEffect: El efecto se re-ejecuta cada vez que el valor de productSlug cambia.
         * Si estuvieras cancelando la petición al desmontar, la lógica de cleanup iría aquí: return () => { /* cancelar petición *\/ };
         */
    }, [productSlug]);


    /*
     * Handler de evento para cuando se hace clic en una imagen en miniatura.
     * Actualiza el estado 'mainImage' con la URL de la imagen clickeada, cambiándola en la visualización principal.
     */
    const handleThumbnailClick = (imageUrl: string) => {
        setMainImage(imageUrl);
    };


    /*
     * ==============================================================
     * Renderizado Condicional del Componente (JSX)
     * ==============================================================
     * Esta parte determina qué se muestra en la página basándose en el estado de carga, errores o si se cargó un producto.
     */

    /*
     * Si estamos cargando los datos, mostramos un mensaje de carga.
     * Usamos la clase CSS 'page-container' para el layout general.
     */
    if (loading) {
        return (
            <div className="page-container">
                <div className="product-page-loading">Cargando producto...</div>
            </div>
        );
    }

    /*
     * Si hubo un error al cargar los datos (y no estamos cargando), mostramos un mensaje de error.
     */
    if (error) {
        return (
            <div className="page-container">
                <div className="product-page-error">Error: {error}</div>
            </div>
        );
    }

    /*
     * Si no estamos cargando, no hay error, pero el estado 'product' es null, significa que el producto no fue encontrado.
     */
    if (!product) {
        return (
            <div className="page-container">
                <div className="product-page-not-found">Producto no encontrado.</div>
            </div>
        );
    }


    /*
     * *** Si llegamos aquí, significa que se cargó exitosamente un producto. Mostramos sus detalles para el escaparate. ***
     * Usamos las clases CSS definidas en ProductPage.css para dar formato y layout a los elementos.
     */
    return (
        <div className="page-container product-page-container">
            {/* El layout general de la página (padding, ancho máximo) viene de page-container */}
            {/* Clases específicas de ProductPage para este componente */}

            {/* NOTA: Header y Footer suelen ir en un Layout general (App.tsx o Layout.tsx), no aquí. */}

            {/* Título principal del producto. Se coloca arriba para que ocupe todo el ancho antes del layout de 2 columnas. */}
            <h1 className="product-title-heading">{product.name}</h1>


            {/*
             * Contenedor principal que organiza la galería de imágenes y la sección de información principal en 2 columnas en desktop.
             */}
            <div className="product-details-main">

                {/*
                 * Sección de imágenes del producto: La galería básica interactiva con imagen principal y miniaturas clickables.
                 * Es la columna izquierda en el layout de 2 columnas.
                 */}
                <div className="product-images-gallery">
                    {/* Imagen principal que se muestra en grande. Usa el estado 'mainImage'. */}
                    {mainImage ? (
                        <img src={mainImage} alt={product.name} className="product-main-image" />
                    ) : product.images && product.images.length > 0 ? (
                        /* Fallback: Si 'mainImage' no tiene valor (ej. al cargar inicialmente), muestra la primera imagen del producto. */
                        <img src={product.images[0].src} alt={product.images[0].alt || product.name} className="product-main-image" />
                    ) : (
                        /* Si el producto no tiene imágenes en absoluto, muestra un mensaje de placeholder. */
                        <div className="no-product-image">Imagen no disponible</div>
                    )}

                    {/* Miniaturas de las imágenes. Solo se muestran si el producto tiene más de una imagen. */}
                    {product.images && product.images.length > 1 && (
                        <div className="product-thumbnails">
                            {/* Mapeamos sobre el array de imágenes para crear una miniatura por cada imagen */}
                            {/* 'image' es el objeto de imagen, 'index' es su posición en el array */}
                            {product.images.map((image, index: number) => (
                                <img
                                    key={image.id || index} /* Clave única para cada miniatura (usamos el ID de la imagen si existe, si no el índice del array) */
                                    src={image.src} /* La URL de la imagen para la miniatura */
                                    alt={image.alt || `Thumbnail de ${product.name}`} /* Texto alternativo (usa el alt de la imagen, si no el nombre del producto) */
                                    /* Clase condicional: añade 'active' si la URL de esta miniatura coincide con la 'mainImage' actual */
                                    className={`product-thumbnail ${mainImage === image.src ? 'active' : ''}`}
                                    /* Manejador de clic: al hacer clic en la miniatura, actualiza el estado 'mainImage' */
                                    onClick={() => handleThumbnailClick(image.src)}
                                />
                            ))}
                        </div>
                    )}
                </div> {/* Cierre product-images-gallery */}


                {/*
                 * Sección de información básica del producto.
                 * Es la columna derecha en el layout de 2 columnas. Contiene precio, metadatos y descripción breve.
                 */}
                <div className="product-info">

                    {/*
                     * *** VISUALIZACIÓN DE PRECIOS (Original vs Oferta) ***
                     * Muestra el precio regular (tachado) si el producto está en oferta y el precio es diferente al precio regular.
                     * Siempre muestra el precio actual (que será el de oferta si aplica).
                     * Usamos React.Fragment para agrupar los elementos condicionales sin añadir un div extra en el DOM.
                     */}
                    <div className="product-price-container">
                        {/* Si está en oferta Y el precio regular es distinto del precio actual, muestra el precio regular tachado */}
                        {product.on_sale && product.regular_price && product.regular_price !== product.price ? (
                            <span className="regular-price">{product.regular_price}€</span>
                        ) : (
                            /* Si no hay oferta o los precios son iguales, no renderizamos este span */
                            null
                        )}
                        {/* Siempre mostramos el precio actual. Añadimos la clase 'sale' si está en oferta para aplicar estilos específicos. */}
                        <span className={`current-price ${product.on_sale ? 'sale' : ''}`}>{product.price}€</span>
                    </div> {/* Cierre product-price-container */}


                    {/*
                     * *** SECCIÓN DE METADATOS ADICIONALES ***
                     * Muestra información como SKU, Estado de Stock, Categorías y Marca, con enlaces de navegación.
                     * Esta es una adición clave para un "escaparate" informativo y navegable.
                     */}
                    <div className="product-meta">
                        {/* Muestra el SKU del producto si la propiedad 'sku' existe en los datos del producto */}
                        {product.sku && (
                            <p className="product-sku"><strong>SKU:</strong> {product.sku}</p>
                        )}

                        {/* Muestra el Estado del Stock si la propiedad 'stock_status' existe */}
                        {product.stock_status && (
                            <p className={`stock-status ${product.stock_status}`}>
                                <strong>Estado:</strong> {
                                    /* Usamos un ternario para mostrar un texto amigable en español según el valor de la API */
                                    product.stock_status === 'instock' ? 'En Stock' :
                                    product.stock_status === 'outofstock' ? 'Agotado' :
                                    product.stock_status === 'onbackorder' ? 'En espera' :
                                    product.stock_status /* Si es otro valor no mapeado, mostramos el valor tal cual */
                                }
                            </p>
                        )}

                        {/* Muestra la lista de Categorías si la propiedad 'categories' existe y es un array con elementos */}
                        {product.categories && product.categories.length > 0 ? ( /* Usamos ternario para la condición principal */
                            <p className="product-categories">
                                <strong>Categoría:</strong> {
                                    /* Mapeamos sobre el array de categorías para crear enlaces a cada una */
                                    product.categories.map((cat, index: number) => (
                                        /* 'cat' es el objeto de categoría, 'index' es su posición en el array */
                                        /* Usamos React.Fragment para poder agrupar el enlace y el separador (coma) sin añadir un div extra en el DOM */
                                        <React.Fragment key={cat.id || index}> {/* Clave única para el elemento mapeado (ID de categoría o índice) */}
                                            {/* Componente Link de react-router-dom para navegar a la página de la categoría por su slug */}
                                            <Link to={`/productos/${cat.slug}`}>{cat.name}</Link>
                                            {/* Añadimos una coma y un espacio después del enlace, excepto si es el último elemento del array */}
                                            {index < product.categories.length - 1 && ', '}
                                        </React.Fragment>
                                    ))
                                }
                            </p>
                        ) : null} {/* Si no hay categorías, renderizamos null */}

                        {/* Muestra la Marca del producto si la propiedad 'brand' (o similar) existe y es un array con elementos */}
                        {/* NOTA IMPORTANTE: La propiedad que contiene la marca puede variar según tu configuración/plugins de WooCommerce.
                         * Revisa tu interfaz Product en src/types.ts y la respuesta de la API para usar el nombre correcto de la propiedad (ej: product.brand, product.pa_brand).
                         * Asumimos aquí que es un array de términos con id, name, slug, similar a 'categories'. */}
                        {product.brand && product.brand.length > 0 ? ( /* Usamos ternario para la condición principal. Verifica que la propiedad 'brand' existe y tiene elementos */
                            <p className="product-brands">
                                <strong>Marca:</strong> {
                                    /* Mapeamos sobre el array de marcas (términos de taxonomía de marca) */
                                    product.brand.map((b, index: number) => (
                                        /* 'b' es el objeto de marca (ahora puede incluir 'image' gracias a wooApi y types) */
                                        /* Usamos React.Fragment para agrupar los elementos (imagen, enlace, separador) */
                                        <React.Fragment key={b.id || index}> {/* Clave única (ID de marca o índice) */}
                                            {/* *** LÓGICA AÑADIDA: Mostrar imagen de marca si existe *** */}
                                            {b.image && b.image.src && ( /* Verificamos si el objeto de marca 'b' tiene 'image' y si 'image' tiene 'src' */
                                                <img
                                                    src={b.image.src} // Usamos la URL de la imagen de marca
                                                    alt={b.image.alt || `Logo de ${b.name}`} // Texto alternativo (usa el alt de la imagen si existe, si no el nombre de la marca)
                                                    className="brand-logo" // Añadimos una clase CSS para darle estilos (tamaño, margen, etc.)
                                                />
                                            )}
                                            {/* Componente Link para navegar a la página de la marca por su slug */}
                                            {/* Asegúrate de que la ruta '/marcas/:slug' está configurada en tu router */}
                                            <Link to={`/marca/${b.slug}`}>{b.name}</Link>
                                            {/* Añadimos una coma y un espacio, excepto si es el último elemento */}
                                            {product.brand && index < product.brand.length - 1 && ', '}
                                        </React.Fragment>
                                    ))
                                }
                            </p>
                        ) : null} {/* Si no hay marcas, renderizamos null */}
                    </div> {/* Cierre product-meta */}


                    {/*
                     * Descripción breve del producto.
                     * Se mantiene dentro de la columna de información principal.
                     */}
                    <div className="product-short-description">
                        <h3>Descripción Breve</h3>
                        {/* Usamos dangerouslySetInnerHTML para renderizar el HTML de la descripción breve que viene de la API. Ten precaución con la fuente. */}
                        {product.short_description ? (
                            <div dangerouslySetInnerHTML={{ __html: product.short_description }} />
                        ) : (
                            <p>No hay descripción breve disponible.</p>
                        )}
                    </div> {/* Cierre product-short-description */}


                    {/*
                     * En esta versión, hemos eliminado el botón de "Añadir al carrito" y placeholders de variaciones, cantidad, etc.
                     * Estos elementos se pueden añadir gradualmente más adelante según evolucionen los requisitos.
                     */}

                </div> {/* Cierre product-info */}

            </div> {/* Cierre product-details-main */}


            {/*
             * SECCIÓN DE DESCRIPCIÓN COMPLETA DEL PRODUCTO.
             * Aparece debajo de la sección principal de 2 columnas y ocupa todo el ancho de la página.
             */}
            <div className="product-full-description">
                <h3>Descripción Completa</h3>
                {/* Usamos dangerouslySetInnerHTML para renderizar el HTML de la descripción completa que viene de la API. */}
                {product.description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                    <p>No hay descripción completa disponible.</p>
                )}
            </div> {/* Cierre product-full-description */}


            {/*
             * Secciones futuras: Aquí podrías añadir secciones como Productos Relacionados, Productos en Oferta, etc.
             * Estas secciones se pueden añadir más adelante según sea necesario, utilizando el componente ProductListSection.
             */}

        </div>
    );
} // <-- Asegúrate de que este corchete de cierre está

export default ProductPage; // <-- Asegúrate de que esta línea está