// src/pages/ProductListPage.tsx
import './css/ProductListPage.css'; // Importa tus estilos
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getCategories } from '../api/wooApi'; // getProducts ya no se importa aquí
import { Category } from '../types'; // Product ya no se importa aquí directamente

// Componentes y Hooks
import ProductListingLayout from '../components/ProductListingLayout';
import { usePaginatedProducts, UsePaginatedProductsOptions } from '../hooks/usePaginatedProducts';

const PRODUCTS_PER_PAGE_CATEGORY = 8; // Configuración específica de esta página

export default function ProductListPage() {
    const { categorySlug } = useParams<{ categorySlug: string }>();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
    const [categoryFetchError, setCategoryFetchError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchCategoriesList = async () => {
            setLoadingCategories(true);
            setCategoryFetchError(null);
            try {
                // Esta llamada ya está corregida para usar el objeto de opciones
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
    }, []); // Se ejecuta una vez para obtener todas las categorías

    const { currentCategory, categoryIdsStringForFilter } = useMemo(() => {
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

        // Lógica para agrupar categorías por nombre (si es relevante para tu caso)
        const nameToCats = categories.reduce((acc, cat) => {
            acc[cat.name] = acc[cat.name] || [];
            acc[cat.name].push(cat);
            return acc;
        }, {} as Record<string, Category[]>);
        
        const matchingCatsByName = nameToCats[primaryCat.name] || [primaryCat]; // Fallback a solo primaryCat si la agrupación no da más
        
        const idsArray = matchingCatsByName.map(cat => cat.id);
        // Asegurarse de que idsString sea undefined si no hay IDs, en lugar de una cadena vacía.
        const idsString = idsArray.length > 0 ? idsArray.join(',') : undefined; // <--- MODIFICADO
        
        console.log(`[ProductListPage] Categoria(s) para filtrar: ${idsString || 'ninguna (todos los productos)'}. currentCategory: ${primaryCat?.name}`);
        return { currentCategory: primaryCat, categoryIdsStringForFilter: idsString }; 
    }, [categories, categorySlug]);

    const shouldSkipProductFetch = useMemo(() => {
        if (loadingCategories) {
            console.log("[ProductListPage] shouldSkipProductFetch: true (cargando categorías)");
            return true; // Esperar a que la lista completa de categorías se cargue
        }
        if (categorySlug && !categoryIdsStringForFilter && !categoryFetchError) {
            // Hay un slug en la URL, pero aún no hemos resuelto los IDs de categoría
            // (y no es porque hubo un error al cargar la lista de categorías).
            // Esto puede pasar brevemente mientras `categories` y `categorySlug` se procesan en el useMemo anterior.
            console.log("[ProductListPage] shouldSkipProductFetch: true (slug presente, pero categoryIdsStringForFilter aún no resuelto y sin error de categoría)");
            return true; 
        }
        // Si no hay slug (página "todos los productos"), no queremos saltar el fetch.
        // Si hay slug y YA tenemos categoryIdsStringForFilter (o hubo un error de categoría que se manejará aparte), no saltar.
        console.log("[ProductListPage] shouldSkipProductFetch: false");
        return false;
    }, [loadingCategories, categorySlug, categoryIdsStringForFilter, categoryFetchError]); // <--- AJUSTADO: eliminada categories.length como dependencia directa

    const productFetcherOptions: UsePaginatedProductsOptions = useMemo(() => {
        const options: UsePaginatedProductsOptions = {
            productsPerPage: PRODUCTS_PER_PAGE_CATEGORY,
            // categoryId aquí será el string de IDs o undefined
            categoryId: categoryIdsStringForFilter, 
            skip: shouldSkipProductFetch,
            initialPage: 1, 
            // Podrías añadir otros filtros por defecto si quieres, ej:
            // orderBy: 'date',
            // order: 'desc',
        };
        console.log("[ProductListPage] productFetcherOptions generadas:", options);
        return options;
    }, [categoryIdsStringForFilter, shouldSkipProductFetch]);

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
    // (Se mantiene bastante similar, pero revisa los mensajes y condiciones)

    if (loadingCategories && !categorySlug) { // Si es la página principal de productos y aún carga categorías
        return <div className="product-page-loading">Cargando configuración inicial...</div>;
    }
    if (loadingCategories && categorySlug) { // Si es una página de categoría específica y aún carga la lista de categorías
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

    // Si se proveyó un slug de categoría, pero no se encontró una categoría correspondiente
    // (después de que la lista de categorías se cargó sin errores)
    if (categorySlug && !currentCategory && !loadingCategories) {
        return (
            <div className="product-list-page-container">
                 <div className='page-title-block'><h2>Categoría no encontrada</h2></div>
                <div className="product-page-not-found">La categoría "{categorySlug}" no parece existir.</div>
            </div>
        );
    }
    
    // Si estamos en una página de categoría específica y aún estamos determinando los IDs o shouldSkip es true
    // (y no es porque la carga de categorías aún esté pendiente, ya cubierto arriba)
    if (categorySlug && shouldSkipProductFetch && !productsError && !categoryFetchError) {
        return (
            <div className="product-list-page-container">
                {currentCategory && <div className='page-title-block'><h2>{currentCategory.name}</h2></div>}
                <div className="product-page-loading">Procesando información de la categoría...</div>
            </div>
        );
    }
    
    // Título principal de la página (ya sea "Todos los Productos" o el nombre de la categoría)
    const pageDisplayTitle = currentCategory?.name || (categorySlug ? `Categoría: ${categorySlug}` : "Todos los Productos");

    if (loadingProducts && products.length === 0) { // Cargando productos por primera vez para esta vista
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
    
    // Si llegamos aquí, usamos ProductListingLayout.
    // ProductListingLayout puede manejar internamente el mensaje de "no hay productos".
    return (
        <div className="product-list-page-container">
            <ProductListingLayout
                title={pageDisplayTitle}
                products={products}
                loading={loadingProducts} // Para el loader mientras se cambia de página
                currentPage={currentPage}
                totalProducts={totalProducts}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                // Podrías pasar un mensaje explícito si products.length es 0, 
                // o dejar que ProductListingLayout lo maneje.
                // noProductsMessage={totalProducts === 0 ? "No se encontraron productos que coincidan con tu búsqueda." : undefined}
            />
        </div>
    );
}