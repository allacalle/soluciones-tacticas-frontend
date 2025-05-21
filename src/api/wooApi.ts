// src/api/wooApi.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

// ** ============================================================== **
// ** CONFIGURACIÓN DE CONEXIÓN                                     **
// ** ============================================================== **
const SITEURL = import.meta.env.VITE_SITE_URL || '';
const CONSUMER_KEY = import.meta.env.VITE_WC_CONSUMER_KEY || '';
const CONSUMER_SECRET = import.meta.env.VITE_WC_CONSUMER_SECRET || '';

if (!SITEURL || !CONSUMER_KEY || !CONSUMER_SECRET) {
    const errorMessage = "ERROR CRÍTICO: Las variables de entorno VITE_SITE_URL, VITE_WC_CONSUMER_KEY, y VITE_WC_CONSUMER_SECRET deben estar configuradas en tu archivo .env para que la API de WooCommerce funcione.";
    console.error(errorMessage);
    // throw new Error(errorMessage); 
}

// Importa las interfaces necesarias
import { Product, Category, Brand, Variation } from '../types';

// Interfaces para los resultados de las funciones
export interface GetProductsResult {
    products: Product[];
    total: number;
    totalPages: number;
}

export interface GetCategoriesResult {
    categories: Category[];
    total: number;
    totalPages: number;
}

export interface GetBrandsResult {
    brands: Brand[];
    total: number;
    totalPages: number;
}

// ======================================================================
// *** FUNCIÓN AUXILIAR GENÉRICA PARA FETCH ***
// ======================================================================
interface FetchWooApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

interface WooApiResponse<T> {
    data: T;
    total?: number;
    totalPages?: number;
}

async function fetchWooApi<T>(
    endpoint: string, 
    params: URLSearchParams = new URLSearchParams(),
    options: FetchWooApiOptions = {}
): Promise<WooApiResponse<T>> {
    params.set('consumer_key', CONSUMER_KEY);
    params.set('consumer_secret', CONSUMER_SECRET);

    const apiUrl = `${SITEURL}/wp-json/wc/v3${endpoint}?${params.toString()}`;
    console.log(`[fetchWooApi] Calling API: ${apiUrl}`);

    try {
        const response = await fetch(apiUrl, {
            method: options.method || 'GET',
            headers: { 'User-Agent': 'ArmeriaFrontend/1.0' },
        });

        if (!response.ok) {
            const errorBodyText = await response.text();
            let errorMessage = `Error HTTP ${response.status} (${response.statusText}) en endpoint: ${endpoint}`;
            try {
                const errorJson = JSON.parse(errorBodyText);
                if (errorJson.message) errorMessage += ` - Mensaje API: ${errorJson.message}`;
                if (errorJson.code) errorMessage += ` - Código API: ${errorJson.code}`;
            } catch {
                errorMessage += ` - Respuesta no JSON: ${errorBodyText.substring(0, 200)}...`;
            }
            console.error(`[fetchWooApi] API Error for ${endpoint}. Status: ${response.status}. Message: ${errorMessage}. Full Response Body:`, errorBodyText);
            const error = new Error(errorMessage) as any;
            error.status = response.status;
            error.responseBody = errorBodyText;
            throw error;
        }

        const data: T = await response.json();
        const totalHeader = response.headers.get('X-WP-Total');
        const totalPagesHeader = response.headers.get('X-WP-TotalPages');

        return {
            data,
            total: totalHeader ? parseInt(totalHeader, 10) : undefined,
            totalPages: totalPagesHeader ? parseInt(totalPagesHeader, 10) : undefined,
        };

    } catch (networkOrProcessingError: any) {
        console.error(`[fetchWooApi] Fetch o procesamiento fallido para ${endpoint}:`, networkOrProcessingError.message);
        throw networkOrProcessingError instanceof Error ? networkOrProcessingError : new Error(String(networkOrProcessingError));
    }
}

// ======================================================================
// *** Funciones para obtener información de PRODUCTOS ***
// ======================================================================
export interface GetProductsOptions {
    page?: number;
    per_page?: number;
    category?: string;
    search?: string;
    orderby?: 'date' | 'id' | 'include' | 'title' | 'slug' | 'modified' | 'rand' | 'menu_order' | 'price' | 'popularity' | 'rating';
    order?: 'asc' | 'desc';
    on_sale?: boolean;
    featured?: boolean;
    include?: number[];
    exclude?: number[];
    brand?: number | string; // ID o slug de marca (el parámetro real puede variar, ej. 'pwb-brand' para taxonomía)
    tag?: string; // IDs de etiqueta
    min_price?: string;
    max_price?: string;
    stock_status?: 'instock' | 'outofstock' | 'onbackorder';
}

