// src/pages/ProductPage.tsx

import  { useEffect, useState } from 'react'; // Añadido React para FC si se usara
import { useParams } from 'react-router-dom';
import { Variation, Product as ProductType } from '../types';

// Componentes
import ProductImageGallery from '../components/ProductImageGallery/ProductImageGallery';
import ProductInfo from '../components/ProductInfo/ProductInfo';
import ProductFullDescription from '../components/ProductFullDescription/ProductFullDescription';
import ProductCarousel from '../components/ProductCarousel/ProductCarousel';

// Hooks
import { useProductDetails } from '../hooks/useProductDetails';
import { useVariationMatcher } from '../hooks/useVariationMatcher';
import { useRecommendedProducts } from '../hooks/useRecommendedProducts';
// import { getProducts } from '../api/wooApi'; // Para el fetch de categoryRelatedProducts

// CSS
import './css/ProductPage.css';

const colorMap: { [key: string]: string } = {
    // --- COLORES BÁSICOS Y NEUTROS ---
    "Negro": "#000000",
    "Blanco": "#FFFFFF",
    "Gris": "#808080",        // Gris medio
    "Gris Oscuro": "#4A4A4A", // Un gris más oscuro, tipo "charcoal"
    "Gris Claro": "#D3D3D3",  // Gris claro
    "Antracita": "#36454F",   // Un gris muy oscuro, casi negro, con tonos azulados
    "Grafito": "#383838",     // Similar al antracita

    // --- TONOS VERDES ---
    "Verde Oliva": "#556B2F",   // Clásico verde oliva (tu --color-primary-dark)
    "Verde OD": "#4B5320",      // Olive Drab, un estándar militar
    "Verde Militar": "#4F553F", // Otro tono común
    "Verde Bosque": "#228B22",  // Un verde más vibrante de bosque
    "Verde Ranger": "#5F745A",  // Ranger Green, popular en equipamiento táctico
    "Verde Musgo": "#8FBC8F",   // Un verde más claro, como tu --color-primary-light
    "Salvia": "#B2AC88",       // Sage green, un verde grisáceo
    "Boscoso": "#4B8B3A",      // Un verde más terroso y oscuro
    "Verde": "#228B22",        // Un verde más vibrante

    // --- TONOS TIERRA / MARRONES ---
    "Coyote": "#8A6B4D",       // Coyote Brown, muy común
    "Tan": "#D2B48C",          // Arena claro
    "Arena": "#F4A460",        // Un color arena más cálido
    "Desierto": "#C19A6B",     // Tono desierto
    "Caqui": "#C3B091",        // Khaki
    "Marrón": "#A0522D",       // Un marrón estándar (Sienna)
    "Marrón Oscuro": "#654321", // Marrón oscuro

    // --- TONOS AZULES (Para uniformes, etc.) ---
    "Azul Marino": "#000080",   // Navy Blue
    "Azul Noche": "#191970",    // Midnight Blue, muy oscuro
    "Azul Policía": "#00205B",  // Un azul oscuro específico
    "Azul Oscuro": "#00008B", // Ya lo tenías
    "Azul": "#0000FF",          // Azul estándar

    // --- CAMUFLAJES (Representación con un color base o un patrón simple si es posible) ---
    // Para camuflajes, es difícil representarlos con un solo color.
    // Opciones:
    // 1. Usar el color predominante o un color representativo.
    // 2. Si tus swatches pueden ser imágenes, usar una pequeña muestra del patrón.
    // 3. Usar un icono o un patrón genérico para "Camuflaje".
    // Aquí usaré colores base como ejemplo:
    "Camuflaje Boscoso": "#384C30", // Un verde oscuro representativo de Woodland
    "Woodland": "#384C30",          // Alias para Camuflaje Boscoso
    "Camuflaje Desierto": "#D8C0A8", // Un beige/arena representativo
    "Desert": "#D8C0A8",             // Alias
    "Camuflaje Multicam": "#A48A6A", // Un color medio de Multicam (mezcla de verdes y marrones)
    "Multicam": "#A48A6A",
    "Camuflaje Urbano": "#7B7C7D",  // Un gris medio para camuflaje urbano
    "Urban Camo": "#7B7C7D",
    "Camuflaje Digital": "#656E58", // Un verde grisáceo para digital
    "Digital Camo": "#656E58",
    "Kryptek": "#706653",         // Color base para patrones tipo Kryptek
    "A-TACS": "#A39978",          // Color base para patrones tipo A-TACS

    // --- COLORES DE ALTA VISIBILIDAD (Para rescate, algunos equipos de outdoor) ---
    "Naranja Rescate": "#FF8C00", // Naranja brillante
    "Amarillo Flúor": "#CCFF00", // Lima/amarillo fluorescente
    "Rojo": "#FF0000",       // Ya lo tenías, puede ser para detalles o emergencia

    // --- OTROS ---
    "Beige": "#F5F5DC",
    "Foliage Green": "#717A64", // Un verde grisáceo específico
    "Wolf Grey": "#84888B",    // Un gris táctico popular

    // AÑADE MÁS SEGÚN TU CATÁLOGO
    // Ejemplo: si tienes "Rojo Vino" para alguna prenda de gala
    // "Rojo Vino": "#722F37",
};

