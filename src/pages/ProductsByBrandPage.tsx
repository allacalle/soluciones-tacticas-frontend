// src/pages/ProductsByBrandPage.tsx
import './css/ProductsByBrandPage.css';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBrandBySlug } from '../api/wooApi';
import { Brand } from '../types';

import ProductListingLayout from '../components/ProductListingLayout/ProductListingLayout';
import BrandInfoHeader from '../components/BrandInfoHeader/BrandInfoHeader';
import { usePaginatedProducts, UsePaginatedProductsOptions } from '../hooks/usePaginatedProducts';

// Define los productos por página para escritorio y móvil para ESTA PÁGINA
const PRODUCTS_PER_PAGE_BRAND_DESKTOP = 8; // Tu valor actual
const PRODUCTS_PER_PAGE_BRAND_MOBILE = 6;  // O el que prefieras para móvil
const MOBILE_BREAKPOINT = 768; // Define tu breakpoint, igual que antes

export default function ProductsByBrandPage() {
    const { brandSlug } = useParams<{ brandSlug?: string }>();
    const navigate = useNavigate();

    const [brand, setBrand] = useState<Brand | null>(null);
    const [loadingBrand, setLoadingBrand] = useState<boolean>(true);
    const [errorBrand, setErrorBrand] = useState<Error | null>(null);

    // 1. Estado para saber si estamos en vista móvil (igual que en las otras páginas)
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < MOBILE_BREAKPOINT);

    // 2. useEffect para actualizar isMobileView (igual que en las otras páginas)
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < MOBILE_BREAKPOINT);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 3. Determina productsPerPage basado en isMobileView (igual que en las otras páginas)
    const currentProductsPerPageBrand = useMemo(() => {
        return isMobileView ? PRODUCTS_PER_PAGE_BRAND_MOBILE : PRODUCTS_PER_PAGE_BRAND_DESKTOP;
    }, [isMobileView]);

    useEffect(() => {
        if (!brandSlug) {
            console.error("[ProductsByBrandPage] No brand slug provided.");
            setErrorBrand(new Error("No se especificó una marca."));
            setLoadingBrand(false);
            return;
        }
        const fetchBrandDetails = async () => {
            // ... (tu lógica para fetchBrandDetails se mantiene igual) ...
            setLoadingBrand(true);
            setErrorBrand(null);
            setBrand(null);
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
            }
        };
        fetchBrandDetails();
    }, [brandSlug, navigate]);

    console.log('[ProductsByBrandPage] Brand object:', brand);
    console.log('[ProductsByBrandPage] Brand ID for filter:', brand?.id);

    const shouldSkipProductFetch = useMemo(() => {
        // ... (tu lógica para shouldSkipProductFetch se mantiene igual) ...
        const skip = loadingBrand || !!errorBrand || !brand || !brand?.id || !brandSlug;
        console.log('[ProductsByBrandPage] shouldSkipProductFetch:', skip, {loadingBrand, errorBrand, brandExists: !!brand, brandIdExists: !!brand?.id, brandSlugExists: !!brandSlug});
        return skip;
    }, [loadingBrand, errorBrand, brand, brandSlug]);
    
    // 4. Pasa el currentProductsPerPageBrand a las opciones del hook
    const productFetcherOptions: UsePaginatedProductsOptions = useMemo(() => ({
        productsPerPage: currentProductsPerPageBrand, // <--- ¡AQUÍ USAMOS EL VALOR DINÁMICO!
        brandId: brand?.id,
        skip: shouldSkipProductFetch,
        initialPage: 1,
    }), [currentProductsPerPageBrand, brand?.id, shouldSkipProductFetch]); // Añadimos currentProductsPerPageBrand a las dependencias

    const {
        products,
        loading: loadingProducts,
        error: errorProducts,
        currentPage,
        totalProducts,
        totalPages,
        setCurrentPage,
    } = usePaginatedProducts(productFetcherOptions);

    // 3. LÓGICA DE RENDERIZADO CONDICIONAL
    // (Se mantiene igual)
    // ...

    if (loadingBrand) {
        return <div className="products-by-brand-loading">Cargando información de la marca...</div>;
    }

    if (errorBrand) {
        return <div className="products-by-brand-error">Error: {errorBrand.message}</div>;
    }

    if (!brand) {
        return <div className="products-by-brand-not-found">La marca solicitada no existe.</div>;
    }

    if (loadingProducts && products.length === 0 && !errorProducts) {
        return (
            <div className="products-by-brand-container">
                <BrandInfoHeader brand={brand} />
                <div className="products-by-brand-loading">Cargando productos de {brand.name}...</div>
            </div>
        );
    }

    if (errorProducts && products.length === 0) {
        return (
            <div className="products-by-brand-container">
                <BrandInfoHeader brand={brand} />
                <div className="products-by-brand-error">Error al cargar los productos de {brand.name}: {errorProducts.message}</div>
            </div>
        );
    }
    
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

    return (
        <div className="products-by-brand-container">
            <BrandInfoHeader brand={brand} />
            <ProductListingLayout
                title={`Productos de ${brand.name}`}
                products={products}
                loading={loadingProducts}
                currentPage={currentPage}
                totalProducts={totalProducts}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                // itemsPerPage={currentProductsPerPageBrand} // Opcional
            />
        </div>
    );
}