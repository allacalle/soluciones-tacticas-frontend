// src/hooks/useRecommendedProducts.ts
import { useState, useEffect } from 'react';
import { Product, Tag } from '../types'; // Importa Tag también
import { getProducts, GetProductsOptions } from '../api/wooApi'; // Importa GetProductsOptions

interface UseRecommendedProductsReturn {
    recommendedProducts: Product[];
    loading: boolean;
    error: string | null; // Mantenemos string para el mensaje de error simplificado
}

export function useRecommendedProducts(
    currentProduct: Product | null,
    count: number = 5
): UseRecommendedProductsReturn {
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!currentProduct || !currentProduct.id) {
            setRecommendedProducts([]);
            setLoading(false);
            setError(null);
            return;
        }

        const fetchAndProcess = async () => {
            setLoading(true);
            setError(null);
            setRecommendedProducts([]);

            // productScores: productId -> { product (solo con id y score), score }
            // No necesitamos guardar el objeto Product completo aquí, solo el ID para buscarlo en processedProductDetails.
            const productScores: Map<number, number> = new Map();
            // processedProductDetails: productId -> Product (objeto completo)
            const processedProductDetails: Map<number, Product> = new Map();

            try {
                console.log(`[useRecommendedProducts] Buscando recomendaciones para: ${currentProduct.name} (ID: ${currentProduct.id})`);

                const candidateFetchLimit = count * 2 + 5; // Pedir algunos más para tener margen
                const excludeBaseIds = [currentProduct.id];

                const processCandidates = (products: Product[], scoreToAdd: number) => {
                    products.forEach(p => {
                        if (p.id !== currentProduct.id) { // Doble seguridad
                            const currentScore = productScores.get(p.id) || 0;
                            productScores.set(p.id, currentScore + scoreToAdd);
                            if (!processedProductDetails.has(p.id)) {
                                processedProductDetails.set(p.id, p);
                            }
                        }
                    });
                };
                
                // Array para todas las promesas de obtención de candidatos
                const fetchPromises: Promise<void>[] = [];

                // 1. PRODUCTOS DE LA MISMA MARCA (Peso: 30)
                if (currentProduct.brand && currentProduct.brand.length > 0) {
                    // Asumimos que la API puede filtrar por el ID de la marca (primer marca si hay varias)
                    const brandId = currentProduct.brand[0].id; 
                    if (brandId) {
                        const brandOptions: GetProductsOptions = {
                            brand: brandId, // o 'pwb-brand': brandId si es una taxonomía
                            per_page: candidateFetchLimit,
                            exclude: excludeBaseIds,
                        };
                        fetchPromises.push(
                            getProducts(brandOptions).then(result => {
                                console.log(`[useRecommendedProducts] Misma marca (${brandId}) encontrados: ${result.products.length}`);
                                processCandidates(result.products, 30);
                            }).catch(e => console.error("Error fetching brand products:", e))
                        );
                    }
                }

                // 2. PRODUCTOS DESTACADOS (Peso: 25)
                const featuredOptions: GetProductsOptions = {
                    featured: true,
                    per_page: candidateFetchLimit,
                    exclude: excludeBaseIds,
                };
                fetchPromises.push(
                    getProducts(featuredOptions).then(result => {
                        console.log(`[useRecommendedProducts] Destacados encontrados: ${result.products.length}`);
                        processCandidates(result.products, 25);
                    }).catch(e => console.error("Error fetching featured products:", e))
                );

                // 3. PRODUCTOS EN OFERTA (Peso: 20)
                const saleOptions: GetProductsOptions = {
                    on_sale: true,
                    per_page: candidateFetchLimit,
                    exclude: excludeBaseIds,
                };
                fetchPromises.push(
                    getProducts(saleOptions).then(result => {
                        console.log(`[useRecommendedProducts] En oferta encontrados: ${result.products.length}`);
                        processCandidates(result.products, 20);
                    }).catch(e => console.error("Error fetching sale products:", e))
                );
                
                // 4. PRODUCTOS CON ETIQUETAS SIMILARES (Peso: 10)
                if (currentProduct.tags && currentProduct.tags.length > 0) {
                    const tagIds = currentProduct.tags.map((t: Tag) => t.id).join(','); // Tipar 't'
                    if (tagIds) {
                        const tagOptions: GetProductsOptions = {
                            tag: tagIds,
                            per_page: candidateFetchLimit,
                            exclude: excludeBaseIds,
                        };
                        fetchPromises.push(
                            getProducts(tagOptions).then(result => {
                                console.log(`[useRecommendedProducts] Por tags (${tagIds}) encontrados: ${result.products.length}`);
                                processCandidates(result.products, 10);
                            }).catch(e => console.error("Error fetching tag products:", e))
                        );
                    }
                }

                // Esperar a que todas las promesas de fetch se completen
                await Promise.all(fetchPromises);
                console.log("[useRecommendedProducts] Todas las fuentes de candidatos procesadas. Scores:", productScores);

                // --- PROCESAMIENTO FINAL DE CANDIDATOS ---
                const finalRecommendations: Product[] = [];
                const candidatesWithDetails = Array.from(productScores.entries())
                    .map(([productId, score]) => {
                        const productDetail = processedProductDetails.get(productId);
                        return productDetail ? { ...productDetail, score } : null;
                    })
                    .filter(p => p !== null) as (Product & { score: number })[]; // Asegurar que no hay nulos

                candidatesWithDetails.sort((a, b) => b.score - a.score);

                let addedCount = 0;
                for (const candidate of candidatesWithDetails) {
                    if (addedCount >= count) break;
                    if (candidate.images && candidate.images.length > 0) {
                        finalRecommendations.push(candidate);
                        addedCount++;
                    }
                }

                // FALLBACK: Si no hay suficientes recomendaciones ponderadas, rellenar con recientes o aleatorios
                if (finalRecommendations.length < count) {
                    console.log(`[useRecommendedProducts] Insuficientes ponderados (${finalRecommendations.length}/${count}). Buscando fallback...`);
                    const neededMore = count - finalRecommendations.length;
                    const excludeForFallback = [
                        currentProduct.id,
                        ...finalRecommendations.map(p => p.id)
                    ];
                    try {
                        const fallbackResult = await getProducts({
                            per_page: neededMore + 5, // Pedir algunos más por si no tienen imagen
                            exclude: excludeForFallback,
                            orderby: 'date', // o 'rand' si tu API lo soporta bien
                            order: 'desc',
                        });
                        const fallbackWithImages = fallbackResult.products.filter(p => p.images && p.images.length > 0);
                        finalRecommendations.push(...fallbackWithImages.slice(0, neededMore));
                    } catch (fallbackError) {
                        console.error("[useRecommendedProducts] Error en fetch de fallback:", fallbackError);
                    }
                }

                console.log(`[useRecommendedProducts] Recomendaciones finales (${finalRecommendations.length}):`, 
                    finalRecommendations.map(p => ({name: p.name, id: p.id, score: productScores.get(p.id) })) 
                );
                setRecommendedProducts(finalRecommendations);

            } catch (e: unknown) { // Cambiado a unknown
                console.error("[useRecommendedProducts] Error general en fetchAndProcess:", e);
                let errorMessage = "Error al obtener recomendaciones.";
                if (e instanceof Error) {
                    errorMessage = e.message;
                } else if (typeof e === 'string') {
                    errorMessage = e;
                }
                setError(errorMessage);
                setRecommendedProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAndProcess();
    }, [currentProduct, count]); // Dejamos currentProduct completo aquí. Si causa re-renders, optimizar.

    return { recommendedProducts, loading, error };
}