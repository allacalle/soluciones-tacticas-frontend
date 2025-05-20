// src/pages/AllProductsPage.tsx
import { useMemo } from 'react'; // <--- AÑADE ESTO
import './css/AllProductsPage.css'; // <--- IMPORTA TU CSS EXISTENTE AQUÍ
import { usePaginatedProducts, UsePaginatedProductsOptions } from '../hooks/usePaginatedProducts';
import ProductListingLayout from '../components/ProductListingLayout';

const PRODUCTS_PER_PAGE_ALL = 8;

export default function AllProductsPage() {
    const productFetcherOptions: UsePaginatedProductsOptions = useMemo(() => ({
        productsPerPage: PRODUCTS_PER_PAGE_ALL,
    }), []); // No tiene dependencias reales que cambien para AllProductsPage


    const {
        products,
        loading,
        error,
        currentPage,
        totalProducts,
        totalPages,
        setCurrentPage,
    } = usePaginatedProducts(productFetcherOptions);

    // Manejo de estados globales de carga y error
    if (loading && products.length === 0 && !error) {
        return <div className="all-products-page-loading">Cargando todos los productos...</div>; // Usa tu clase CSS
    }

    if (error) {
        return <div className="all-products-page-error">Error al cargar los productos: {error.message}</div>; // Usa tu clase CSS
    }

    // Si ProductListingLayout maneja "no productos" cuando products.length es 0 (después de carga y sin error)
    // no necesitamos una comprobación adicional aquí, a menos que el mensaje sea diferente.
    // Tu CSS original tenía un .all-products-page-not-found para cuando products.length === 0 && totalProducts === 0
    // ProductListingLayout ahora tiene una lógica similar pero podría ser ligeramente diferente.
    // Si products.length es 0 pero totalProducts era > 0 (ej. error en una página subsiguiente), ProductListingLayout
    // mostrará su mensaje de "no se encontraron productos que coincidan...".
    // Si quieres el mensaje exacto "No se encontraron productos en la tienda." cuando totalProducts es 0,
    // podrías añadir esa lógica aquí ANTES de llamar a ProductListingLayout.

    // Caso especial para "Tienda vacía" (como en tu original)
    if (!loading && !error && products.length === 0 && totalProducts === 0) {
        return (
            <div className="all-products-page-container">
                <div className="page-title-block">
                    <h2>Todos los Productos</h2>
                </div>
                <div className="all-products-page-not-found">
                    No se encontraron productos en la tienda.
                </div>
            </div>
        );
    }
    
    return (
        <div className="all-products-page-container"> {/* Contenedor principal de la PÁGINA */}
            <ProductListingLayout
                title="Todos los Productos" // Pasa el título aquí
                products={products}
                loading={loading}
                currentPage={currentPage}
                totalProducts={totalProducts}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}