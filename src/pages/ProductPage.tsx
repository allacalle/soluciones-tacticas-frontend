// src/pages/ProductPage.tsx

import  { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Hook para leer parámetros de la URL
import './css/ProductPage.css'; // Importa los estilos CSS para esta página

// *** Importa la interfaz Product ***
import { Product } from '../types'; // O puede ser de '../api/wooApi' si la tienes ahí

import { getProductByIdOrSlug } from '../api/wooApi'; // Verifica la ruta



// Componente de la página de producto individual
function ProductPage() { // Este componente no necesita props por ahora

    // Leemos el parámetro 'productSlug' de la URL.
    // Asumimos que la ruta en tu router será algo como '/productos/:productSlug'
    const { productSlug } = useParams<{ productSlug: string }>();

    // Estado para guardar los datos del producto cargado
    const [product, setProduct] = useState<Product | null>(null);
    // Estado para el estado de carga
    const [loading, setLoading] = useState(true); // Empezamos cargando por defecto
    // Estado para los errores
    const [error, setError] = useState<string | null>(null);


    // *** useEffect para simular la carga de datos cuando el componente se monta o el slug cambia ***
    // REEMPLAZAREMOS ESTO CON LA LLAMADA API REAL DESPUÉS
    useEffect(() => {
        // Si no hay productSlug en la URL, mostramos un error
        if (!productSlug) {
            setError("No se proporcionó un identificador de producto en la URL.");
            setLoading(false);
            // Opcional: redirigir si no hay slug
            // navigate('/');
            return;
        }

        console.log(`[ProductPage] Simulando carga para slug: ${productSlug}`); // Log

        // *** FUNCIÓN ASYNC PARA CARGAR EL PRODUCTO REAL DESDE LA API ***
		const fetchProduct = async () => {
			try {
				setLoading(true); // Indica que la carga empieza
				setError(null); // Limpia cualquier error anterior

				// *** LLAMADA REAL A LA FUNCIÓN API getProductByIdOrSlug ***
				// getProductByIdOrSlug espera el slug (o ID) que leemos de useParams
				const fetchedProduct = await getProductByIdOrSlug(productSlug);

				if (fetchedProduct) {
					// Si la API devolvió un producto válido (no null)
					setProduct(fetchedProduct); // Guarda el producto encontrado en el estado
					console.log(`[ProductPage] Product loaded: ${fetchedProduct.name}`); // Log de éxito
				} else {
					// Si la API devolvió null (esto ocurre en getProductByIdOrSlug si no encuentra el producto)
					setError("Producto no encontrado.");
					setProduct(null); // Asegura que el estado de producto es null
					console.warn(`[ProductPage] Product with slug "${productSlug}" not found by API.`); // Log de no encontrado
				}
            } catch (caughtError: unknown) { // *** Cambiamos error: any a caughtError: unknown ***
				// console.error(`[ProductPage] Error fetching product ${productSlug}:`, caughtError); // Opcional: log el error crudo

				// *** Manejo de error más robusto usando unknown ***
				const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError)); // Si ya es un Error, úsalo; si no, crea uno.

				console.error(`[ProductPage] Error al cargar el producto ${productSlug}:`, error); // Log el error manejado

				// Puedes intentar mostrar el mensaje del error si es útil al usuario
				// const errorMessage = error.message || "Error desconocido al cargar el producto.";
				// setError(`Error: ${errorMessage}`); // Muestra el mensaje del error al usuario

				// O un mensaje más genérico y amigable para el usuario (recomendado inicialmente):
				setError("Error al cargar la información del producto."); // Mensaje amigable

				setProduct(null); // Asegura que product es null en caso de error
			} finally { // *** Mantén el bloque finally como estaba, pero asegúrate de que está aquí ***
				setLoading(false); // La carga ha terminado
				console.log(`[ProductPage] Finished fetching process for slug: ${productSlug}`); // Log
			}
		};

		fetchProduct(); // Ejecuta la función de carga al montar el componente o cambiar el slug

		// Función de limpieza: Si la petición fetch() es larga y el componente se desmonta,
		// podrías necesitar cancelar la petición para evitar errores de estado.
		// Para eso se usa AbortController, pero por ahora no es crítico.
		// return () => { /* lógica de cancelación si la implementas */ };


	}, [productSlug]); // *** Dependencia: Re-ejecutar este efecto cada vez que el 'productSlug' en la URL cambie ***



    // ==============================================================
    /* *** Renderizado Condicional (Return JSX) *** */
    // ==============================================================

    // Mostramos mensajes de estado (carga, error, no encontrado)
    if (loading) {
        return <div className="product-page-loading">Cargando producto...</div>;
    }

    if (error) {
        return <div className="product-page-error">Error: {error}</div>;
    }

    // Si no está cargando, no hay error, pero product es null (simulando "no encontrado")
    if (!product) {
         return <div className="product-page-not-found">Producto no encontrado.</div>;
    }


    // *** Si no está cargando, no hay error y tenemos un producto, mostramos los detalles ***
    // Usaremos las clases CSS que definiremos en el siguiente paso
    return (
        <div className="product-page-container">

             {/* NOTA: El Header y Footer normalmente se añaden en el Layout general (App.tsx o Layout.tsx) */}
             {/* <Header /> */}
             {/* <Footer /> */}


             <h1>{product.name}</h1> {/* Nombre del producto */}

             <div className="product-details-main"> {/* Contenedor para imagen e info principal */}

                 <div className="product-images"> {/* Sección de imágenes */}
                     {product.images && product.images.length > 0 ? (
                         // Muestra la primera imagen disponible del array de imágenes
                         <img src={product.images[0].src} alt={product.images[0].alt || product.name} className="product-main-image"/>
                         // Aquí podrías implementar una galería/slider si hay varias imágenes (Paso futuro)
                     ) : (
                         <div className="no-product-image">Imagen no disponible</div> // Mensaje si no hay imagen
                     )}
                 </div>

                 <div className="product-info"> {/* Sección de información del producto */}
                     <p className="product-price">{product.price} €</p> {/* Precio */}

                     {/* Botón de añadir al carrito (Paso futuro) */}
                      <button className="add-to-cart-button">Añadir al carrito</button>

                     <div className="product-short-description"> {/* Descripción breve */}
                          <h3>Descripción Breve</h3>
                          {/* Usamos dangerouslySetInnerHTML porque las descripciones de la API suelen venir en HTML */}
                          {/* TEN CUIDADO con esto si la fuente de las descripciones no es 100% confiable */}
                          {product.short_description ? (
                             <div dangerouslySetInnerHTML={{ __html: product.short_description }} />
                          ) : (
                             <p>No hay descripción breve disponible.</p> // Mensaje si no hay short_description
                          )}
                      </div>

                      {/* Puedes añadir más información aquí: SKU, Stock, Categorías, Marcas (Paso futuro) */}

                 </div> {/* Cierre product-info */}

             </div> {/* Cierre product-details-main */}


             <div className="product-full-description"> {/* Sección de descripción completa */}
                  <h3>Descripción Completa</h3>
                   {/* Usamos dangerouslySetInnerHTML para la descripción completa */}
                  {product.description ? (
                     <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                      <p>No hay descripción completa disponible.</p> // Mensaje si no hay description
                  )}
             </div>


             {/* Secciones futuras: Productos Relacionados, Reseñas, etc. */}
             {/* <div className="related-products"> ... </div> */}
             {/* <div className="product-reviews"> ... </div> */}


         </div> // Cierre product-page-container
    );
}

export default ProductPage; // Exporta el componente