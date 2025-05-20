// src/hooks/usePaginatedProducts.tsx
import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { getProducts, GetProductsResult } from '../api/wooApi';

export type SortOrder = 'asc' | 'desc';

export interface UsePaginatedProductsOptions {
    initialPage?: number;
    productsPerPage?: number;
    categoryId?: string | undefined;
    searchTerm?: string | undefined;
    orderBy?: string | undefined;
    order?: SortOrder | undefined;
    onSale?: boolean | undefined;
    featured?: boolean | undefined;
    includeIds?: number[] | undefined;
    brandId?: number | undefined; // <--- AÑADIR/ASEGURAR QUE ESTÉ AQUÍ
    skip?: boolean;
}

export interface UsePaginatedProductsReturn {
    products: Product[];
    loading: boolean;
    error: Error | null;
    currentPage: number;
    totalProducts: number;
    totalPages: number;
    setCurrentPage: (page: number | ((prevPage: number) => number)) => void;
}

const DEFAULT_PRODUCTS_PER_PAGE = 10;

export function usePaginatedProducts(options: UsePaginatedProductsOptions = {}): UsePaginatedProductsReturn {
    console.log('[usePaginatedProducts] Received options:', options);
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
        brandId, // <--- DESESTRUCTURAR brandId AQUÍ
        skip = false,
    } = options;

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(!skip);
    const [error, setError] = useState<Error | null>(null);
    const [internalCurrentPage, setInternalCurrentPage] = useState<number>(initialPage);
    const [totalProducts, setTotalProducts] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);

    const setCurrentPage = useCallback((page: number | ((prevPage: number) => number)) => {
        console.log('[usePaginatedProducts] setCurrentPage called with:', page);
        setInternalCurrentPage(page);
    }, []);

    useEffect(() => {
        if (!skip) {
            console.log('[usePaginatedProducts] Filters or initialPage changed, resetting current page to:', initialPage);
            setInternalCurrentPage(initialPage);
        }
    }, [initialPage, productsPerPage, categoryId, searchTerm, orderBy, order, onSale, featured, includeIds, brandId, skip]); // <--- AÑADIR brandId A LAS DEPENDENCIAS DE ESTE EFECTO

    const fetchPageProducts = useCallback(async (pageToFetch: number) => {
        if (skip) {
            console.log('[usePaginatedProducts] Skipping fetch as per options.');
            setProducts([]); setTotalProducts(0); setTotalPages(0); setLoading(false); setError(null);
            return;
        }

        setLoading(true); setError(null);
        // Logueamos los filtros que realmente se usarán para el fetch
        console.log(`[usePaginatedProducts] Fetching page ${pageToFetch} with filters:`, { 
            productsPerPage, categoryId, searchTerm, orderBy, order, onSale, featured, includeIds, brandId 
        });

        try {
            // Asegúrate de que el orden de los parámetros aquí coincida EXACTAMENTE
            // con la firma de tu función getProducts en wooApi.ts
            const result: GetProductsResult = await getProducts(
                pageToFetch,
                productsPerPage,
                categoryId,     // 3er arg
                searchTerm,     // 4o
                orderBy,        // 5o
                order,          // 6o
                onSale,         // 7o
                featured,       // 8o
                includeIds,     // 9o
                undefined,      // 10o: excludeIds (lo añadimos como undefined si no se usa explícitamente)
                brandId         // 11o: brandId
            );

            setProducts(result.products);
            setTotalProducts(result.total);
            setTotalPages(result.totalPages);
            console.log(`[usePaginatedProducts] Fetched ${result.products.length}. Total: ${result.total}, Pages: ${result.totalPages}`);
        } catch (caughtError: unknown) {
            const err = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
            console.error(`[usePaginatedProducts] Error fetching products (Page ${pageToFetch}):`, err);
            setError(err); setProducts([]); setTotalProducts(0); setTotalPages(0);
        } finally {
            setLoading(false);
        }
    // AÑADIR brandId a las dependencias de useCallback
    }, [productsPerPage, categoryId, searchTerm, orderBy, order, onSale, featured, includeIds, brandId, skip]); 

    useEffect(() => {
        console.log('[usePaginatedProducts] Effect to fetch products. Current page:', internalCurrentPage, 'Skip:', skip);
        fetchPageProducts(internalCurrentPage);
    }, [internalCurrentPage, fetchPageProducts, skip]);

    return { products, loading, error, currentPage: internalCurrentPage, totalProducts, totalPages, setCurrentPage, };
}