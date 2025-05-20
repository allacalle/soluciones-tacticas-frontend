// src/pages/ProductListPage.tsx
import './css/ProductListPage.css'; // Importa tus estilos
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getCategories } from '../api/wooApi'; // getProducts ya no se importa aquí
import { Category } from '../types'; // Product ya no se importa aquí directamente

// Componentes y Hooks
// ProductGrid se usa dentro de ProductListingLayout
import ProductListingLayout from '../components/ProductListingLayout';
import { usePaginatedProducts, UsePaginatedProductsOptions } from '../hooks/usePaginatedProducts';

const PRODUCTS_PER_PAGE_CATEGORY = 8; // Configuración específica de esta página

export default function ProductListPage() {
    const { categorySlug } = useParams<{ categorySlug: string }>();

    // 1. ESTADOS Y LÓGICA PARA CATEGORÍAS (se mantiene)
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
    const [categoryFetchError, setCategoryFetchError] = useState<Error | null>(null); // Error específico para categorías

    useEffect(() => {
        const fetchCategoriesList = async () => {
            setLoadingCategories(true);
            setCategoryFetchError(null);
            try {
                const result = await getCategories(1, 100);
                setCategories(result.categories);
            } catch (err: unknown) {
                console.error("[ProductListPage] Error al cargar categorías:", err);
                setCategoryFetchError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategoriesList();
    }, []); // Se ejecuta una vez

    const { currentCategory, categoryIdsStringForFilter } = useMemo(() => {
        if (!categories.length || !categorySlug) {
            return { currentCategory: undefined, categoryIdsStringForFilter: undefined };
        }
        const primaryCat = categories.find(cat => cat.slug === categorySlug);
        if (!primaryCat) {
            return { currentCategory: undefined, categoryIdsStringForFilter: undefined };
        }
        // Tu lógica de agrupar por nombre
        const nameToCats = categories.reduce((acc, cat) => {
            acc[cat.name] = acc[cat.name] || [];
            acc[cat.name].push(cat);
            return acc;
        }, {} as Record<string, Category[]>);
        
        const matchingCats = nameToCats[primaryCat.name] || [];
        const ids = matchingCats.map(cat => cat.id).join(',');
        
        // Devuelve undefined si ids está vacío para que el hook usePaginatedProducts lo ignore si es necesario
        return { currentCategory: primaryCat, categoryIdsStringForFilter: ids || undefined }; 
    }, [categories, categorySlug]);


    // 2. USA EL HOOK usePaginatedProducts
    // Determinar si se debe saltar el fetch de productos:
    // - Si las categorías aún están cargando.
    // - Si hay un categorySlug pero categoryIdsStringForFilter aún no está listo (y no hay error de categoría)
    //   (esto significa que o el slug no coincide, o la lógica de agrupación aún no se completa).
    // - Si no hay categorySlug (aunque tu ruta debería proveerlo).
    const shouldSkipProductFetch = useMemo(() => {
        if (loadingCategories) return true;
        if (categorySlug && !categoryIdsStringForFilter && !categoryFetchError) return true;
        if (!categorySlug && categories.length > 0) return true; // No hay slug, no fetchear
        return false;
    }, [loadingCategories, categorySlug, categoryIdsStringForFilter, categories.length, categoryFetchError]);

    const productFetcherOptions: UsePaginatedProductsOptions = useMemo(() => ({
        productsPerPage: PRODUCTS_PER_PAGE_CATEGORY,
        categoryId: categoryIdsStringForFilter, // Será undefined si aún no está listo o si no hay IDs
        skip: shouldSkipProductFetch,
        initialPage: 1, // El hook usePaginatedProducts ya resetea la página cuando categoryId cambia
    }), [categoryIdsStringForFilter, shouldSkipProductFetch]);

    const {
        products,
        loading: loadingProducts, // Renombrado para evitar colisión
        error: productsError,     // Renombrado
        currentPage,
        totalProducts,
        totalPages,
        setCurrentPage, // Función del hook para cambiar la página
    } = usePaginatedProducts(productFetcherOptions);

    // El useEffect que tenías para resetear currentPage cuando categorySlug cambia
    // ya no es estrictamente necesario aquí porque el hook usePaginatedProducts
    // tiene un efecto interno que resetea su `internalCurrentPage` a `initialPage` (que es 1)
    // cuando sus filtros principales (como `categoryId`) cambian.
    // useEffect(() => {
    //  console.log("[ProductListPage] categorySlug changed. Hook's internal reset should handle page.");
    //  // No necesitas llamar a setCurrentPage(1) aquí si el hook lo hace
    // }, [categorySlug]);


    // 3. LÓGICA DE RENDERIZADO CONDICIONAL
    if (loadingCategories) {
        return <div className="product-page-loading">Cargando información de categoría...</div>;
    }

    if (categoryFetchError) {
        return <div className="product-page-error">Error al cargar la categoría: {categoryFetchError.message}</div>;
    }

    // Si después de cargar categorías, el slug no encontró una categoría válida
    if (categorySlug && !currentCategory && !loadingCategories) {
        return (
            <div className="product-list-page-container">
                 <div className='page-title-block'><h2>Categoría no encontrada</h2></div>
                <div className="product-page-not-found">La categoría "{categorySlug}" no existe.</div>
            </div>
        );
    }
    
    // Si no hay slug en la URL (esto no debería pasar con tu configuración de rutas, pero es una guarda)
    if (!categorySlug && categories.length > 0 && !loadingCategories) {
         return (
            <div className="product-list-page-container">
                <div className='page-title-block'><h2>Error</h2></div>
                <div className="product-page-error">No se especificó una categoría.</div>
            </div>
        );
    }

    // Si estamos esperando que se resuelvan los IDs de categoría o saltando el fetch
    if (shouldSkipProductFetch && !productsError && !categoryFetchError) {
        // Podrías mostrar un loader más específico o simplemente el de categoría si es breve
        return <div className="product-page-loading">Procesando categoría...</div>;
    }
    
    // Si el hook está cargando productos (y no es la carga inicial de categorías)
    if (loadingProducts && products.length === 0 && !productsError) {
        return (
             <div className="product-list-page-container">
                {currentCategory && <div className='page-title-block'><h2>{currentCategory.name}</h2></div>}
                <div className="product-page-loading">Cargando productos de la categoría...</div>
             </div>
        );
    }

    // Si hubo un error al cargar productos (después de que la categoría se cargó bien)
    if (productsError) {
        return (
            <div className="product-list-page-container">
                {currentCategory && <div className='page-title-block'><h2>{currentCategory.name}</h2></div>}
                <div className="product-page-error">Error al cargar productos: {productsError.message}</div>
            </div>
        );
    }
    
    // Si llegamos aquí, usamos ProductListingLayout.
    // ProductListingLayout manejará el mensaje de "no hay productos" si products.length es 0.
    return (
        <div className="product-list-page-container"> {/* Contenedor principal de la PÁGINA */}
            <ProductListingLayout
                title={currentCategory?.name || "Productos de la Categoría"}
                products={products}
                loading={loadingProducts} // Para deshabilitar botones durante el fetch de la siguiente página
                currentPage={currentPage}
                totalProducts={totalProducts}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}