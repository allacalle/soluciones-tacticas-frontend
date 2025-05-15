// src/pages/ProductPage.tsx

// Importar hooks de React
import React, { useEffect, useState } from 'react';
// Importar hooks de react-router-dom
import { useParams, Link } from 'react-router-dom';
// Importar estilos CSS para esta página
import './css/ProductPage.css';

// Importar las interfaces necesarias (Product, Brand, Attribute, Variation, VariationAttribute)
// Aseg\u00FArate de que estas interfaces est\u00E9n definidas en tu archivo src/types.ts Y exportadas.
import { Product, Variation, VariationAttribute } from '../types';

// Importar las funciones de la API necesarias (getProductByIdOrSlug)
// *** NECESITAREMOS A\u00D1ADIR getVariationsByProductId EN wooApi.tsx LATER ***
import { getProductByIdOrSlug } from '../api/wooApi';
// import { getVariationsByProductId } from '../api/wooApi'; // <--- Descomentar y usar cuando la funci\u00F3n exista


// *** Importar el componente CategoryCarousel ***
import CategoryCarousel from '../components/CategoryCarousel';
import VariableAttributeSelector from '../components/VariableAttributeSelector';

// === Mapeo para nombres de colores de la API a valores CSS ===
// A\u00F1ade aqu\u00ED los nombres de color que vienen de tu API y sus c\u00F3digos HEX o nombres CSS v\u00Eaacute;lidos.
// Esto es necesario si los nombres de color de tu API no son directamente entendidos por CSS.
// Define esto FUERA de la funci\u00F3n del componente.
const colorMap: { [key: string]: string } = {
    "Negro": "#000000", // Negro -> HEX negro
    "Azul Oscuro": "#00008B", // Azul Oscuro -> CSS darkblue (o c\u00F3digo HEX)
    "Gris": "#808080", // Gris -> HEX gris (o nombre CSS grey)
    "Rojo": "#FF0000", // Ejemplo: Rojo
    "Verde": "#008000", // Ejemplo: Verde
    "Blanco": "#FFFFFF", // Ejemplo: Blanco (puede necesitar borde para verse)
    // A\u00Fñade todos los colores que uses en tus productos
};


/*
 * Componente de la página de detalle de producto individual (versión escaparate)
 * Muestra imágenes, precio, descripciones, metadatos y productos variables.
 */
