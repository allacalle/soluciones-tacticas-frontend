// src/pages/OffersPage.tsx
import './css/OffersPage.css'; // Importa los estilos específicos si los hay
// Product y getProducts ya no se importan aquí directamente
// ProductGrid se usa dentro de ProductListingLayout

// Componentes y Hooks
import ProductListingLayout from '../components/ProductListingLayout';
import { usePaginatedProducts, UsePaginatedProductsOptions } from '../hooks/usePaginatedProducts'; // Importa el hook y las opciones
import { useMemo } from 'react'; // Importa useMemo para las opciones del hook

// Configuración de productos por página para esta vista específica
const PRODUCTS_PER_PAGE_OFFERS = 8; // O el valor que prefieras, podría ser el mismo que en otras listas

export default function OffersPage() {
    // 1. CONFIGURA LAS OPCIONES PARA usePaginatedProducts
    // Usamos useMemo para asegurar que el objeto de opciones sea estable si no cambian sus dependencias
    const productFetcherOptions: UsePaginatedProductsOptions = useMemo(() => ({
        productsPerPage: PRODUCTS_PER_PAGE_OFFERS,
        onSale: true, // <--- ¡CLAVE! Para obtener solo productos en oferta
        // initialPage por defecto es 1 en el hook
        // categoryId, searchTerm, etc., son undefined por defecto, lo cual está bien aquí
    }), []); // El array de dependencias está vacío porque las opciones son estáticas para esta página

    // 2. USA EL HOOK
    const {
        products,           // Estos son tus 'offerProducts'
        loading,
        error,
        currentPage,
        totalProducts,
        totalPages,
        setCurrentPage,     // Para la paginación
    } = usePaginatedProducts(productFetcherOptions);

    // 3. MANEJO DE ESTADOS GLOBALES DE CARGA Y ERROR (antes de renderizar el layout)
    // Muestra "Cargando..." solo en la carga inicial o si no hay productos aún y no hay error
    if (loading && products.length === 0 && !error) {
        // Puedes usar clases genéricas o las específicas de OffersPage si las tienes
        return (
            <div className="page-container">
                <div className="page-title-block"><h2>Ofertas</h2></div>
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
    
    // 4. RENDERIZA USANDO ProductListingLayout
    // El layout manejará internamente el mensaje de "no hay productos" si es necesario,
    // o puedes personalizarlo aquí si el mensaje de "No hay ofertas disponibles..." es diferente.
    
    // Si después de cargar, no hay error, pero no hay productos y el total es cero
    if (!loading && !error && products.length === 0 && totalProducts === 0) {
        return (
            <div className="page-container">
                <div className="page-title-block">
                    <h2>Ofertas</h2>
                </div>
                {/* Usa la clase que tengas definida para el mensaje de "no ofertas" 
                    o una genérica como "page-empty" o "product-listing-not-found" 
                    si ProductListingLayout no se ajusta perfectamente al mensaje que quieres.
                    Para usar el mensaje exacto de tu versión original:
                */}
                <p className="page-empty offers-page-empty">No hay ofertas disponibles en este momento.</p>
            </div>
        );
    }

    return (
        // El div "page-container" es el wrapper principal de la página
        <div className="page-container"> 
            <ProductListingLayout
                title="Ofertas"
                products={products}
                loading={loading} // Para deshabilitar botones de paginación durante cargas
                currentPage={currentPage}
                totalProducts={totalProducts}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}