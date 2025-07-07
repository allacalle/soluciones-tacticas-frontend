// src/components/ProductListingLayout.tsx
import React, { useRef, useEffect } from 'react'; // <-- AÑADE useRef y useEffect
import { Product } from '../types';
import ProductGrid from './ProductGrid';
import Pagination from './Pagination';
import './css/ProductListingLayout.css'; // Asegúrate de que este archivo exista

interface ProductListingLayoutProps {
    title: string;
    products: Product[];
    loading: boolean;
    currentPage: number;
    totalProducts: number;
    totalPages: number;
    onPageChange: (page: number) => void; // Simplificado para que sea más fácil de llamar
}

const ProductListingLayout: React.FC<ProductListingLayoutProps> = ({
    title,
    products,
    loading,
    currentPage,
    totalProducts,
    totalPages,
    onPageChange,
}) => {
    // --- INICIO DE CAMBIOS PARA EL SCROLL ---

    // 1. Crea una referencia al contenedor que queremos que esté visible
    const layoutRef = useRef<HTMLDivElement>(null);

    // 2. Crea un efecto que se dispare cuando 'currentPage' cambie
    useEffect(() => {
        // Comprobamos si la referencia existe para evitar errores
        if (layoutRef.current) {
            // Hacemos scroll suavemente hacia la parte superior del layout
            layoutRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [currentPage]); // <-- La dependencia clave es currentPage

    // --- FIN DE CAMBIOS PARA EL SCROLL ---


    const handleNextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    if (!loading && products.length === 0 && totalProducts === 0) {
        // 3. Asigna la referencia también aquí para consistencia
        return (
            <div className="product-listing-layout" ref={layoutRef}>
                <div className="page-title-block">
                    <h2>{title}</h2>
                </div>
                <div className="all-products-page-not-found">
                    <p>No se encontraron productos que coincidan con los criterios actuales.</p>
                </div>
            </div>
        );
    }

    return (
        // 3. Asigna la referencia al div principal del layout
        <div className="product-listing-layout" ref={layoutRef}>
            <div className="page-title-block">
                <h2>{title}</h2>
            </div>
            
            {totalProducts > 0 && (
                 <div className="pagination-info">
                    {/* ... tu info de paginación si la quieres ... */}
                 </div>
            )}

            {products.length > 0 && (
                <div className="products-display-area">
                    <ProductGrid products={products} />
                </div>
            )}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onNextPage={handleNextPage}
                onPrevPage={handlePrevPage}
            />
        </div>
    );
};

export default ProductListingLayout;