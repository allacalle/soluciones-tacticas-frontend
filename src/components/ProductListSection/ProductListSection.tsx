// src/components/ProductListSection.tsx
import './ProductListSection.css';
import { useEffect, useState, useMemo, useRef } from 'react';
import { getProducts, GetProductsOptions } from '../../api/wooApi';
import { Product } from '../../types';
import ProductGrid from '../ProductGrid/ProductGrid';
import { useViewport } from '../../hooks/useViewport/useViewport';

// Valores por defecto para el número de productos
const DEFAULT_PRODUCTS_PER_PAGE_DESKTOP = 8;
const DEFAULT_PRODUCTS_PER_PAGE_MOBILE = 4;

interface ProductListSectionProps {
    title: string;
    subtitle?: string;
    type: 'latest' | 'popular' | 'sale' | 'featured' | 'category' | 'ids';
    categoryId?: number;
    productIds?: number[];
    productsPerPage?: number;
}

function ProductListSection({
    title,
    subtitle,
    type,
    categoryId,
    productIds,
    productsPerPage
}: ProductListSectionProps) {

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // 1. Usamos nuestro hook personalizado para obtener el estado del viewport de forma fiable
    const { isMobileView } = useViewport();
    
    // 2. Creamos una referencia para poder manipular el contenedor del scroll
    const displayAreaRef = useRef<HTMLDivElement>(null);

    // Calcula el número de productos a pedir basado en la vista (móvil o escritorio)
    const resolvedProductsPerPage = useMemo(() => {
        if (productsPerPage !== undefined) {
            return productsPerPage;
        }
        return isMobileView ? DEFAULT_PRODUCTS_PER_PAGE_MOBILE : DEFAULT_PRODUCTS_PER_PAGE_DESKTOP;
    }, [productsPerPage, isMobileView]);

    // Efecto para cargar los productos cuando cambian las props
    useEffect(() => {
        const fetchSectionProducts = async () => {
            setLoading(true);
            setError(null);
            
            const options: GetProductsOptions = { page: 1, per_page: resolvedProductsPerPage };
            
            // Lógica para construir las opciones de la API
            switch (type) {
                case 'latest': options.orderby = 'date'; options.order = 'desc'; break;
                case 'popular': options.orderby = 'popularity'; options.order = 'desc'; break;
                case 'sale': options.on_sale = true; options.orderby = 'date'; options.order = 'desc'; break;
                case 'featured': options.featured = true; break;
                case 'category': if (categoryId !== undefined) { options.category = String(categoryId); } else { throw new Error("ID de categoría no proporcionado."); } break;
                case 'ids': if (productIds && productIds.length > 0) { options.include = productIds; options.per_page = productIds.length; options.orderby = 'include'; } else { setLoading(false); return; } break;
                default: throw new Error(`Tipo de sección desconocido: ${type}`);
            }
            if (!(type === 'ids' && productIds && productIds.length > 0)) {
                options.per_page = resolvedProductsPerPage;
            }

            try {
                const result = await getProducts(options);
                setProducts(result.products);
            } catch (caughtError: unknown) {
                const err = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
                setError(err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSectionProducts();
    }, [type, categoryId, productIds, resolvedProductsPerPage, title]);

    // --- EFECTO DEDICADO A CORREGIR EL SCROLL ---
     useEffect(() => {
        // Este efecto se ejecuta cuando los productos cambian.
        if (!loading && displayAreaRef.current) {
            
            // Usamos un setTimeout para asegurar que el scroll se aplique
            // DESPUÉS de que el navegador haya terminado de pintar el nuevo DOM.
            const timer = setTimeout(() => {
                if (displayAreaRef.current) {
                    displayAreaRef.current.scrollLeft = 0;
                }
            }, 0); // Un retardo de 0ms es suficiente para ponerlo en la siguiente tarea del ciclo de eventos.

            // Limpiamos el temporizador si el componente se desmonta antes de que se ejecute
            return () => clearTimeout(timer);
        }
    }, [products, loading]); // La dependencia sigue siendo la misma

    return (
        <section className="product-list-section">
            <div className="section-banner">
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
            </div>
            {/* Asignamos la referencia (ref) al div que tiene el scroll */}
            <div className="products-display-area" ref={displayAreaRef}>
                {loading && <div className="product-list-loading">Cargando productos...</div>}
                {!loading && error && <div className="product-list-error">Error: {error.message}</div>}
                {!loading && !error && products.length === 0 && (
                    <div className="product-list-empty">No se encontraron productos.</div>
                )}
                {!loading && !error && products.length > 0 && (
                    <ProductGrid products={products} />
                )}
            </div>
        </section>
    );
}

export default ProductListSection;