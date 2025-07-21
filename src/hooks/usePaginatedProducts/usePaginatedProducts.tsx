// src/hooks/usePaginatedProducts.tsx
import { useState, useEffect, useCallback } from 'react';
import { Product } from '../../types';
// Importa getProducts y GetProductsResult, y la nueva interfaz de opciones si la exportaste
import { getProducts, GetProductsResult, GetProductsOptions } from '../../api/wooApi'; // <--- AÑADE GetProductsOptions

export type SortOrder = 'asc' | 'desc';

// La interfaz de opciones del hook se mantiene igual
export interface UsePaginatedProductsOptions {
    initialPage?: number;
    productsPerPage?: number;
    categoryId?: string | undefined;
    searchTerm?: string | undefined;
    // Ajustamos orderBy para que coincida con los tipos de GetProductsOptions
    orderBy?: GetProductsOptions['orderby']; // Usa el tipo de la interfaz de la API
    order?: SortOrder | undefined;
    onSale?: boolean | undefined;
    featured?: boolean | undefined;
    includeIds?: number[] | undefined;
    excludeIds?: number[] | undefined; // <--- AÑADIMOS excludeIds aquí si quieres controlarlo desde el hook
    brandId?: number | string | undefined; // Permitimos string si la API de marca puede tomar slugs
    // Otros filtros que coincidan con GetProductsOptions
    tag?: string | undefined;
    min_price?: string | undefined;
    max_price?: string | undefined;
    stock_status?: GetProductsOptions['stock_status'];
    skip?: boolean;
}

export interface UsePaginatedProductsReturn {
    products: Product[];
    loading: boolean;
    error: Error | null; // Mantenemos Error para el tipo de error
    currentPage: number;
    totalProducts: number;
    totalPages: number;
    setCurrentPage: (page: number | ((prevPage: number) => number)) => void;
}

const DEFAULT_PRODUCTS_PER_PAGE = 10;

export function usePaginatedProducts(options: UsePaginatedProductsOptions = {}): UsePaginatedProductsReturn {
    // console.log('[usePaginatedProducts] Received options:', options); // Útil para depurar
    const {
        initialPage = 1,
        productsPerPage = DEFAULT_PRODUCTS_PER_PAGE,
        categoryId,
        searchTerm,
        orderBy,
        order,
        onSale,
        featured,
        includeIds,
        excludeIds, // <--- Desestructurar excludeIds
        brandId,
        tag,        // <--- Desestructurar nuevos filtros
        min_price,
        max_price,
        stock_status,
        skip = false,
    } = options;

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(!skip);
    const [error, setError] = useState<Error | null>(null);
    const [internalCurrentPage, setInternalCurrentPage] = useState<number>(initialPage);
    const [totalProducts, setTotalProducts] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);

    const setCurrentPage = useCallback((page: number | ((prevPage: number) => number)) => {
        // console.log('[usePaginatedProducts] setCurrentPage called with:', page);
        setInternalCurrentPage(page);
    }, []);

    // Efecto para resetear la página cuando los filtros cambian
    useEffect(() => {
        if (!skip) {
            // console.log('[usePaginatedProducts] Filters or initialPage changed, resetting current page to:', initialPage);
            setInternalCurrentPage(initialPage);
        }
    // Asegúrate de que todas las opciones de filtro que pueden resetear la página estén aquí
    }, [initialPage, productsPerPage, categoryId, searchTerm, orderBy, order, onSale, featured, includeIds, excludeIds, brandId, tag, min_price, max_price, stock_status, skip]);

    const fetchPageProducts = useCallback(async (pageToFetch: number) => {
        if (skip) {
            // console.log('[usePaginatedProducts] Skipping fetch as per options.');
            setProducts([]); setTotalProducts(0); setTotalPages(0); setLoading(false); setError(null);
            return;
        }

        setLoading(true); setError(null);
        
        // Construir el objeto de opciones para getProducts
        const apiOptions: GetProductsOptions = {
            page: pageToFetch,
            per_page: productsPerPage,
            category: categoryId,
            search: searchTerm,
            orderby: orderBy,
            order: order,
            on_sale: onSale,
            featured: featured,
            include: includeIds,
            exclude: excludeIds, // <--- Pasar excludeIds aquí
            brand: brandId,      // <--- Pasar brandId aquí
            tag: tag,            // <--- Pasar nuevos filtros
            min_price: min_price,
            max_price: max_price,
            stock_status: stock_status,
        };
        
        // Eliminar propiedades undefined del objeto apiOptions para no enviar parámetros vacíos
        // (URLSearchParams ya maneja bien los undefined, pero esto es más limpio para el log)
        Object.keys(apiOptions).forEach(key => apiOptions[key as keyof GetProductsOptions] === undefined && delete apiOptions[key as keyof GetProductsOptions]);

        console.log(`[usePaginatedProducts] Fetching page ${pageToFetch} with API options:`, apiOptions);

        try {
            // *** LLAMADA A getProducts CON EL NUEVO OBJETO DE OPCIONES ***
            const result: GetProductsResult = await getProducts(apiOptions);

            setProducts(result.products);
            setTotalProducts(result.total);
            setTotalPages(result.totalPages);
            // console.log(`[usePaginatedProducts] Fetched ${result.products.length}. Total: ${result.total}, Pages: ${result.totalPages}`);
        } catch (caughtError: unknown) {
            const err = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
            console.error(`[usePaginatedProducts] Error fetching products (Page ${pageToFetch}):`, err);
            setError(err); setProducts([]); setTotalProducts(0); setTotalPages(0);
        } finally {
            setLoading(false);
        }
    // Asegúrate de que todas las opciones de filtro estén en las dependencias de useCallback
    }, [productsPerPage, categoryId, searchTerm, orderBy, order, onSale, featured, includeIds, excludeIds, brandId, tag, min_price, max_price, stock_status, skip]); 

    // Efecto para llamar a fetchPageProducts cuando la página o los filtros (encapsulados en fetchPageProducts) cambian
    useEffect(() => {
        // console.log('[usePaginatedProducts] Effect to fetch products. Current page:', internalCurrentPage, 'Skip:', skip);
        fetchPageProducts(internalCurrentPage);
    }, [internalCurrentPage, fetchPageProducts, skip]); // fetchPageProducts es una dependencia porque contiene los filtros

    return { products, loading, error, currentPage: internalCurrentPage, totalProducts, totalPages, setCurrentPage };
}