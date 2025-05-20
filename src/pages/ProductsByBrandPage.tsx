// src/pages/ProductsByBrandPage.tsx
import './css/ProductsByBrandPage.css'; // Estilos específicos de esta página
import { useEffect, useState, useMemo } from 'react'; // Añadimos useMemo
import { useParams, useNavigate } from 'react-router-dom';
import { getBrandBySlug } from '../api/wooApi'; // getProducts ya no se importa aquí
import { Brand } from '../types'; // Product ya no se importa aquí

// Componentes y Hooks
import ProductListingLayout from '../components/ProductListingLayout';
import BrandInfoHeader from '../components/BrandInfoHeader'; // Nuevo componente
import { usePaginatedProducts, UsePaginatedProductsOptions } from '../hooks/usePaginatedProducts';

const PRODUCTS_PER_PAGE_BRAND = 8; // O el valor que prefieras

export default function ProductsByBrandPage() {
    const { brandSlug } = useParams<{ brandSlug?: string }>();
    const navigate = useNavigate();

    // 1. ESTADOS Y LÓGICA PARA CARGAR LA MARCA (se mantiene similar)
    const [brand, setBrand] = useState<Brand | null>(null);
    const [loadingBrand, setLoadingBrand] = useState<boolean>(true);
    const [errorBrand, setErrorBrand] = useState<Error | null>(null);
    // const [brandFetched, setBrandFetched] = useState<boolean>(false); // Ya no tan necesario con 'skip'

    useEffect(() => {
        if (!brandSlug) {
            console.error("[ProductsByBrandPage] No brand slug provided.");
            setErrorBrand(new Error("No se especificó una marca."));
            setLoadingBrand(false);
            // setBrandFetched(true);
            // navigate('/marcas'); // Opcional: redirigir
            return;
        }

        const fetchBrandDetails = async () => {
            setLoadingBrand(true);
            setErrorBrand(null);
            setBrand(null);
            // setBrandFetched(false);
            try {
                const fetchedBrand = await getBrandBySlug(brandSlug);
                if (fetchedBrand) {
                    setBrand(fetchedBrand);
                } else {
                    setErrorBrand(new Error(`La marca "${brandSlug}" no fue encontrada.`));
                }
            } catch (err) {
                setErrorBrand(err instanceof Error ? err : new Error(String(err)));
            } finally {
                setLoadingBrand(false);
                // setBrandFetched(true);
            }
        };
        fetchBrandDetails();
    }, [brandSlug, navigate]);

    console.log('[ProductsByBrandPage] Brand object:', brand);
    console.log('[ProductsByBrandPage] Brand ID for filter:', brand?.id);

    // 2. USA EL HOOK usePaginatedProducts
    // Determinar si se debe saltar el fetch de productos:
    // - Si la marca aún está cargando.
    // - Si hubo un error al cargar la marca.
    // - Si la marca se cargó pero no se encontró (brand es null).
    // - Si no hay brandSlug.
   const shouldSkipProductFetch = useMemo(() => {
    const skip = loadingBrand || !!errorBrand || !brand || !brand?.id || !brandSlug;
    console.log('[ProductsByBrandPage] shouldSkipProductFetch:', skip, {loadingBrand, errorBrand, brandExists: !!brand, brandIdExists: !!brand?.id, brandSlugExists: !!brandSlug});
    return skip;
}, [loadingBrand, errorBrand, brand, brandSlug]);

    

    const productFetcherOptions: UsePaginatedProductsOptions = useMemo(() => ({
        productsPerPage: PRODUCTS_PER_PAGE_BRAND,
        brandId: brand?.id, // Pasa el brand.id obtenido. Será undefined si brand es null.
        skip: shouldSkipProductFetch,
        initialPage: 1, // El hook resetea la página si brandId cambia
    }), [brand?.id, shouldSkipProductFetch]); // Depende de brand.id y skip

    const {
        products,
        loading: loadingProducts, // Renombrado
        error: errorProducts,     // Renombrado
        currentPage,
        totalProducts,
        totalPages,
        setCurrentPage,
    } = usePaginatedProducts(productFetcherOptions);


    // 3. LÓGICA DE RENDERIZADO CONDICIONAL (más simplificada)
    if (loadingBrand) {
        return <div className="products-by-brand-loading">Cargando información de la marca...</div>;
    }

    if (errorBrand) { // Error al cargar la marca o marca no encontrada
        return <div className="products-by-brand-error">Error: {errorBrand.message}</div>;
    }

    if (!brand) { // Si la marca es null después de cargar (ej. slug no válido y getBrandBySlug devolvió null)
        // Esto podría estar cubierto por errorBrand si setErrorBrand se llama cuando fetchedBrand es null.
        // Doble check: si errorBrand es null pero brand es null, también es un "no encontrado".
        return <div className="products-by-brand-not-found">La marca solicitada no existe.</div>;
    }

    // Si llegamos aquí, 'brand' está cargado y no es null.
    // Ahora manejamos la carga/error de los productos.

    // Si está cargando productos Y no hay productos previos Y no hay error de productos
    if (loadingProducts && products.length === 0 && !errorProducts) {
        return (
            <div className="products-by-brand-container">
                <BrandInfoHeader brand={brand} />
                <div className="products-by-brand-loading">Cargando productos de {brand.name}...</div>
            </div>
        );
    }

    // Si hay error al cargar productos (y no es la carga inicial de productos)
    if (errorProducts && products.length === 0) { // Muestra error solo si no hay productos para mostrar
        return (
            <div className="products-by-brand-container">
                <BrandInfoHeader brand={brand} />
                <div className="products-by-brand-error">Error al cargar los productos de {brand.name}: {errorProducts.message}</div>
            </div>
        );
    }
    
    // Si después de cargar, no hay error, pero no hay productos y el total es cero para esta marca
    if (!loadingProducts && !errorProducts && products.length === 0 && totalProducts === 0) {
        return (
            <div className="products-by-brand-container">
                <BrandInfoHeader brand={brand} />
                <div className="products-by-brand-not-found">
                    No se encontraron productos para la marca "{brand.name}".
                </div>
            </div>
        );
    }

    // Renderizado principal: Mostrar info de marca y luego el layout de listado de productos
    return (
        <div className="products-by-brand-container"> {/* Contenedor principal de la página */}
            <BrandInfoHeader brand={brand} />
            
            <ProductListingLayout
                // El título del layout podría ser algo como "Productos" o dejarlo vacío
                // si BrandInfoHeader ya tiene un h2 con el nombre de la marca.
                // O podrías pasar un título más específico si quieres.
                title={`Productos de ${brand.name}`} // O simplemente "Productos"
                products={products}
                loading={loadingProducts}
                currentPage={currentPage}
                totalProducts={totalProducts}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}