function ProductPage() {
    const { productSlug } = useParams<{ productSlug: string }>();

    const {
        product, loading, error, variationsData,
        variationsLoading, variationsError, initialDisplayState
    } = useProductDetails(productSlug);

    const [mainImage, setMainImage] = useState<string | undefined>(undefined);
    const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string | null }>({});
    const [displayedPrice, setDisplayedPrice] = useState<string | undefined>(undefined);
    const [displayedImage, setDisplayedImage] = useState<string | undefined>(undefined);
    const [isSpecificVariationSelected, setIsSpecificVariationSelected] = useState(false);
    const [activeVariation, setActiveVariation] = useState<Variation | null>(null);

    useEffect(() => {
        if (initialDisplayState) {
            setSelectedAttributes(initialDisplayState.attributes);
            setMainImage(initialDisplayState.image);
        } else if (!loading && !product) {
            setSelectedAttributes({});
            setMainImage(undefined);
        }
    }, [initialDisplayState, loading, product]);

    const { matchingPrice, matchingImage, isMatched, matchedVariation } = useVariationMatcher({
        product, variationsData, selectedAttributes, initialProductImage: initialDisplayState?.image
    });

    useEffect(() => {
        setDisplayedPrice(matchingPrice);
        setDisplayedImage(matchingImage);
        setIsSpecificVariationSelected(isMatched);
        setActiveVariation(matchedVariation);
        if (isMatched && matchedVariation?.image?.src) {
            setMainImage(matchedVariation.image.src);
        } else if (product) { // Comprobación de product aquí
            const parentImage = initialDisplayState?.image || product.images?.[0]?.src;
            setMainImage(parentImage);
        } else { // Si product es null y no hay matchedVariation con imagen
            setMainImage(initialDisplayState?.image); // Volver a la imagen inicial o undefined
        }
    }, [matchingPrice, matchingImage, isMatched, matchedVariation, product, initialDisplayState]);

    // Asumiendo que SÍ usas los parámetros como en tu versión original
    const handleAttributeSelect = (attributeName: string, option: string) => {
        console.log(`[ProductPage] Atributo seleccionado: ${attributeName} - ${option}`);
        setSelectedAttributes(prev => ({
            ...prev,
            [attributeName]: option
        }));
    };

    const handleThumbnailClick = (imageUrl: string) => {
        console.log("[ProductPage] Thumbnail clicada:", imageUrl);
        setMainImage(imageUrl);
        setDisplayedImage(imageUrl);
    };

    const numberOfRecommendationsToFetch = 8;
    const { recommendedProducts, loading: recommendationsLoading, error: recommendationsError } = useRecommendedProducts(product, numberOfRecommendationsToFetch);

    const [categoryRelatedProducts, setCategoryRelatedProducts] = useState<ProductType[]>([]);
    const [categoryRelatedLoading, setCategoryRelatedLoading] = useState<boolean>(false);

    useEffect(() => {
        if (product && product.categories && product.categories.length > 0) {
            const primaryCategoryId = product.categories[0].id;
            setCategoryRelatedLoading(true); // Usar el setter
            console.log(`TODO: Implementar fetch para categoría ID: ${primaryCategoryId}, excluyendo producto ID: ${product.id}`);
            // Simulación de fetch
            setTimeout(() => {
                // const fetchedData = await getProducts({ category: primaryCategoryId.toString(), per_page: 5, exclude: [product.id!] });
                // setCategoryRelatedProducts(fetchedData.products);
                setCategoryRelatedProducts([]); // Placeholder, reemplazar con datos reales
                setCategoryRelatedLoading(false); // Usar el setter
            }, 500);
        } else {
            setCategoryRelatedProducts([]);
            setCategoryRelatedLoading(false);
        }
    }, [product]); // Depender solo de product


    if (loading && !product) { return (<div className="page-container product-page-container"><div className="product-page-loading">Cargando producto...</div></div>); }
    if (error) { return (<div className="page-container product-page-container"><div className="product-page-error">Error: {error}</div></div>); }
    
    // === GUARDA PRINCIPAL PARA NULL ===
    if (!product) {
        return (<div className="page-container product-page-container"><div className="product-page-not-found">Producto no encontrado.</div></div>);
    }
    // === A PARTIR DE AQUÍ, 'product' NO ES NULL ===

    const categoryIdentifierForCarousel = product.categories && product.categories.length > 0
        ? product.categories[0].id // Solo necesitamos el ID para el fetch de "Más en categoría"
        : undefined;


    return (
        <div className="page-container product-page-container">
            <div className="product-layout-main-columns">
                <div className="product-gallery-area">
                    <ProductImageGallery
                        productName={product.name} // Ahora product no es null
                        images={product.images || []}
                        displayedImage={displayedImage}
                        activeThumbnailSrc={mainImage}
                        onThumbnailClick={handleThumbnailClick}
                    />
                </div>
                <div className="product-info-area">
                    <h1 className="product-title-heading">{product.name}</h1>
                    <ProductInfo
                        product={product} // Ahora product no es null
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
                    {/* <button className="add-to-cart-button">Añadir al Carrito</button> */}
                </div>
                <div className="product-sidebar-area">
                    {categoryIdentifierForCarousel && (categoryRelatedProducts.length > 0 || categoryRelatedLoading) && (
                        <div className="sidebar-widget">
                            <h4 className="sidebar-widget-title">Más en "{product.categories?.[0]?.name}"</h4>
                            {categoryRelatedLoading ? ( <p>Cargando...</p> ) : (
                                <ProductCarousel
                                    products={categoryRelatedProducts}
                                    productsToShow={1}
                                    autoPlayInterval={0}
                                    showArrows={categoryRelatedProducts.length > 1}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {product.description && (
                <section className="product-full-width-section">
                    <ProductFullDescription descriptionHtml={product.description} />
                </section>
            )}

            {recommendedProducts.length > 0 && ( // Solo mostrar si hay productos recomendados
                <div className="related-products-wrapper">
                    <div className="section-title-bar"><h2>También te podría interesar</h2></div>
                    <ProductCarousel
                        products={recommendedProducts}
                        productsToShow={4}
                        autoPlayInterval={10000}
                        showArrows={recommendedProducts.length > 4} // Condición para flechas
                    />
                </div>
            )}
            {recommendationsLoading && <div className="related-products-loading" style={{ textAlign: 'center', padding: '20px' }}><p>Buscando productos que podrían interesarte...</p></div>}
            {recommendationsError && <div className="related-products-error" style={{ textAlign: 'center', padding: '20px', color: 'red' }}><p>No se pudieron cargar las recomendaciones.</p></div>}
        </div>
    );
}
export default ProductPage;