// src/pages/ProductPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './css/ProductPage.css';

import {  Variation, VariationAttribute, Category as CategoryType, Brand as BrandType } from '../types';



// *** Importar el componente CategoryCarousel ***
import CategoryCarousel from '../components/CategoryCarousel';
// Importa el componente VariableAttributeSelector
import VariableAttributeSelector from '../components/VariableAttributeSelector';
// Importa el componente ProductImageGallery ***
import ProductImageGallery from '../components/ProductImageGallery';

// Importa el hook useProductDetails
import { useProductDetails } from '../hooks/useProductDetails'; 



// === Mapeo para nombres de colores de la API a valores CSS ===
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
function ProductPage() { 
   
    const { productSlug } = useParams<{ productSlug: string }>();

     // === USA EL NUEVO HOOK ===
    const {
        product,                // Product | null
        loading,                // boolean
        error,                  // string | null
        variationsData,         // Variation[]
        variationsLoading,      // boolean
        variationsError,        // string | null
        initialDisplayState     // { price?, image?, attributes } | null
    } = useProductDetails(productSlug); // <--- ¡NUEVO!

   
    const [mainImage, setMainImage] = useState<string | undefined>(undefined);
    const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string | null }>({});
    const [displayedPrice, setDisplayedPrice] = useState<string | undefined>(undefined);
    const [displayedImage, setDisplayedImage] = useState<string | undefined>(undefined);
    const [isSpecificVariationSelected, setIsSpecificVariationSelected] = useState(false);
    const [activeVariation, setActiveVariation] = useState<Variation | null>(null);


  

  
    // ======================================================================
    // Este useEffect ahora usará `product` y `variationsData` del hook.
    // Y `selectedAttributes`, `setDisplayedPrice`, `setDisplayedImage` de los estados locales.
    // ======================================================================

    useEffect(() => {
        console.log("[ProductPage] useEffect para inicializar display con initialDisplayState:", initialDisplayState);
           if (initialDisplayState && product) { // Añadido 'product' para asegurar que tenemos datos del producto
                if (product.type === 'variable') {
                    // Para productos variables, podríamos decidir no mostrar ningún precio inicialmente
                    // hasta que el usuario interactúe, o solo el rango.
                    // Opción A: No mostrar precio individual inicialmente para variables.
                    setDisplayedPrice(undefined); // O product.price si quieres que el rango se muestre con un precio base
                    setIsSpecificVariationSelected(false);
                } else {
                    // Para productos simples, mostrar su precio
                    setDisplayedPrice(initialDisplayState.price);
                    setIsSpecificVariationSelected(false); // Productos simples no son "variaciones específicas"
                }
                // El resto de la inicialización de imagen y atributos
                const imageToDisplay = initialDisplayState.image;
                setDisplayedImage(imageToDisplay);
                setMainImage(imageToDisplay);
                setSelectedAttributes(initialDisplayState.attributes);
            } else if (!loading && !product) { // Error o no encontrado
                console.log("[ProductPage] Reseteando display porque no hay producto después de cargar.");
                setDisplayedPrice(undefined);
                setDisplayedImage(undefined);
                setMainImage(undefined);
                setSelectedAttributes({});
                setIsSpecificVariationSelected(false);
            }
        }, [initialDisplayState, loading, product]);


    // Funci\u00F3n para manejar la selecci\u00F3n de un atributo (MANTENER)
    const handleAttributeSelect = (attributeName: string, option: string) => {
        console.log(`[ProductPage] Atributo seleccionado por el hijo: ${attributeName} - ${option}`);
        setSelectedAttributes(prev => ({
            ...prev,
            [attributeName]: option
        }));
    };

 useEffect(() => {
        console.log("[ProductPage] useEffect para buscar variaci\u00F3n disparado.");
        console.log("[ProductPage] Estado actual de selectedAttributes:", selectedAttributes); 
        console.log("[ProductPage] Estado actual de variationsData:", variationsData); 
        console.log("[ProductPage] Producto actual:", product); 
        console.log("[ProductPage] Estado ANTERIOR de isSpecificVariationSelected:", isSpecificVariationSelected);


        const allRequiredAttributesSelected = product?.type === 'variable' &&
                                              product.attributes?.every(attr =>
                                                   !attr.variation || (selectedAttributes[attr.name] !== null && selectedAttributes[attr.name] !== undefined)
                                              );
        console.log("[ProductPage] allRequiredAttributesSelected:", allRequiredAttributesSelected);
                                      
        if (product && product.type === 'variable' && variationsData.length > 0 && allRequiredAttributesSelected) {
             console.log("[ProductPage] Intentando encontrar variaci\u00F3n coincidente con selecci\u00F3n:", selectedAttributes);
             const matchingVariation = variationsData.find((variation: Variation) => {
                 return variation.attributes.every((varAttr: VariationAttribute) => {
                      return selectedAttributes[varAttr.name]?.toLowerCase() === varAttr.option.toLowerCase();
                 });
             });
             console.log("[ProductPage] Resultado de la b\u00FAsqueda de variaci\u00F3n:", matchingVariation);
             
             if (matchingVariation) {
                 console.log(`[ProductPage] Variaci\u00F3n coincidente encontrada (ID: ${matchingVariation.id}). Actualizando display.`);
                 setDisplayedPrice(matchingVariation.price);
                 setIsSpecificVariationSelected(true);
                 setActiveVariation(matchingVariation); // <--- GUARDAR LA VARIACIÓN ACTIVA
 
 
                 if (matchingVariation.image?.src) {
                     setDisplayedImage(matchingVariation.image.src); 
                 } else {
                     const parentImage = product.images?.[0]?.src;
                     setDisplayedImage(parentImage || initialDisplayState?.image); 
                 }
             } else { // Todos los atributos seleccionados, pero no hay un match exacto (combinación inválida)
                  console.warn("[ProductPage] No se encontr\u00F3 variaci\u00F3n para la selecci\u00F3n actual (combinación inválida):", selectedAttributes);
                  setDisplayedPrice(undefined); // Volver al precio base
                  const parentImage = product.images?.[0]?.src;
                  setDisplayedImage(parentImage || initialDisplayState?.image); // Volver a la imagen base
                  setIsSpecificVariationSelected(false);
                  setActiveVariation(null); // <--- LIMPIAR VARIACIÓN ACTIVA
 
             }
        } else if (product) { // Producto simple O selección incompleta para variable
        if (product.type === 'simple') {
            setDisplayedPrice(product.price);
        } else { // Variable pero selección incompleta
            // Opción A: No mostrar precio
            setDisplayedPrice(undefined);
            // Opción B: Mostrar precio base (si prefieres)
            // setDisplayedPrice(product.price);
        }
        setIsSpecificVariationSelected(false);
        setActiveVariation(null); // <--- LIMPIAR VARIACIÓN ACTIVA

        // ... (lógica de imagen para producto padre o placeholder) ...
    } else { // No hay producto (ya manejado por el otro useEffect)
        setActiveVariation(null); // <--- LIMPIAR VARIACIÓN ACTIVA
    }
        // No necesitas un 'else' si !product, porque el otro useEffect ya reseteó isSpecificVariationSelected a false.
    }, [selectedAttributes, variationsData, product, initialDisplayState, isSpecificVariationSelected]); 


    // *** MODIFICADO: handleThumbnailClick ahora es más simple y solo actualiza estados locales ***
    // ProductImageGallery se encargará de llamar a esta función.
    const handleThumbnailClick = (imageUrl: string) => {
        console.log("[ProductPage] Thumbnail clicada:", imageUrl);
        setMainImage(imageUrl);      // Actualiza la miniatura activa para ProductImageGallery
        setDisplayedImage(imageUrl); // Actualiza la imagen grande que ProductPage y ProductImageGallery usan
    };

    // Renderizado condicional (SIN CAMBIOS)
    if (loading) { /* ... */ }
    if (error) { /* ... */ }
    if (!product) { /* ... */ }
    // ... (código idéntico al que tenías para loading, error, !product)
    if (loading) { // `loading` del hook
        return (<div className="page-container"><div className="product-page-loading">Cargando producto...</div></div>);
    }
    if (error) { // `error` del hook
         return (<div className="page-container"><div className="product-page-error">Error: {error}</div></div>);
    }
    if (!product) { // `product` del hook
        return (<div className="page-container"><div className="product-page-not-found">Producto no encontrado.</div></div>);
    }


    const categoryIdentifierForCarousel = product.categories && product.categories.length > 0
                                            ? product.categories.map(cat => cat.id).join(',')
                                            : undefined;

    return (
        <div className="page-container product-page-container">
            <h1 className="product-title-heading">{product.name}</h1>

            <div className="product-details-main">
                {/* === USA EL NUEVO COMPONENTE ProductImageGallery === */}
                <ProductImageGallery
                    productName={product.name}
                    images={product.images || []} // Pasa un array vacío si product.images es undefined
                    displayedImage={displayedImage} // La imagen grande que debe mostrar
                    activeThumbnailSrc={mainImage} // La miniatura que debe estar activa
                    onThumbnailClick={handleThumbnailClick} // La función a llamar al clicar miniatura
                />
                {/* === FIN ProductImageGallery === */}

                {/* ELIMINAR el JSX antiguo de la galería de imágenes de aquí */}
                {/* 
                <div className="product-images-gallery">
                     {displayedImage ? ( ... ) : ( ... )}
                     {product.images && product.images.length > 0 && (
                         <div className="product-thumbnails">
                             {product.images.map(...)}
                         </div>
                     )}
                 </div>
                */}

                <div className="product-info">
                    {/* ... (El resto de tu JSX para product-info se mantiene igual) ... */}
                    {/* ... (Price container, VariableAttributeSelector, Meta, Short Description) ... */}
                     <div className="product-price-container">
                           {product.type !== 'variable' && product.on_sale && product.regular_price && product.regular_price !== displayedPrice && (
                                     <span className="regular-price">{product.regular_price}€</span>
                           )}
                           {displayedPrice !== undefined && (
                                    <span className={`current-price ${
                                        (product.type === 'simple' && product.on_sale) ||
                                        (isSpecificVariationSelected && activeVariation && activeVariation.on_sale) // <--- USA activeVariation
                                        ? 'sale' 
                                        : ''
                                    }`}>
                                        {displayedPrice}€
                                    </span>
                           )}
                            {product.type === 'variable' && product.price_html && !isSpecificVariationSelected && (
                                <span className="price-select-prompt">Selecciona opciones para ver el precio</span>

                          )}
                     </div>
                    
                    {product.type === 'variable' && product.attributes && product.attributes.filter(attr => attr.variation).length > 0 && (
                        <VariableAttributeSelector
                            attributes={product.attributes.filter(attr => attr.variation)}
                            selectedAttributes={selectedAttributes} 
                            onAttributeSelect={handleAttributeSelect}
                            variationsData={variationsData} 
                            variationsLoading={variationsLoading} 
                            variationsError={variationsError} 
                            productType={product.type}
                            colorMap={colorMap}
                        />
                    )}
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
                                          product.categories.map((cat: CategoryType, index: number) => ( 
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
                                          product.brand.map((b: BrandType, index: number) => ( 
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

            {/* ... (El resto de tu JSX para full-description y CategoryCarousel se mantiene igual) ... */}
             <div className="product-full-description">
                 <h3>Descripción Completa</h3>
                 {product.description ? (
                     <div dangerouslySetInnerHTML={{ __html: product.description }} />
                 ) : (
                     <p>No hay descripción completa disponible.</p>
                 )}
             </div>
            {categoryIdentifierForCarousel && (
                 <CategoryCarousel
                     title={`Más en "${product.categories?.[0]?.name || 'esta categoría'}"`}
                     categoryIdentifier={categoryIdentifierForCarousel}
                     productsToShow={5}
                     productsPerFetch={10}
                     excludeProductId={product.id}
                 />
            )}
             {!categoryIdentifierForCarousel && (
                  <div className="no-related-products-message">No se encontraron categor\u00EDas para mostrar productos relacionados.</div>
             )}
        </div>
    );
}

export default ProductPage;