function ProductPage() { // <<< Inicio de la funci\u00F3n del componente ProductPage
    // ======================================================================
    // *** ESTADOS (Hooks useState) ***
    // Se declaran al inicio de la funci\u00F3n del componente.
    // ======================================================================
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
     * Estado para la URL de la imagen principal que controla las miniaturas activas
     * (Mantenemos este para saber qu\u00E9 miniatura resaltar, aunque displayedImage es la que se ve grande)
     */
    const [mainImage, setMainImage] = useState<string | undefined>(undefined);

    // === ESTADO PARA GUARDAR LAS OPCIONES DE ATRIBUTOS SELECCIONADAS ===
    // Usaremos un objeto donde la clave es el nombre del atributo (ej: "Color", "Talla")
    // y el valor es la opci\u00F3n seleccionada (ej: "Negro", "M"). Inicializamos como un objeto vac\u00EDo.
    const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string | null }>({});

    // === ESTADO PARA GUARDAR LOS DATOS COMPLETOS DE LAS VARIACIONES HIJAS ===
    // Necesitaremos cargar esto despu\u00E9s de cargar el producto variable padre.
    // Usamos la interfaz Variation[] que definimos en types.ts.
    const [variationsData, setVariationsData] = useState<Variation[]>([]); // Usamos Variation[]
    const [variationsLoading, setVariationsLoading] = useState(false); // Estado de carga para variaciones
    const [variationsError, setVariationsError] = useState<string | null>(null); // Estado de error para variaciones

    // === ESTADO PARA EL PRECIO Y LA IMAGEN QUE SE MUESTRAN ACTUALMENTE AL USUARIO ===
    // Esto nos permitir\u00Eaacute; actualizar el precio y la imagen cuando se seleccione una variaci\u00F3n.
    // Inicialmente, usar\u00Eaacute;n los valores del producto padre.
    const [displayedPrice, setDisplayedPrice] = useState<string | undefined>(undefined);
    const [displayedImage, setDisplayedImage] = useState<string | undefined>(undefined);

    // Funci\u00F3n para manejar la selecci\u00F3n de un atributo desde VariableAttributeSelector
    const handleAttributeSelect = (attributeName: string, option: string) => {
    console.log(`[ProductPage] Atributo seleccionado por el hijo: ${attributeName} - ${option}`);
    // Usa el setter setSelectedAttributes para actualizar el estado
    setSelectedAttributes(prev => ({
        ...prev, // Copia las selecciones anteriores
        [attributeName]: option // Actualiza o a\u00F1ade la opci\u00F3n seleccionada para este atributo
    }));
     // NOTA: La l\u00F3gica de actualizar displayedPrice/Image YA EST\u00C1 en el segundo useEffect,
     // y ese useEffect se dispara AUTOMATICAMENTE cuando selectedAttributes cambia.
     // No necesitas actualizar displayedPrice/Image aqu\u00ED directamente.
};


    // ======================================================================
    // *** EFECTO 1: Cargar el producto principal y (opcionalmente) sus variaciones ***
    // Se ejecuta cuando cambia productSlug (la URL del producto).
    // ======================================================================
    useEffect(() => { // <<< Inicio del primer useEffect

        console.log(`[ProductPage] useEffect principal disparado para slug: ${productSlug}`);

        if (!productSlug) {
            setError("No se proporcionó un identificador de producto en la URL.");
            setLoading(false);
            setProduct(null);
            setMainImage(undefined);
            setDisplayedImage(undefined); // Limpiar estados mostrados
            setDisplayedPrice(undefined);
            setSelectedAttributes({}); // Limpiar estado de atributos seleccionados
            setVariationsData([]); // Limpiar datos de variaciones
            setVariationsError(null); // Limpiar error de variaciones
            return; // Salir del useEffect si no hay slug
        }

        const fetchProductAndVariations = async () => { // <<< Funci\u00F3n as\u00EDncrona definida dentro del useEffect
            try {
                // --- 1. RESETEAR ESTADOS AL INICIO DE LA CARGA ---
                setLoading(true);
                setError(null);
                setProduct(null);
                setMainImage(undefined);
                setDisplayedImage(undefined); // Resetear estados mostrados
                setDisplayedPrice(undefined);
                setSelectedAttributes({}); // Resetear selecci\u00F3n al cargar nuevo producto
                setVariationsData([]); // Resetear datos de variaciones
                setVariationsError(null); // Resetear error de variaciones


                // --- 2. FETCH DEL PRODUCTO PRINCIPAL ---
                // La funci\u00F3n getProductByIdOrSlug ya usa la API v3 y deber\u00EDa traer los atributos y IDs de variaciones
                const fetchedProduct = await getProductByIdOrSlug(productSlug); // <<< Variable fetchedProduct definida aqu\u00ED

                // --- 3. PROCESAR EL PRODUCTO PRINCIPAL ---
                if (fetchedProduct) { // Si se encontr\u00F3 el producto
                    console.log(`[ProductPage] Producto principal cargado: ${fetchedProduct.name}`);
                    console.log("[ProductPage] DEBUG - Tipo de producto API:", fetchedProduct.type);
                    console.log("[ProductPage] DEBUG - Atributos del producto API:", fetchedProduct.attributes); // Contiene opciones (ej: ["S", "M"])
                    console.log("[ProductPage] DEBUG - IDs de Variaciones API:", fetchedProduct.variations); // Contiene solo IDs [123, 124]

                    setProduct(fetchedProduct); // Guardar el producto padre en el estado


                    // Establecer la imagen principal inicial (del producto padre) y el precio inicial
                    if (fetchedProduct.images && fetchedProduct.images.length > 0) {
                        setMainImage(fetchedProduct.images[0].src);
                        setDisplayedImage(fetchedProduct.images[0].src); // Inicializar displayedImage
                    } else {
                         // Define una imagen placeholder si no hay im\u00E1genes
                         const placeholder = '/path/to/your/placeholder-image.jpg'; // <<< ¡REEMPLAZA CON TU RUTA REAL!
                         console.warn(`[ProductPage] Producto ${fetchedProduct.name} (ID: ${fetchedProduct.id}) no tiene im\u00Eaacute;genes principales. Usando placeholder.`);
                         setMainImage(placeholder); // Usar placeholder si no hay im\u00Eaacute;genes
                         setDisplayedImage(placeholder); // Inicializar displayedImage con placeholder
                    }
                     // Inicializar displayedPrice con el precio del producto padre
                     setDisplayedPrice(fetchedProduct.price);


                    // === 4. SI ES UN PRODUCTO VARIABLE, CARGAR SUS VARIACIONES HIJAS COMPLETAS ===
                    // Esto es necesario para obtener el precio, stock e imagen de cada combinaci\u00F3n.
                    if (fetchedProduct.type === 'variable' && fetchedProduct.id) {
                        console.log(`[ProductPage] Detectado producto variable (ID: ${fetchedProduct.id}). Cargando variaciones...`);
                        setVariationsLoading(true);
                        setVariationsError(null); // Resetear error de variaciones

                        try { // <<< Inicio del try para cargar variaciones
                            // *** ESTA L\u00CDNEA REQUIERE LA FUNCI\u00D3N getVariationsByProductId EN wooApi.tsx ***
                            // DEBES CREAR ESA FUNCI\u00D3N PARA QUE ESTA PARTE FUNCIONE.
                            // Mientras no exista, variationsDetails ser\u00Eaacute; undefined o el fetch fallar\u00Eaacute;.

                             // const variationsDetails = await getVariationsByProductId(fetchedProduct.id); // <--- DESCOMENTAR CUANDO EXISTA LA FUNCI\u00D3N

                            // === TEMPORAL: Si no tienes getVariationsByProductId, setea variationsData a un array vac\u00EDo ===
                            // REMOVER esta secci\u00F3n TEMPORAL cuando getVariationsByProductId est\u00Eaacute; lista.
                             console.warn("[ProductPage] getVariationsByProductId no implementada. Las variaciones no se cargar\u00E1n correctamente. Implementa esta funci\u00F3n en wooApi.tsx.");
                             setVariationsData([]); // Setear a array vac\u00EDo temporalmente
                            // ========================================================================================


                            // Si el fetch de variaciones fuera exitoso (cuando implementes getVariationsByProductId):
                            // setVariationsData(variationsDetails); // <--- USAR ESTO CUANDO EL FETCH FUNCIONE
                            // console.log(`[ProductPage] Variaciones cargadas (${variationsDetails.length}).`, variationsDetails);


                             // === Inicializar estado de selecci\u00F3n para cada atributo de variaci\u00F3n ===
                             // Iterar sobre los atributos del producto padre que se usan para variaciones y establecer su valor inicial a null.
                             if (fetchedProduct.attributes && fetchedProduct.attributes.length > 0) {
                                  const initialSelection: { [key: string]: string | null } = {};
                                  fetchedProduct.attributes.forEach(attr => {
                                      if (attr.variation) { // Solo si es un atributo usado para crear variaciones
                                          initialSelection[attr.name] = null; // Inicializar a null (ninguna opci\u00F3n seleccionada por defecto)
                                          // Si quieres seleccionar la primera opci\u00F3n por defecto: initialSelection[attr.name] = attr.options[0];
                                      }
                                  });
                                  setSelectedAttributes(initialSelection);
                                  console.log("[ProductPage] Estado de selecci\u00F3n de atributos inicializado:", initialSelection);
                             } else {
                                 console.warn("[ProductPage] Producto variable sin atributos de variaci\u00F3n definidos.");
                             }


                        } catch (_vError: unknown) { // <=== CATCH CORREGIDO: usa _vError y unknown SIN ASTERSICOS
                             // Ahora _vError es de tipo unknown.
                            const error = _vError instanceof Error ? _vError : new Error(String(_vError));
                             console.error(`[ProductPage] Error al cargar variaciones para el producto ${fetchedProduct.id}:`, error);
                             setVariationsError("Error al cargar las opciones del producto.");
                             setVariationsData([]); // Asegurar que est\u00Eeacute; vac\u00EDo si hay error
                        } finally { // <<< Inicio del finally para cargar variaciones
                             setVariationsLoading(false); // La carga de variaciones termina
                             console.log("[ProductPage] Carga de variaciones finalizada.");
                        } // <<< Cierre del finally para cargar variaciones
                    } // Fin if (fetchedProduct.type === 'variable')


                } else { // <<< Si el producto principal NO fue encontrado
                   // --- Si el producto principal no fue encontrado ---
                   setError("Producto no encontrado.");
                   setProduct(null);
                   setMainImage(undefined);
                   setDisplayedImage(undefined); // Limpiar estados mostrados
                   setDisplayedPrice(undefined);
                   setSelectedAttributes({}); // Limpiar estado
                   setVariationsData([]); // Limpiar datos
                   setVariationsError(null); // Limpiar error
                   console.warn(`[ProductPage] Producto con slug "${productSlug}" no encontrado por API.`);
                }
            } catch (_caughtError: unknown) { // <=== CATCH CORREGIDO: usa _caughtError y unknown SIN ASTERSICOS
                 // Ahora _caughtError es de tipo unknown.
                const error = _caughtError instanceof Error ? _caughtError : new Error(String(_caughtError));
                 console.error(`[ProductPage] Error al cargar el producto ${productSlug}:`, error);

                 setError("Error al cargar la información del producto.");
                 setProduct(null);
                 setMainImage(undefined);
                 setDisplayedImage(undefined); // Limpiar estados mostrados
                 setDisplayedPrice(undefined);
                 setSelectedAttributes({}); // Limpiar estado
                 setVariationsData([]); // Limpiar datos
                 setVariationsError(null); // Limpiar error
            } finally { // <<< Inicio del finally para la carga principal
                setLoading(false); // La carga del producto principal termina siempre
                console.log(`[ProductPage] Carga del producto principal finalizada para slug: ${productSlug}`);
            } // <<< Cierre del finally para la carga principal
        }; // <<< Cierre de la funci\u00F3n fetchProductAndVariations

        fetchProductAndVariations(); // Ejecutamos la funci\u00F3n de carga

        // Dependencias del primer useEffect: Se ejecuta cuando productSlug cambia.
        // Aseg\u00FArate de no a\u00Fñadir objetos o arrays creados DENTRO del efecto como dependencias.
    }, [productSlug]); // <<< Cierre del primer useEffect y sus dependencias


    // ======================================================================
    // *** EFECTO 2: Buscar variaci\u00F3n coincidente cuando cambia la selecci\u00F3n o los datos ***
    // Se ejecuta cuando cambia selectedAttributes, variationsData o product.
    // ======================================================================
     useEffect(() => { // <<< Inicio del segundo useEffect
         console.log("[ProductPage] useEffect para buscar variaci\u00F3n disparado.");
         console.log("[ProductPage] Estado actual de selectedAttributes:", selectedAttributes);
         console.log("[ProductPage] Estado actual de variationsData:", variationsData);
         console.log("[ProductPage] Producto actual:", product);

         // L\u00F3gica para actualizar displayedPrice y displayedImage
         // Debe ejecutarse si:
         // 1. El producto es variable Y
         // 2. Tenemos los datos de las variaciones (variationsData.length > 0) Y
         // 3. Se ha seleccionado una opci\u00F3n para *cada* atributo de variaci\u00F3n requerido.

         // Verificar si el producto es variable y si se han seleccionado opciones para todos los atributos de variaci\u00F3n.
         // `product?.attributes?.every(...)` itera sobre los atributos del producto padre.
         const allRequiredAttributesSelected = product?.type === 'variable' &&
                                               product.attributes?.every(attr =>
                                                    // Si es un atributo usado para variaci\u00F3n (`attr.variation` es true),
                                                    // entonces debe haber un valor seleccionado (`selectedAttributes[attr.name]` no es null ni undefined).
                                                    !attr.variation || (selectedAttributes[attr.name] !== null && selectedAttributes[attr.name] !== undefined)
                                               );

         console.log("[ProductPage] allRequiredAttributesSelected:", allRequiredAttributesSelected);


         // === L\u00F3gica para encontrar la variaci\u00F3n y actualizar el display ===
         // Solo buscar una variaci\u00F3n coincidente si se cumplen las condiciones anteriores
         if (product && product.type === 'variable' && variationsData.length > 0 && allRequiredAttributesSelected) {
              console.log("[ProductPage] Intentando encontrar variaci\u00F3n coincidente con selecci\u00F3n:", selectedAttributes);

              // Buscar la variaci\u00F3n en variationsData cuyo array de atributos coincida
              const matchingVariation = variationsData.find((variation: Variation) => { // Explicitamente tipamos 'variation'
                  // Cada variaci\u00F3n hija (`variation`) tiene un array `attributes` (de tipo VariationAttribute[])
                  // Debemos verificar si para CADA atributo en la VARIACI\u00D3N (`varAttr`),
                  // el valor seleccionado por el usuario para ese atributo (`selectedAttributes[varAttr.name]`)
                  // coincide con el valor que tiene ese atributo en la VARIACI\u00D3N hija (`varAttr.option`).

                  // Usamos .every() para asegurarnos de que todos los atributos de la variaci\u00F3n coincidan con la selecci\u00F3n
                  return variation.attributes.every((varAttr: VariationAttribute) => { // Explicitamente tipamos 'varAttr'
                       // Comparamos la opci\u00F3n seleccionada por el usuario para este atributo (selectedAttributes[varAttr.name])
                       // con el valor que tiene este atributo en la variaci\u00F3n actual (varAttr.option).
                       // Usamos optional chaining `?.toLowerCase()` por si selectedAttributes[varAttr.name] es undefined o null.
                       return selectedAttributes[varAttr.name]?.toLowerCase() === varAttr.option.toLowerCase();
                  });
              });

              console.log("[ProductPage] Resultado de la b\u00FAsqueda de variaci\u00F3n:", matchingVariation);

              if (matchingVariation) {
                  // === ACTUALIZAR displayedPrice Y displayedImage AL ENCONTRAR VARIACI\u00D3N ===
                  console.log(`[ProductPage] Variaci\u00F3n coincidente encontrada (ID: ${matchingVariation.id}). Actualizando display.`);
                  setDisplayedPrice(matchingVariation.price);
                  // Si la variaci\u00F3n tiene una imagen propia, usar esa imagen. Si no, volver a la imagen principal del producto padre.
                  if (matchingVariation.image?.src) { // Usa optional chaining
                      setDisplayedImage(matchingVariation.image.src);
                  } else {
                      // Volver a la imagen principal del producto padre si la variaci\u00F3n no tiene imagen propia
                      setDisplayedImage(product.images?.[0]?.src || undefined); // Usa optional chaining y fallback a undefined
                  }

              } else {
                  // No se encontr\u00F3 una variaci\u00F3n que coincida exactamente con la selecci\u00F3n actual.
                  // Esto puede pasar si el usuario selecciona una combinaci\u00F3n no existente en WooCommerce.
                   console.warn("[ProductPage] No se encontr\u00F3 variaci\u00F3n para la selecci\u00F3n actual:", selectedAttributes);
                   // Resetear el precio y la imagen mostrados a los del producto padre.
                   setDisplayedPrice(product.price);
                   setDisplayedImage(product.images?.[0]?.src || undefined); // Usa optional chaining y fallback
              }

         } else if (product) {
             // Si el producto padre se carg\u00F3 pero no es variable, o faltan datos/selecciones para buscar variaci\u00F3n,
             // asegurarnos de que el displayedPrice y displayedImage muestren los datos del producto padre.
             console.log("[ProductPage] No se busca variaci\u00F3n (cargando, simple, sin variacionesData, o faltan selecciones). Mostrando datos del producto padre.");
              // Si el producto padre se carg\u00F3, aseg\u00FArate de que el displayedPrice y displayedImage muestren los suyos
              setDisplayedPrice(product.price);
              setDisplayedImage(product.images?.[0]?.src || undefined);
         } else {
             // Si no hay producto padre (ej: estado inicial), limpiar displayed states
             setDisplayedPrice(undefined);
             setDisplayedImage(undefined);
         }


     }, [selectedAttributes, variationsData, product]); // <<< Dependencias del segundo useEffect: Se ejecuta cuando cambian las selecciones, los datos de variaciones o el producto.


    // ======================================================================
    // *** MANEJADOR DE EVENTO para galer\u00EDa de miniaturas ***
    // ======================================================================
    const handleThumbnailClick = (imageUrl: string) => {
        console.log("[ProductPage] Thumbnail clicada:", imageUrl);
        // Al hacer clic en una miniatura, actualizamos la imagen principal mostrada en la galer\u00EDa
        setMainImage(imageUrl); // Esto controla qu\u00E9 miniatura est\u00Eaacute; activa (para el borde azul)
        setDisplayedImage(imageUrl); // Esto actualiza la imagen grande que ve el usuario (la imagen principal)
    };


    // ======================================================================
    // *** RENDERIZADO CONDICIONAL (Loading, Error, Not Found) ***
    // Muestra mensajes de estado de carga o error mientras no tengamos el producto.
    // ======================================================================
    if (loading) {
        return (<div className="page-container"><div className="product-page-loading">Cargando producto...</div></div>);
    }

    if (error) {
         return (<div className="page-container"><div className="product-page-error">Error: {error}</div></div>);
    }

    if (!product) {
        return (<div className="page-container"><div className="product-page-not-found">Producto no encontrado.</div></div>);
    }


    // ======================================================================
    // *** RENDERIZADO PRINCIPAL DEL PRODUCTO (cuando el producto se ha cargado exitosamente) ***
    // ======================================================================
    // Si llegamos aquí, significa que se cargó exitosamente un producto (simple o variable).

    // Preparamos el identificador de categoría para pasarlo al CategoryCarousel
    // Usamos el ID o cadena de IDs de todas sus categor\u00EDas para el carrusel
    const categoryIdentifierForCarousel = product.categories && product.categories.length > 0
                                            ? product.categories.map(cat => cat.id).join(',')
                                            : undefined;


    return ( // <<< Inicio del return principal con el JSX
        <div className="page-container product-page-container">
            {/* T\u00EDtulo principal del producto. */}
            <h1 className="product-title-heading">{product.name}</h1>

             {/* Contenedor principal que organiza la galer\u00EDa de im\u00Eaacute;genes y la secci\u00F3n de informaci\u00F3n principal. */}
             <div className="product-details-main">
                 {/* Secci\u00F3n de im\u00Eaacute;genes del producto */}
                 <div className="product-images-gallery">
                     {/* Muestra la imagen principal que est\u00Eaacute; en el estado displayedImage */}
                     {/* displayedImage se actualiza con la variaci\u00F3n seleccionada o la miniatura clicada */}
                      {displayedImage ? ( // <<< Usamos displayedImage aqu\u00ED
                         <img src={displayedImage} alt={product.name} className="product-main-image" />
                     ) : (
                         // Fallback si displayedImage es undefined (ej: al inicio sin imagen)
                         <div className="no-product-image">Imagen no disponible</div>
                     )}

                     {/* Miniaturas (si hay im\u00Eaacute;genes en el producto padre) */}
                     {/* Estas miniaturas son de las im\u00Eaacute;genes del producto PADRE. Si quieres miniaturas de im\u00Eaacute;genes de VARIACIONES, necesitar\u00EDas m\u00Eaacute;s l\u00F3gica aqu\u00ED. */}
                     {product.images && product.images.length > 0 && ( // Mostrar miniaturas solo si hay im\u00Eaacute;genes en el producto padre
                         <div className="product-thumbnails">
                             {product.images.map((image, index: number) => (
                                 <img
                                     key={image.id || index} // Usar id o index como key
                                     src={image.src}
                                     alt={image.alt || `Thumbnail de ${product.name}`}
                                     className={`product-thumbnail ${mainImage === image.src ? 'active' : ''}`} // mainImage controla qu\u00Eeacute; miniatura est\u00Eaacute; activa
                                     onClick={() => handleThumbnailClick(image.src)} // Este handler actualiza mainImage Y displayedImage
                                 />
                             ))}
                         </div>
                     )}
                 </div>

                 {/* Secci\u00F3n de informaci\u00F3n b\u00Eaacute;sica del producto */}
                 <div className="product-info">
                     {/* === Contenedor de Precio === */}
                     <div className="product-price-container">
                          {/* Muestra el precio que est\u00Eaacute; en el estado displayedPrice */}
                          {/* displayedPrice se inicializa con el precio del padre y se actualiza con el de la variaci\u00F3n seleccionada */}

                           {/* Opcional: L\u00F3gica m\u00Eaacute;s compleja para mostrar precios de oferta, si displayedPrice es un precio de oferta */}
                           {/* Por ahora, solo muestra displayedPrice */}
                           {displayedPrice !== undefined && (
                                // Si el producto padre est\u00Eaacute; en oferta y displayedPrice es igual al precio de oferta del padre, mostrar el regular price tachado
                                // Esta l\u00F3gica es b\u00Eaacute;sica y funciona mejor para productos simples o si las variaciones tienen los mismos precios de oferta que el padre.
                                // Si las variaciones tienen precios de oferta distintos, la l\u00F3gica aqu\u00ED debe mirar el objeto de la variaci\u00F3n coincidente.
                                product.type !== 'variable' && product.on_sale && product.regular_price && product.regular_price !== displayedPrice && (
                                     <span className="regular-price">{product.regular_price}€</span>
                                )
                           )}

                           {/* Muestra el precio principal (displayedPrice) */}
                           {displayedPrice !== undefined && (
                                // A\u00Fñadir clase 'sale' si displayedPrice corresponde a un precio de oferta (requiere m\u00Eaacute;s l\u00F3gica con la variaci\u00F3n coincidente)
                                <span className={`current-price ${product.on_sale && displayedPrice === product.price ? 'sale' : ''}`}>
                                     {displayedPrice}€
                                </span>
                           )}

                          {/* Opcional: Si es un producto variable y no se ha seleccionado una variaci\u00F3n completa O si displayedPrice es el precio del padre, mostrar el rango de precio HTML */}
                          {/* Esto ayuda a clarificar que el precio mostrado es un rango o el base si no hay selecci\u00F3n espec\u00EDfica */}
                          {product.type === 'variable' && product.price_html && (
                                // Muestra el rango si displayedPrice es el precio del padre O si no hay selecci\u00F3n completa.
                                // Requiere saber si allRequiredAttributesSelected es true/false aqu\u00ED en el render (quiz\u00Eaacute; otro estado o recalcular)
                                // Por simplicidad, puedes mostrar el rango siempre para variables si lo deseas, o solo if displayedPrice === product.price
                                 displayedPrice === product.price && ( // Una forma simple de decidir si mostrar el rango
                                     <span dangerouslySetInnerHTML={{ __html: product.price_html }} /> // Muestra el rango de precio HTML
                                 )
                          )}
                     </div>

                    {/* === SECCI\u00D3N PARA ATRIBUTOS VARIABLES === */}
                    
                    {product?.type === 'variable' && product.attributes && product.attributes.length > 0 && ( // Usamos optional chaining ?.
                        <VariableAttributeSelector
                            attributes={product.attributes.filter(attr => attr.variation)} // Pasamos los atributos que vienen del estado 'product'
                            selectedAttributes={selectedAttributes} // Pasamos el estado de selecci\u00F3n actual
                            onAttributeSelect={handleAttributeSelect} // <-- Pasa la nueva funci\u00F3n manejadora
                            variationsData={variationsData} // Pasamos los datos de las variaciones
                            variationsLoading={variationsLoading} // Pasamos el estado de carga de variaciones
                            variationsError={variationsError} // Pasamos el estado de error de variaciones
                            productType={product.type} // Pasamos el tipo de producto si el hijo lo necesita (aunque ahora no lo use)
                            colorMap={colorMap} // Pasamos el mapeo de colores
                        />
                    )}

                    {/* === FIN SECCI\u00D3N PARA ATRIBUTOS VARIABLES === *    

                     {/* ... (Metadatos - SKU, Stock, Categor\u00EDas, Marca - esto queda debajo de los atributos) ... */}
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
                           {/* ... (Categorias y Marca) ... */}
                           {product.categories && product.categories.length > 0 && (
                              <p className="product-categories">
                                  <strong>Categoría:</strong> {
                                          product.categories.map((cat, index: number) => (
                                              // Asegura que 'cat' tenga una estructura esperada o tipa el array
                                              <React.Fragment key={cat.id || index}> {/* Usar id o index */}
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
                                               // Asegura que 'b' tenga una estructura esperada o tipa el array
                                              <React.Fragment key={b.id || index}> {/* Usar id o index */}
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


                     {/* ... (Descripción Breve) ... */}
                      <div className="product-short-description">
                          <h3>Descripción Breve</h3>
                          {product.short_description ? (
                               <div dangerouslySetInnerHTML={{ __html: product.short_description }} />
                          ) : (
                              <p>No hay descripción breve disponible.</p>
                          )}
                      </div>
                 </div> {/* Cierre product-info */}
             </div> {/* Cierre product-details-main */}

             {/* SECCI\u00D3N DE DESCRIPCI\u00D3N COMPLETA DEL PRODUCTO. */}
             <div className="product-full-description">
                 <h3>Descripción Completa</h3>
                 {product.description ? (
                     <div dangerouslySetInnerHTML={{ __html: product.description }} />
                 ) : (
                     <p>No hay descripción completa disponible.</p>
                 )}
             </div>


            {/* ... (CategoryCarousel - esto se mantiene igual) ... */}
            {/* Solo renderizamos el carrusel si hay una categor\u00EDa v\u00Eaacute;lida */}
            {/* Puedes decidir si mostrarlo siempre, o solo para productos simples sin categor\u00EDas */}
            {categoryIdentifierForCarousel && (
                 <CategoryCarousel
                     title={`Más en "${product.categories?.[0]?.name || 'esta categoría'}"`} // Usa optional chaining ?.
                     categoryIdentifier={categoryIdentifierForCarousel} // Le pasamos el ID o cadena de IDs de la categoría
                     productsToShow={5}
                     productsPerFetch={10}
                     excludeProductId={product.id} // Excluye el producto que estamos viendo
                 />
            )}
             {/* Mensaje si no hay categor\u00EDas para el carrusel */}
             {!categoryIdentifierForCarousel && ( // Muestra este mensaje si no hay categor\u00EDas para el carrusel
                  // Opcional: Puedes a\u00Fñadir aqu\u00ED otra condici\u00F3n si solo quieres mostrarlo para productos simples
                  // (product.type === 'simple')
                  <div className="no-related-products-message">No se encontraron categor\u00EDas para mostrar productos relacionados.</div>
             )}


            {/* ... (otras secciones futuras) ... */}

        </div> 
    ); 
} 

export default ProductPage; // <<< Exportaci\u00F3n del componente