// src/components/ProductListSection.tsx
import './css/ProductListSection.css';
import { useEffect, useState, useMemo } from 'react'; // Añadido useMemo si no estaba

import { getProducts, GetProductsOptions } from '../api/wooApi';
import { Product } from '../types';
import ProductGrid from './ProductGrid';

// Valores por defecto si productsPerPage no se proporciona explícitamente
const DEFAULT_PRODUCTS_PER_PAGE_DESKTOP = 6; // O el valor que prefieras como defecto para escritorio
const DEFAULT_PRODUCTS_PER_PAGE_MOBILE = 4;  // O el valor que prefieras como defecto para móvil
const MOBILE_BREAKPOINT = 768; // Mantenemos el breakpoint consistente

interface ProductListSectionProps {
    title: string;
    subtitle?: string;
    type: 'latest' | 'popular' | 'sale' | 'featured' | 'category' | 'ids';
    categoryId?: number;
    productIds?: number[];
    productsPerPage?: number; // Esta prop sigue siendo opcional
}

function ProductListSection({
    title,
    subtitle,
    type,
    categoryId,
    productIds,
    productsPerPage // Ya no asignamos un valor por defecto aquí directamente
}: ProductListSectionProps) {

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

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

    // 3. Determina el número de productos a mostrar
    //    Si se proporciona productsPerPage como prop, se usa.
    //    Si no, se usa el valor por defecto responsivo.
    const resolvedProductsPerPage = useMemo(() => {
        if (productsPerPage !== undefined) {
            return productsPerPage; // Usar el valor proporcionado
        }
        // Si no se proporcionó, usar los defaults responsivos
        return isMobileView ? DEFAULT_PRODUCTS_PER_PAGE_MOBILE : DEFAULT_PRODUCTS_PER_PAGE_DESKTOP;
    }, [productsPerPage, isMobileView]);

    useEffect(() => {
        const fetchSectionProducts = async () => {
            setLoading(true);
            setError(null);
            setProducts([]);

            const options: GetProductsOptions = {
                page: 1,
                // 4. USA EL VALOR RESUELTO AQUÍ
                per_page: resolvedProductsPerPage,
            };

            try {
                switch (type) {
                    case 'latest':
                        options.orderby = 'date';
                        options.order = 'desc';
                        break;
                    case 'popular':
                        options.orderby = 'popularity';
                        options.order = 'desc';
                        break;
                    case 'sale':
                        options.on_sale = true;
                        options.orderby = 'date';
                        options.order = 'desc';
                        break;
                    case 'featured':
                        options.featured = true;
                        break;
                    case 'category':
                        if (categoryId !== undefined) {
                            options.category = String(categoryId);
                        } else {
                            console.error(`[ProductListSection] Título: "${title}" - Tipo 'category' requiere 'categoryId'.`);
                            throw new Error("ID de categoría no proporcionado para la sección de categoría.");
                        }
                        break;
                    case 'ids':
                        if (productIds && productIds.length > 0) {
                            options.include = productIds;
                            // Para 'ids', es común querer mostrar todos los IDs especificados,
                            // así que el resolvedProductsPerPage podría ser ignorado o ajustado.
                            // Aquí, priorizamos mostrar todos los IDs.
                            options.per_page = productIds.length;
                            options.orderby = 'include';
                        } else {
                            console.warn(`[ProductListSection] Título: "${title}" - Tipo 'ids' sin 'productIds' o array vacío.`);
                            setLoading(false);
                            return; 
                        }
                        break;
                    default:
                        console.error(`[ProductListSection] Título: "${title}" - Tipo de sección desconocido: '${type}'.`);
                        throw new Error(`Tipo de sección de productos desconocido: ${type}`);
                }
                
                // Para el tipo 'ids', no queremos que resolvedProductsPerPage limite la cantidad si ya definimos productIds.length
                // Solo aplicamos resolvedProductsPerPage si NO es de tipo 'ids' con productIds definidos.
                if (!(type === 'ids' && productIds && productIds.length > 0)) {
                    options.per_page = resolvedProductsPerPage;
                }

                console.log(`[ProductListSection] Título: "${title}", Tipo: "${type}", Fetching with options:`, options);
                const result = await getProducts(options);
                setProducts(result.products);

            } catch (caughtError: unknown) {
                const err = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
                console.error(`[ProductListSection] Título: "${title}", Tipo: "${type}" - Error al cargar productos:`, err);
                setError(err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSectionProducts();

    // Asegúrate de que resolvedProductsPerPage esté en las dependencias del efecto principal
    }, [type, categoryId, productIds, resolvedProductsPerPage, title]);

    // --- Renderizado ---
    return (
        <section className="product-list-section">
            <div className="section-banner">
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
            </div>
            <div className="products-display-area">
                {loading && <div className="product-list-loading">Cargando productos...</div>}
                {!loading && error && <div className="product-list-error">Error: {error.message}</div>}
                {!loading && !error && products.length === 0 && (
                    !(type === 'ids' && (!productIds || productIds.length === 0)) && 
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