export const getProducts = async (
    options: GetProductsOptions = {}
): Promise<GetProductsResult> => {
    const params = new URLSearchParams();
    if (options.page !== undefined) params.set('page', String(options.page));
    if (options.per_page !== undefined) params.set('per_page', String(options.per_page));
    if (options.category) params.set('category', options.category);
    if (options.search) params.set('search', options.search);
    if (options.orderby) params.set('orderby', options.orderby);
    if (options.order) params.set('order', options.order);
    if (options.on_sale !== undefined) params.set('on_sale', String(options.on_sale));
    if (options.featured !== undefined) params.set('featured', String(options.featured));
    if (options.include && options.include.length > 0) params.set('include', options.include.join(','));
    if (options.exclude && options.exclude.length > 0) params.set('exclude', options.exclude.join(','));
    if (options.brand !== undefined) {
        // ATENCIÓN: El parámetro 'brand' puede no ser estándar. 
        // Si usas una taxonomía como 'pwb-brand', el parámetro sería 'pwb-brand'.
        // Ejemplo: params.set('pwb-brand', String(options.brand));
        // Por ahora, se usa 'brand' como en tu código original. Verifica su funcionamiento.
        params.set('brand', String(options.brand)); 
        console.warn("[getProducts] Usando parámetro 'brand'. Verifica si tu API lo soporta directamente o necesitas usar el slug/ID de la taxonomía de marca (ej. 'pwb-brand=ID_MARCA').");
    }
    if (options.tag) params.set('tag', options.tag);
    if (options.min_price) params.set('min_price', options.min_price);
    if (options.max_price) params.set('max_price', options.max_price);
    if (options.stock_status) params.set('stock_status', options.stock_status);

    try {
        const { data, total, totalPages } = await fetchWooApi<Product[]>("/products", params);
        return { products: data, total: total || 0, totalPages: totalPages || 0 };
    } catch (error) {
        console.error("[getProducts] Error al obtener productos:", error);
        return { products: [], total: 0, totalPages: 0 };
    }
};

export const getProductByIdOrSlug = async (identifier: string | number): Promise<Product | null> => {
    let endpoint: string;
    const params = new URLSearchParams();
    let isSlugSearch = false;

    if (typeof identifier === 'number') {
        endpoint = `/products/${identifier}`;
    } else {
        endpoint = "/products";
        params.set('slug', identifier);
        isSlugSearch = true;
    }

    try {
        const { data: rawProductData } = await fetchWooApi<Product[] | Product>(endpoint, params);
        let productToProcess: Product | null = null;

        if (isSlugSearch && Array.isArray(rawProductData)) {
            productToProcess = rawProductData.length > 0 ? rawProductData[0] : null;
        } else if (!isSlugSearch && !Array.isArray(rawProductData)) {
            productToProcess = rawProductData as Product;
        }

        if (!productToProcess) {
            console.warn(`[getProductByIdOrSlug] Producto con identificador "${identifier}" no encontrado.`);
            return null;
        }

        const finalProductData = { ...productToProcess };
        if ((finalProductData as any).brands && Array.isArray((finalProductData as any).brands)) {
            finalProductData.brand = (finalProductData as any).brands;
        } else {
            finalProductData.brand = undefined;
        }

        if (finalProductData.brand && finalProductData.brand.length > 0 && finalProductData.brand[0].slug) {
            const brandSlug = finalProductData.brand[0].slug;
            try {
                const brandDetails = await getBrandBySlug(brandSlug);
                if (brandDetails?.image && finalProductData.brand && finalProductData.brand[0]) {
                    finalProductData.brand[0].image = brandDetails.image;
                }
            } catch (brandError) {
                console.error(`[getProductByIdOrSlug] Error obteniendo detalles de marca para ${brandSlug}:`, brandError);
            }
        }
        return finalProductData;
    } catch (error: any) {
        if (isSlugSearch && error.status === 404) {
             console.warn(`[getProductByIdOrSlug] Producto con slug "${identifier}" no encontrado (API devolvió 404).`);
             return null;
        }
        console.error(`[getProductByIdOrSlug] Error procesando obtención de producto "${identifier}":`, error.message);
        throw error;
    }
};

// ======================================================================
// *** Funciones para obtener información de CATEGORÍAS ***
// ======================================================================
export interface GetCategoriesOptions {
    page?: number;
    per_page?: number;
    search?: string;
    parent?: number;
    hide_empty?: boolean;
    slug?: string; // Para buscar categoría por slug
    include?: number[];
    exclude?: number[];
    orderby?: 'id' | 'include' | 'name' | 'slug' | 'term_group' | 'description' | 'count';
    order?: 'asc' | 'desc';
}

