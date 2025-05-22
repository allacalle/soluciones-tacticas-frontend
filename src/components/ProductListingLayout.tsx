// src/components/ProductListingLayout.tsx
import React from 'react';
import { Product } from '../types';
import ProductGrid from './ProductGrid';
// NO importaremos un CSS específico aquí, ya que dependeremos del CSS de la página que lo usa.

interface ProductListingLayoutProps {
    title: string; // El título se pasará como prop
    products: Product[];
    loading: boolean;
    currentPage: number;
    totalProducts: number;
    totalPages: number;
    onPageChange: (page: number | ((prevPage: number) => number)) => void;
}

const ProductListingLayout: React.FC<ProductListingLayoutProps> = ({
    title, // Recibimos el título
    products,
    loading,
    currentPage,
    totalProducts,
    totalPages,
    onPageChange,
}) => {

    if (!loading && products.length === 0 && totalProducts === 0) {
        return (
            // Usamos la clase del CSS original para "no encontrado"
            // El título lo ponemos aquí también para consistencia si la página de "no encontrados" lo necesita
            <>
                <div className="page-title-block">
                    <h2>{title}</h2>
                </div>
                <div className="all-products-page-not-found"> {/* USA LA CLASE DE AllProductsPage.css */}
                    <p>No se encontraron productos que coincidan con los criterios actuales.</p>
                </div>
            </>
        );
    }

    return (
        <> {/* Usamos un Fragment aquí porque el contenedor principal (.all-products-page-container) estará en AllProductsPage.tsx */}
            <div className="page-title-block"> {/* USA LA CLASE DE AllProductsPage.css */}
                <h2>{title}</h2> {/* Usamos el título pasado como prop */}
            </div>

            {
            /*
            {(totalProducts > 0 || products.length > 0) && (
                <div className="pagination-info"> }
                    {totalProducts > 0 && <p>Total de productos encontrados: {totalProducts}</p>}
                    {totalPages > 1 && <p>Mostrando página {currentPage} de {totalPages}</p>}
                </div>
            )}
            */
            }
            
            

            {products.length > 0 && (
                <div className="products-display-area"> {/* USA LA CLASE DE AllProductsPage.css */}
                    <ProductGrid products={products} />
                </div>
            )}

            {totalPages > 1 && (
                <div className="pagination-buttons"> {/* USA LA CLASE DE AllProductsPage.css */}
                    <button
                        onClick={() => onPageChange(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1 || loading}
                        // Los estilos de los botones vendrán de .pagination-buttons button en AllProductsPage.css
                    >
                        Página Anterior
                    </button>
                    <span className="pagination-current-page"> {/* Añade esta clase si necesitas estilizar el span */}
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={() => onPageChange(prev => prev + 1)}
                        disabled={currentPage === totalPages || loading}
                    >
                        Página Siguiente
                    </button>
                </div>
            )}
        </>
    );
};

export default ProductListingLayout;