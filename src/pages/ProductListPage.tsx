// src/pages/ProductListPage.tsx
import './css/ProductListPage.css';
import { useEffect, useState, useMemo } from 'react'; // useState y useEffect ya estaban, nos aseguramos
import { useParams } from 'react-router-dom';
import { getCategories } from '../api/wooApi';
import { Category } from '../types';

import ProductListingLayout from '../components/ProductListingLayout';
import { usePaginatedProducts, UsePaginatedProductsOptions } from '../hooks/usePaginatedProducts';

// Define los productos por página para escritorio y móvil para ESTA PÁGINA
const PRODUCTS_PER_PAGE_CATEGORY_DESKTOP = 8; // Tu valor actual
const PRODUCTS_PER_PAGE_CATEGORY_MOBILE = 6;  // O el que prefieras para móvil
const MOBILE_BREAKPOINT = 768; // Define tu breakpoint, igual que antes

export default function ProductListPage() {
    const { categorySlug } = useParams<{ categorySlug: string }>();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
    const [categoryFetchError, setCategoryFetchError] = useState<Error | null>(null);

    // 1. Estado para saber si estamos en vista móvil (igual que en AllProductsPage)
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < MOBILE_BREAKPOINT);

    // 2. useEffect para actualizar isMobileView (igual que en AllProductsPage)
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < MOBILE_BREAKPOINT);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 3. Determina productsPerPage basado en isMobileView (igual que en AllProductsPage)
    const currentProductsPerPageCategory = useMemo(() => {
        return isMobileView ? PRODUCTS_PER_PAGE_CATEGORY_MOBILE : PRODUCTS_PER_PAGE_CATEGORY_DESKTOP;
    }, [isMobileView]);

    useEffect(() => {
        const fetchCategoriesList = async () => {
            // ... (tu lógica para fetchCategoriesList se mantiene igual) ...
            setLoadingCategories(true);
            setCategoryFetchError(null);
            try {
                const result = await getCategories({ page: 1, per_page: 100 }); 
                setCategories(result.categories);
                console.log("[ProductListPage] Lista de todas las categorías cargada:", result.categories.length);
            } catch (err: unknown) {
                console.error("[ProductListPage] Error al cargar la lista de categorías:", err);
                setCategoryFetchError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategoriesList();
    }, []);

    const { currentCategory, categoryIdsStringForFilter } = useMemo(() => {
        // ... (tu lógica para currentCategory y categoryIdsStringForFilter se mantiene igual) ...
        console.log("[ProductListPage] Recalculando currentCategory/categoryIdsStringForFilter. Slug:", categorySlug, "Categorías cargadas:", categories.length);
        if (!categories.length || !categorySlug) {
            console.log("[ProductListPage] No hay categorías cargadas o no hay categorySlug.");
            return { currentCategory: undefined, categoryIdsStringForFilter: undefined };
        }
        const primaryCat = categories.find(cat => cat.slug === categorySlug);
        if (!primaryCat) {
            console.log(`[ProductListPage] No se encontró primaryCat para el slug: ${categorySlug}`);
            return { currentCategory: undefined, categoryIdsStringForFilter: undefined };
        }
        console.log("[ProductListPage] primaryCat encontrada:", primaryCat.name, primaryCat.id);
        const nameToCats = categories.reduce((acc, cat) => {
            acc[cat.name] = acc[cat.name] || [];
            acc[cat.name].push(cat);
            return acc;
        }, {} as Record<string, Category[]>);
        const matchingCatsByName = nameToCats[primaryCat.name] || [primaryCat];
        const idsArray = matchingCatsByName.map(cat => cat.id);
        const idsString = idsArray.length > 0 ? idsArray.join(',') : undefined;
        console.log(`[ProductListPage] Categoria(s) para filtrar: ${idsString || 'ninguna (todos los productos)'}. currentCategory: ${primaryCat?.name}`);
        return { currentCategory: primaryCat, categoryIdsStringForFilter: idsString }; 
    }, [categories, categorySlug]);

    const shouldSkipProductFetch = useMemo(() => {
        // ... (tu lógica para shouldSkipProductFetch se mantiene igual) ...
        if (loadingCategories) {
            console.log("[ProductListPage] shouldSkipProductFetch: true (cargando categorías)");
            return true;
        }
        if (categorySlug && !categoryIdsStringForFilter && !categoryFetchError) {
            console.log("[ProductListPage] shouldSkipProductFetch: true (slug presente, pero categoryIdsStringForFilter aún no resuelto y sin error de categoría)");
            return true; 
        }
        console.log("[ProductListPage] shouldSkipProductFetch: false");
        return false;
    }, [loadingCategories, categorySlug, categoryIdsStringForFilter, categoryFetchError]);

    // 4. Pasa el currentProductsPerPageCategory a las opciones del hook
    const productFetcherOptions: UsePaginatedProductsOptions = useMemo(() => {
        const options: UsePaginatedProductsOptions = {
            productsPerPage: currentProductsPerPageCategory, // <--- ¡AQUÍ USAMOS EL VALOR DINÁMICO!
            categoryId: categoryIdsStringForFilter, 
            skip: shouldSkipProductFetch,
            initialPage: 1,
        };
        console.log("[ProductListPage] productFetcherOptions generadas:", options);
        return options;
    }, [currentProductsPerPageCategory, categoryIdsStringForFilter, shouldSkipProductFetch]); // Añadimos currentProductsPerPageCategory a las dependencias

    const {
        products,
        loading: loadingProducts,
        error: productsError,
        currentPage,
        totalProducts,
        totalPages,
        setCurrentPage,
    } = usePaginatedProducts(productFetcherOptions);

    // --- LÓGICA DE RENDERIZADO CONDICIONAL ---
    // (Se mantiene igual)
    // ...

    if (loadingCategories && !categorySlug) {
        return <div className="product-page-loading">Cargando configuración inicial...</div>;
    }
    if (loadingCategories && categorySlug) {
         return <div className="product-page-loading">Cargando información de la categoría...</div>;
    }

    if (categoryFetchError) {
        return (
            <div className="product-list-page-container">
                <div className='page-title-block'><h2>Error de Categoría</h2></div>
                <div className="product-page-error">No se pudo cargar la información de las categorías: {categoryFetchError.message}</div>
            </div>
        );
    }

    if (categorySlug && !currentCategory && !loadingCategories) {
        return (
            <div className="product-list-page-container">
                 <div className='page-title-block'><h2>Categoría no encontrada</h2></div>
                <div className="product-page-not-found">La categoría "{categorySlug}" no parece existir.</div>
            </div>
        );
    }
    
    if (categorySlug && shouldSkipProductFetch && !productsError && !categoryFetchError) {
        return (
            <div className="product-list-page-container">
                {currentCategory && <div className='page-title-block'><h2>{currentCategory.name}</h2></div>}
                <div className="product-page-loading">Procesando información de la categoría...</div>
            </div>
        );
    }
    
    const pageDisplayTitle = currentCategory?.name || (categorySlug ? `Categoría: ${categorySlug}` : "Todos los Productos");

    if (loadingProducts && products.length === 0) {
        return (
             <div className="product-list-page-container">
                <div className='page-title-block'><h2>{pageDisplayTitle}</h2></div>
                <div className="product-page-loading">Cargando productos...</div>
             </div>
        );
    }

    if (productsError) {
        return (
            <div className="product-list-page-container">
                <div className='page-title-block'><h2>{pageDisplayTitle}</h2></div>
                <div className="product-page-error">Error al cargar los productos: {productsError.message}</div>
            </div>
        );
    }
    
    return (
        <div className="product-list-page-container">
            <ProductListingLayout
                title={pageDisplayTitle}
                products={products}
                loading={loadingProducts}
                currentPage={currentPage}
                totalProducts={totalProducts}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                // itemsPerPage={currentProductsPerPageCategory} // Opcional, si lo necesitas en ProductListingLayout
            />
        </div>
    );
}