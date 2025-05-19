// src/hooks/useProductDetails.ts
import { useState, useEffect } from 'react';
import { Product, Variation } from '../types'; // Ajusta la ruta si es necesario
import { getProductByIdOrSlug, getVariationsByProductId } from '../api/wooApi'; // Ajusta la ruta, AÑADIDO getVariationsByProductId

// Define una interfaz para lo que devolverá el hook, incluyendo los valores iniciales
export interface UseProductDetailsReturn {
    product: Product | null;
    loading: boolean;
    error: string | null;
    variationsData: Variation[];
    variationsLoading: boolean;
    variationsError: string | null;
    initialDisplayState: {
        price?: string;
        image?: string;
        attributes: { [key: string]: string | null };
    } | null;
}

// Define tu ruta real al placeholder. Ejemplo: si está en public/assets/placeholder.jpg
const placeholderImage = '../assets/logo/footer-logo.png'; // Cambia esto a la ruta correcta de tu imagen de placeholder
// O si lo importas como un módulo (si tu bundler lo soporta, ej. con Vite):
// import placeholderImageSrc from '../assets/placeholder-image.jpg'; // y luego usar placeholderImageSrc

export function useProductDetails(productSlug: string | undefined): UseProductDetailsReturn {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [variationsData, setVariationsData] = useState<Variation[]>([]);
    const [variationsLoading, setVariationsLoading] = useState(false);
    const [variationsError, setVariationsError] = useState<string | null>(null);

    const [initialDisplayState, setInitialDisplayState] = useState<{
        price?: string;
        image?: string;
        attributes: { [key: string]: string | null };
    } | null>(null);

    useEffect(() => {
        console.log(`[useProductDetails] Hook disparado para slug: ${productSlug}`);

        if (!productSlug) {
            setError("No se proporcionó un identificador de producto en la URL.");
            setLoading(false);
            setProduct(null);
            setVariationsData([]);
            setVariationsError(null);
            setInitialDisplayState(null);
            return;
        }

        const fetchProductAndVariations = async () => {
            try {
                // --- 1. RESETEAR ESTADOS AL INICIO DE LA CARGA ---
                setLoading(true);
                setError(null);
                setProduct(null);
                setVariationsData([]); // Resetear datos de variaciones
                setVariationsError(null); // Resetear error de variaciones
                setInitialDisplayState(null); // Resetea estado inicial que pasará a ProductPage

                // --- 2. FETCH DEL PRODUCTO PRINCIPAL ---
                const fetchedProduct = await getProductByIdOrSlug(productSlug);

                // --- 3. PROCESAR EL PRODUCTO PRINCIPAL ---
                if (fetchedProduct) {
                    console.log(`[useProductDetails] Producto principal cargado: ${fetchedProduct.name}`);
                    setProduct(fetchedProduct); // Guardar el producto padre en el estado del hook

                    // Determinar imagen inicial
                    let initialImage = placeholderImage; // Usa el placeholder por defecto
                    if (fetchedProduct.images && fetchedProduct.images.length > 0 && fetchedProduct.images[0].src) {
                        initialImage = fetchedProduct.images[0].src;
                    } else {
                        console.warn(`[useProductDetails] Producto ${fetchedProduct.name} (ID: ${fetchedProduct.id}) no tiene imágenes principales. Usando placeholder.`);
                    }
                    
                    // Determinar atributos iniciales para la selección
                    const initialAttrs: { [key: string]: string | null } = {};
                    if (fetchedProduct.attributes && fetchedProduct.attributes.length > 0) {
                        fetchedProduct.attributes.forEach(attr => {
                            if (attr.variation) { // Solo si es un atributo usado para crear variaciones
                                initialAttrs[attr.name] = null; // Inicializar a null (ninguna opción seleccionada por defecto)
                                // Si quisieras seleccionar la primera opción por defecto:
                                // initialAttrs[attr.name] = attr.options && attr.options.length > 0 ? attr.options[0] : null;
                            }
                        });
                    }
                    console.log("[useProductDetails] Estado de selección de atributos inicializado para ProductPage:", initialAttrs);

                    // Establecer el estado initialDisplayState que ProductPage usará para sus propios estados locales
                    setInitialDisplayState({
                        price: fetchedProduct.price,
                        image: initialImage,
                        attributes: initialAttrs
                    });

                    // === 4. SI ES UN PRODUCTO VARIABLE, CARGAR SUS VARIACIONES HIJAS COMPLETAS ===
                    if (fetchedProduct.type === 'variable' && fetchedProduct.id) {
                        console.log(`[useProductDetails] Detectado producto variable (ID: ${fetchedProduct.id}). Cargando variaciones...`);
                        setVariationsLoading(true);
                        setVariationsError(null);

                        try {
                            // *** ¡AHORA SÍ! Usa la función de tu wooApi.ts ***
                            const variationsDetails = await getVariationsByProductId(fetchedProduct.id);
                            
                            setVariationsData(variationsDetails || []); // Si es undefined, usa array vacío
                            console.log(`[useProductDetails] Variaciones cargadas (${variationsDetails?.length || 0}).`);
                            if (variationsDetails && variationsDetails.length > 0) {
                                console.log("[useProductDetails] Datos de la primera variación:", variationsDetails[0]);
                            }

                        } catch (vError: unknown) { // `unknown` es el tipo recomendado para errores capturados
                            const errorMessage = vError instanceof Error ? vError.message : String(vError);
                            console.error(`[useProductDetails] Error al cargar variaciones para el producto ${fetchedProduct.id}:`, errorMessage);
                            setVariationsError("Error al cargar las opciones del producto.");
                            setVariationsData([]); // Asegurar que esté vacío si hay error
                        } finally {
                            setVariationsLoading(false); // La carga de variaciones termina
                            console.log("[useProductDetails] Carga de variaciones finalizada.");
                        }
                    } else {
                         // Si no es variable, o no tiene ID, no hay variaciones que cargar
                         setVariationsLoading(false); // Asegurarse de que no se quede cargando
                         setVariationsData([]); // Asegurar array vacío
                    }
                } else {
                   // --- Si el producto principal no fue encontrado ---
                   setError("Producto no encontrado.");
                   setProduct(null);
                   setInitialDisplayState(null); // Limpiar para ProductPage
                   console.warn(`[useProductDetails] Producto con slug "${productSlug}" no encontrado por API.`);
                }
            } catch (caughtError: unknown) { // `unknown` es el tipo recomendado para errores capturados
                const errorMessage = caughtError instanceof Error ? caughtError.message : String(caughtError);
                console.error(`[useProductDetails] Error al cargar el producto ${productSlug}:`, errorMessage);
                setError("Error al cargar la información del producto.");
                setProduct(null);
                setInitialDisplayState(null); // Limpiar para ProductPage
            } finally {
                setLoading(false); // La carga del producto principal termina siempre
                console.log(`[useProductDetails] Carga del producto principal finalizada para slug: ${productSlug}`);
            }
        };

        fetchProductAndVariations();
    }, [productSlug]); // Dependencia: se re-ejecuta si productSlug cambia

    return {
        product,
        loading,
        error,
        variationsData,
        variationsLoading,
        variationsError,
        initialDisplayState
    };
}