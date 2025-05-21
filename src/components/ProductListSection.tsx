// src/components/ProductListSection.tsx

import './css/ProductListSection.css';
import { useEffect, useState } from 'react';

// Importa la función para obtener productos, la interfaz Product y GetProductsOptions
import { getProducts, GetProductsOptions } from '../api/wooApi'; // <--- AÑADE GetProductsOptions
import { Product } from '../types';
import ProductGrid from './ProductGrid';

interface ProductListSectionProps {
    title: string;
    subtitle?: string;
    type: 'latest' | 'popular' | 'sale' | 'featured' | 'category' | 'ids';
    categoryId?: number; // Para type 'category'
    productIds?: number[]; // Para type 'ids'
    productsPerPage?: number;
}

function ProductListSection({
    title,
    subtitle,
    type,
    categoryId,
    productIds,
    productsPerPage = 6 // Ajustado a 6 como en tus logs, o el valor que prefieras
}: ProductListSectionProps) {

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchSectionProducts = async () => {
            setLoading(true);
            setError(null);
            setProducts([]); // Limpiar productos anteriores al iniciar una nueva carga

            // Objeto base de opciones para getProducts
            const options: GetProductsOptions = {
                page: 1,
                per_page: productsPerPage,
                // Otros valores por defecto que quieras aplicar a todas las secciones
            };

            try {
                // Lógica para construir el objeto 'options' basándose en 'type'
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
                        options.orderby = 'date'; // Opcional: ordenar los de oferta por fecha
                        options.order = 'desc';
                        break;
                    case 'featured':
                        options.featured = true;
                        // options.orderby = 'menu_order'; // Productos destacados a menudo se ordenan manualmente
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
                            options.per_page = productIds.length; // Asegurarse de obtener todos los IDs especificados
                            options.orderby = 'include'; // Ordenar por el orden de los IDs en 'include'
                        } else {
                            console.warn(`[ProductListSection] Título: "${title}" - Tipo 'ids' sin 'productIds' o array vacío.`);
                            // No hacer fetch si no hay IDs, products se quedará vacío.
                            setLoading(false); // Importante para no quedar en estado de carga infinito
                            return; 
                        }
                        break;
                    default:
                        // Lanza un error o maneja el caso de tipo desconocido
                        console.error(`[ProductListSection] Título: "${title}" - Tipo de sección desconocido: '${type}'.`);
                        throw new Error(`Tipo de sección de productos desconocido: ${type}`);
                }
                
                console.log(`[ProductListSection] Título: "${title}", Tipo: "${type}", Fetching with options:`, options);
                const result = await getProducts(options); // <--- LLAMADA A LA NUEVA getProducts
                setProducts(result.products);

            } catch (caughtError: unknown) {
                const err = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
                console.error(`[ProductListSection] Título: "${title}", Tipo: "${type}" - Error al cargar productos:`, err);
                setError(err);
                setProducts([]); // Asegurar que products esté vacío en caso de error
            } finally {
                setLoading(false);
            }
        };

        fetchSectionProducts();

    }, [type, categoryId, productIds, productsPerPage, title]); // Dependencias del efecto

    // --- Renderizado ---
    // (Se mantiene igual, ya que ProductGrid recibe los 'products' y los mensajes de carga/error se manejan aquí)
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
                    // Mostrar mensaje solo si no es el caso de 'ids' sin productIds (ya manejado arriba)
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