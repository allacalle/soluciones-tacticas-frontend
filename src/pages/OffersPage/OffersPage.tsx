// src/pages/OffersPage.tsx
import './OffersPage.css'; // Importa los estilos específicos si los hay
import { useMemo, useState, useEffect } from 'react'; // <--- AÑADE useState y useEffect
import ProductListingLayout from '../../components/ProductListingLayout/ProductListingLayout';
import { usePaginatedProducts, UsePaginatedProductsOptions } from '../../hooks/usePaginatedProducts/usePaginatedProducts';

// Configuración de productos por página para esta vista específica
const PRODUCTS_PER_PAGE_OFFERS_DESKTOP = 8; // Tu valor actual para escritorio
const PRODUCTS_PER_PAGE_OFFERS_MOBILE = 6;  // O el que prefieras para móvil
const MOBILE_BREAKPOINT = 768; // Mantenemos el breakpoint consistente

export default function OffersPage() {
    // 1. Estado para saber si estamos en vista móvil
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < MOBILE_BREAKPOINT);

    // 2. useEffect para actualizar isMobileView cuando cambie el tamaño de la ventana
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < MOBILE_BREAKPOINT);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 3. Determina productsPerPage basado en isMobileView
    const currentProductsPerPageOffers = useMemo(() => {
        return isMobileView ? PRODUCTS_PER_PAGE_OFFERS_MOBILE : PRODUCTS_PER_PAGE_OFFERS_DESKTOP;
    }, [isMobileView]);

    // 4. CONFIGURA LAS OPCIONES PARA usePaginatedProducts
    const productFetcherOptions: UsePaginatedProductsOptions = useMemo(() => ({
        productsPerPage: currentProductsPerPageOffers, // <--- ¡AQUÍ USAMOS EL VALOR DINÁMICO!
        onSale: true,
    }), [currentProductsPerPageOffers]); // Añadimos currentProductsPerPageOffers a las dependencias

    // 5. USA EL HOOK
    const {
        products,
        loading,
        error,
        currentPage,
        totalProducts,
        totalPages,
        setCurrentPage,
    } = usePaginatedProducts(productFetcherOptions);

    // 6. MANEJO DE ESTADOS GLOBALES DE CARGA Y ERROR
    if (loading && products.length === 0 && !error) {
        return (
            <div className="page-container"> {/* Asumiendo que .page-container es tu contenedor principal de página */}
                <div className="page-title-block"><h2>Ofertas</h2></div> {/* Asumiendo estilos para page-title-block */}
                <p className="page-loading offers-page-loading">Cargando ofertas...</p> 
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="page-title-block"><h2>Ofertas</h2></div>
                <p className="page-error offers-page-error">Error al cargar las ofertas: {error.message}</p>
            </div>
        );
    }
    
    if (!loading && !error && products.length === 0 && totalProducts === 0) {
        return (
            <div className="page-container">
                <div className="page-title-block">
                    <h2>Ofertas</h2>
                </div>
                <p className="page-empty offers-page-empty">No hay ofertas disponibles en este momento.</p>
            </div>
        );
    }

    // 7. RENDERIZA USANDO ProductListingLayout
    return (
        <div className="page-container"> 
            <ProductListingLayout
                title="Ofertas"
                products={products}
                loading={loading}
                currentPage={currentPage}
                totalProducts={totalProducts}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                // itemsPerPage={currentProductsPerPageOffers} // Opcional, si lo necesitas en ProductListingLayout
            />
        </div>
    );
}