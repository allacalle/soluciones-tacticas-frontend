// src/pages/ProductPage.tsx


import  { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {  Variation } from '../types';


// Componentes
import CategoryCarousel from '../components/CategoryCarousel';
import ProductImageGallery from '../components/ProductImageGallery';
import ProductInfo from '../components/ProductInfo'; 
import ProductFullDescription from '../components/ProductFullDescription'; // <-- AÑADE ESTA



// Hooks
import { useProductDetails } from '../hooks/useProductDetails'; 
import { useVariationMatcher } from '../hooks/useVariationMatcher'; 
import { useRecommendedProducts } from '../hooks/useRecommendedProducts'; // El hook de recomendaciones
import ProductCarousel from '../components/ProductCarousel';          // Nuestro componente de carrusel genérico


// CSS
import './css/ProductPage.css';




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

    const {
        product,                // Product | null
        loading,                // boolean
        error,                  // string | null
        variationsData,         // Variation[]
        variationsLoading,      // boolean
        variationsError,        // string | null
        initialDisplayState     // { price?, image?, attributes } | null
    } = useProductDetails(productSlug); 

   
    const [mainImage, setMainImage] = useState<string | undefined>(undefined);
    const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string | null }>({});
    const [displayedPrice, setDisplayedPrice] = useState<string | undefined>(undefined);
    const [displayedImage, setDisplayedImage] = useState<string | undefined>(undefined);
    const [isSpecificVariationSelected, setIsSpecificVariationSelected] = useState(false);
    const [activeVariation, setActiveVariation] = useState<Variation | null>(null);

  
    // === EFECTO para inicializar estados locales al cargar el producto ===
    // Este efecto se ejecuta al cargar el producto y al cambiar el estado inicial
     useEffect(() => {
        console.log("[ProductPage] Efecto de inicialización con initialDisplayState:", initialDisplayState);
        if (initialDisplayState) {
            setSelectedAttributes(initialDisplayState.attributes);
            setMainImage(initialDisplayState.image); // Imagen para el thumbnail activo
        } else if (!loading && !product) { // Si terminó de cargar y no hay producto (error o no encontrado)
            console.log("[ProductPage] Reseteando estados locales (selectedAttrs, mainImage) por no haber producto.");
            setSelectedAttributes({});
            setMainImage(undefined);
        }
    }, [initialDisplayState, loading, product]); // Dependencias correctas
  

      const {
        matchingPrice,
        matchingImage,
        isMatched,
        matchedVariation
    } = useVariationMatcher({
        product,
        variationsData,
        selectedAttributes,
        initialProductImage: initialDisplayState?.image // Pasamos la imagen inicial del producto padre como fallback
    });

      
    // === EFECTO para actualizar los estados de display de ProductPage cuando los valores del hook cambian ===
    useEffect(() => {
        console.log("[ProductPage] Actualizando display con datos de useVariationMatcher:", { matchingPrice, matchingImage, isMatched, matchedVariation });
        setDisplayedPrice(matchingPrice);
        setDisplayedImage(matchingImage); // Este es el que ProductImageGallery muestra como grande
        setIsSpecificVariationSelected(isMatched);
        setActiveVariation(matchedVariation);

       
        if (isMatched && matchedVariation?.image?.src) {
            // Si la variación tiene una imagen propia, mainImage la refleja.
            setMainImage(matchedVariation.image.src);
         } else if (product) { 
            const parentImage = initialDisplayState?.image || product.images?.[0]?.src;
            setMainImage(parentImage);
        }

    }, [matchingPrice, matchingImage, isMatched, matchedVariation, product, initialDisplayState]);


    const handleAttributeSelect = (attributeName: string, option: string) => {
        console.log(`[ProductPage] Atributo seleccionado: ${attributeName} - ${option}`);
        setSelectedAttributes(prev => ({
            ...prev,
            [attributeName]: option
        }));
        // useVariationMatcher se disparará automáticamente porque selectedAttributes es una de sus dependencias
    };// Actualiza el precio y la imagen mostrada según la variación seleccionada


    // ProductImageGallery se encargará de llamar a esta función.
    const handleThumbnailClick = (imageUrl: string) => {
        console.log("[ProductPage] Thumbnail clicada:", imageUrl);
        setMainImage(imageUrl);      // Actualiza la miniatura activa
        setDisplayedImage(imageUrl); // Actualiza la imagen grande
    };

     // === USAR EL HOOK DE RECOMENDACIONES ===
    // Pasamos el 'product' actual y la cantidad de recomendaciones que queremos obtener.
    // El hook internamente pide más para tener margen, pero aquí definimos cuántos queremos en total.
    const numberOfRecommendationsToFetch = 8; // Por ejemplo, queremos hasta 8 productos para el carrusel.
                                           // El carrusel podría mostrar 4-5 a la vez.
    const {
        recommendedProducts,
        loading: recommendationsLoading, // Renombrar para evitar colisión con 'loading' de useProductDetails
        error: recommendationsError      // Renombrar para evitar colisión con 'error' de useProductDetails
    } = useRecommendedProducts(product, numberOfRecommendationsToFetch);
    // === FIN USO HOOK RECOMENDACIONES ===

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
                <ProductImageGallery
                    productName={product.name}
                    images={product.images || []}
                    displayedImage={displayedImage}    // La imagen grande a mostrar
                    activeThumbnailSrc={mainImage}     // La URL de la miniatura activa
                    onThumbnailClick={handleThumbnailClick}
                />
            <ProductInfo
                product={product}
                displayedPrice={displayedPrice}
                isSpecificVariationSelected={isSpecificVariationSelected}
                activeVariation={activeVariation}
                selectedAttributes={selectedAttributes}
                onAttributeSelect={handleAttributeSelect}
                variationsData={variationsData}
                variationsLoading={variationsLoading}
                variationsError={variationsError}
                colorMap={colorMap}
            />

             
            </div> {/* Cierre de product-details-main */}

            {/* Descripción Completa */}
            {product && <ProductFullDescription descriptionHtml={product.description} />}


            {/* Carrusel de Categorías */}
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
                <div className="no-related-products-message">No se encontraron categorías para mostrar productos relacionados.</div>
            )}

             {/* === SECCIÓN PARA EL CARRUSEL DE PRODUCTOS RECOMENDADOS === */}
            {/* Solo mostramos esta sección si tenemos un producto cargado,
                 no estamos cargando recomendaciones, no hay error en recomendaciones,
                 y efectivamente tenemos productos recomendados. */}
            {product && !recommendationsLoading && !recommendationsError && recommendedProducts.length > 0 && (
                <div className="related-products-section"> {/* Un contenedor opcional para esta sección */}
                    <ProductCarousel
                        title="También te podría interesar"
                        products={recommendedProducts}
                        productsToShow={4}      // Cuántos mostrar a la vez en pantallas grandes
                                                // react-slick manejará los breakpoints para menos en móviles
                        autoPlayInterval={10000} // Rotar cada 5 segundos (o el valor que prefieras)
                        // Podrías añadir más props aquí si tu ProductCarousel las acepta
                    />
                </div>
            )}

            {/* Opcional: Mostrar un estado de carga para las recomendaciones */}
            {product && recommendationsLoading && (
                <div className="related-products-loading" style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Buscando productos que podrían interesarte...</p>
                    {/* Aquí podrías poner un spinner/loader visual si tienes uno */}
                </div>
            )}

            {/* Opcional: Mostrar un mensaje si hay un error al cargar recomendaciones */}
            {product && recommendationsError && (
                <div className="related-products-error" style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                    <p>No se pudieron cargar las recomendaciones en este momento.</p>
                </div>
            )}
            {/* === FIN SECCIÓN CARRUSEL RECOMENDACIONES === */}


        </div>
    );
}

export default ProductPage;