export const getCategories = async (
    options: GetCategoriesOptions = {}
): Promise<GetCategoriesResult> => {
    const params = new URLSearchParams();
    if (options.page !== undefined) params.set('page', String(options.page));
    if (options.per_page !== undefined) params.set('per_page', String(options.per_page));
    if (options.search) params.set('search', options.search);
    if (options.parent !== undefined) params.set('parent', String(options.parent));
    if (options.hide_empty !== undefined) params.set('hide_empty', String(options.hide_empty));
    if (options.slug) params.set('slug', options.slug);
    if (options.include && options.include.length > 0) params.set('include', options.include.join(','));
    if (options.exclude && options.exclude.length > 0) params.set('exclude', options.exclude.join(','));
    if (options.orderby) params.set('orderby', options.orderby);
    if (options.order) params.set('order', options.order);
    
    try {
        const { data, total, totalPages } = await fetchWooApi<Category[]>("/products/categories", params);
        return { categories: data, total: total || 0, totalPages: totalPages || 0 };
    } catch (error) {
        console.error("[getCategories] Error al obtener categorías:", error);
        return { categories: [], total: 0, totalPages: 0 };
    }
};

export const getCategoryIdBySlug = async (slug: string): Promise<number | null> => {
    try {
        // Usamos la función getCategories refactorizada
        const { categories } = await getCategories({ slug: slug, per_page: 1 });
        return categories.length > 0 ? categories[0].id : null;
    } catch (error) {
        console.error(`[getCategoryIdBySlug] Error obteniendo ID para slug "${slug}":`, error);
        return null;
    }
};

// ======================================================================
// *** Funciones para obtener información de MARCAS ***
// ======================================================================
export interface GetBrandsOptions {
    page?: number;
    per_page?: number;
    search?: string;
    slug?: string; // Para buscar marca por slug
    // ... otros parámetros de la API de marcas
}

export const getBrands = async (
    options: GetBrandsOptions = {}
): Promise<GetBrandsResult> => {
    const params = new URLSearchParams();
    if (options.page !== undefined) params.set('page', String(options.page));
    if (options.per_page !== undefined) params.set('per_page', String(options.per_page));
    if (options.search) params.set('search', options.search);
    if (options.slug) params.set('slug', options.slug);
    
    // ATENCIÓN: El endpoint '/wc/v2/products/brands' puede no ser estándar.
    // Si usas un plugin como "Perfect WooCommerce Brands", el endpoint podría ser '/wp-json/pwb-brand/v1/brands'
    // o la taxonomía 'pwb-brand' podría ser accesible a través de los endpoints de taxonomías estándar.
    // Revisa la documentación de tu plugin de marcas.
    // Por ahora, mantengo el endpoint que tenías, pero es un punto común de problemas.
    const brandApiEndpoint = "/products/brands"; // '/wc/v2/products/brands' como tenías o ajusta
    console.warn(`[getBrands] Usando endpoint '${brandApiEndpoint}'. Verifica si es el correcto para tu plugin de marcas.`);

    try {
        const { data, total, totalPages } = await fetchWooApi<Brand[]>(brandApiEndpoint, params);
        return { brands: data, total: total || 0, totalPages: totalPages || 0 };
    } catch (error) {
        console.error("[getBrands] Error al obtener marcas:", error);
        return { brands: [], total: 0, totalPages: 0 };
    }
};

export const getBrandBySlug = async (slug: string): Promise<Brand | null> => {
    try {
        // Usamos la función getBrands refactorizada
        const { brands } = await getBrands({ slug: slug, per_page: 1 });
        return brands.length > 0 ? brands[0] : null;
    } catch (error) {
        console.error(`[getBrandBySlug] Error obteniendo marca por slug "${slug}":`, error);
        return null;
    }
};


// ======================================================================
// *** Función para obtener las variaciones de un producto por su ID ***
// ======================================================================
export const getVariationsByProductId = async (productId: number): Promise<Variation[]> => {
    if (!productId) {
        console.error("[getVariationsByProductId] Se requiere ID de producto.");
        throw new Error("Se requiere un ID de producto para obtener variaciones.");
    }
    const params = new URLSearchParams();
    params.set('per_page', '100'); // Obtener todas las variaciones (hasta 100)

    try {
        const { data } = await fetchWooApi<Variation[]>(`/products/${productId}/variations`, params);
        if (data.length === 0) {
            console.log(`[getVariationsByProductId] No se encontraron variaciones para el producto ID ${productId}.`);
        }
        return data;
    } catch (error: any) {
        if (error.status === 404) {
             console.warn(`[getVariationsByProductId] Producto ID ${productId} no encontrado o sin variaciones (API devolvió 404).`);
             return [];
        }
        console.error(`[getVariationsByProductId] Error obteniendo variaciones para producto ID ${productId}:`, error.message);
        throw error;
    }
};