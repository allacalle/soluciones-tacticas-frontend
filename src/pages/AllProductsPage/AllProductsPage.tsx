// src/pages/AllProductsPage.tsx
import { useMemo, useState, useEffect } from 'react'; // <--- AÑADE useState y useEffect
import { usePaginatedProducts, UsePaginatedProductsOptions } from '../../hooks/usePaginatedProducts/usePaginatedProducts';
import ProductListingLayout from '../../components/ProductListingLayout/ProductListingLayout';
import './AllProductsPage.css';

// Define los productos por página para escritorio y móvil
const PRODUCTS_PER_PAGE_DESKTOP = 8;
const PRODUCTS_PER_PAGE_MOBILE = 6; // O el número que prefieras para móvil
const MOBILE_BREAKPOINT = 768; // Define tu breakpoint para móvil (ej. 768px)

export default function AllProductsPage() {
    // 1. Estado para saber si estamos en vista móvil
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < MOBILE_BREAKPOINT);

    // 2. useEffect para actualizar isMobileView cuando cambie el tamaño de la ventana
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < MOBILE_BREAKPOINT);
        };

        window.addEventListener('resize', handleResize);
        // Limpia el event listener cuando el componente se desmonte
        return () => window.removeEventListener('resize', handleResize);
    }, []); // El array vacío asegura que esto solo se ejecute al montar y desmontar

    // 3. Determina productsPerPage basado en isMobileView
    const currentProductsPerPage = useMemo(() => {
        return isMobileView ? PRODUCTS_PER_PAGE_MOBILE : PRODUCTS_PER_PAGE_DESKTOP;
    }, [isMobileView]); // Se recalcula solo cuando isMobileView cambia

    // 4. Pasa el currentProductsPerPage a las opciones del hook
    const productFetcherOptions: UsePaginatedProductsOptions = useMemo(() => ({
        productsPerPage: currentProductsPerPage,
    }), [currentProductsPerPage]); // Ahora depende de currentProductsPerPage

    const {
        products,
        loading,
        error,
        currentPage,
        totalProducts,
        totalPages,
        setCurrentPage,
    } = usePaginatedProducts(productFetcherOptions); // El hook usará el productsPerPage dinámico

    // El resto de tu lógica de renderizado (loading, error, not-found, ProductListingLayout)
    // puede permanecer prácticamente igual, ya que el hook usePaginatedProducts
    // se encargará de obtener la cantidad correcta de productos y de recalcular totalPages.

    if (loading && products.length === 0 && !error) {
        return <div className="all-products-page-loading">Cargando todos los productos...</div>;
    }

    if (error) {
        return <div className="all-products-page-error">Error al cargar los productos: {error.message}</div>;
    }

    if (!loading && !error && products.length === 0 && totalProducts === 0) {
        return (
            <div className="all-products-page-container">
                <div className="page-title-block"> {/* Asumo que tienes estilos para esto o es un placeholder */}
                    <h2>Todos los Productos</h2>
                </div>
                <div className="all-products-page-not-found">
                    No se encontraron productos en la tienda.
                </div>
            </div>
        );
    }
    
    return (
        <div className="all-products-page-container">
            <ProductListingLayout
                title="Todos los Productos"
                products={products}
                loading={loading} // Pasa el estado de carga, incluso si es para páginas subsiguientes
                currentPage={currentPage}
                totalProducts={totalProducts}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                // Opcional: Podrías pasar productsPerPage a ProductListingLayout si necesita mostrar esa info
                // itemsPerPage={currentProductsPerPage}
            />
        </div>
    );
}