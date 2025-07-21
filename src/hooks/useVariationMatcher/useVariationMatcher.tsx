// src/hooks/useVariationMatcher.ts
import { useState, useEffect } from 'react';
import { Product, Variation, VariationAttribute } from '../../types'; // Ajusta la ruta si es necesario

interface UseVariationMatcherProps {
    product: Product | null;
    variationsData: Variation[];
    selectedAttributes: { [key: string]: string | null };
    initialProductImage?: string; // Imagen del producto padre para fallback
}

interface UseVariationMatcherReturn {
    matchingPrice?: string;
    matchingImage?: string;
    isMatched: boolean;
    matchedVariation: Variation | null;
}

export function useVariationMatcher({
    product,
    variationsData,
    selectedAttributes,
    initialProductImage 
}: UseVariationMatcherProps): UseVariationMatcherReturn {
    const [matchingPrice, setMatchingPrice] = useState<string | undefined>(undefined);
    const [matchingImage, setMatchingImage] = useState<string | undefined>(initialProductImage);
    const [isMatched, setIsMatched] = useState(false);
    const [matchedVariation, setMatchedVariation] = useState<Variation | null>(null);

    useEffect(() => {
        console.log("[useVariationMatcher] Hook disparado.");
        console.log("[useVariationMatcher] Product:", product);
        console.log("[useVariationMatcher] VariationsData:", variationsData);
        console.log("[useVariationMatcher] SelectedAttributes:", selectedAttributes);

        if (!product) {
            // Si no hay producto, reseteamos todo.
            setMatchingPrice(undefined);
            setMatchingImage(initialProductImage); // O undefined si no se pasa
            setIsMatched(false);
            setMatchedVariation(null);
            return;
        }

        // Si es un producto simple, usamos sus propios datos.
        if (product.type === 'simple') {
            setMatchingPrice(product.price);
            setMatchingImage(product.images?.[0]?.src || initialProductImage);
            setIsMatched(false); // No es una "variación" seleccionada
            setMatchedVariation(null);
            console.log("[useVariationMatcher] Producto simple. Usando datos del padre.");
            return;
        }

        // Si es producto variable:
        if (product.type === 'variable') {
            // Verificar si todos los atributos requeridos para variaciones están seleccionados
            const allRequiredAttributesSelected = product.attributes?.every(attr =>
                !attr.variation || (selectedAttributes[attr.name] !== null && selectedAttributes[attr.name] !== undefined)
            );

            console.log("[useVariationMatcher] allRequiredAttributesSelected:", allRequiredAttributesSelected);

            if (variationsData.length > 0 && allRequiredAttributesSelected) {
                console.log("[useVariationMatcher] Intentando encontrar variaci\u00F3n coincidente.");
                const foundVariation = variationsData.find((variation: Variation) => {
                    return variation.attributes.every((varAttr: VariationAttribute) => {
                        return selectedAttributes[varAttr.name]?.toLowerCase() === varAttr.option.toLowerCase();
                    });
                });

                if (foundVariation) {
                    console.log(`[useVariationMatcher] Variaci\u00F3n coincidente encontrada (ID: ${foundVariation.id}).`);
                    setMatchingPrice(foundVariation.price);
                    setMatchingImage(foundVariation.image?.src || product.images?.[0]?.src || initialProductImage);
                    setIsMatched(true);
                    setMatchedVariation(foundVariation);
                } else {
                    // Todos los atributos seleccionados, pero no hay combinación (inválida)
                    console.warn("[useVariationMatcher] No se encontr\u00F3 variaci\u00F3n para la selecci\u00F3n actual (combinación inválida).");
                    setMatchingPrice(undefined); // O product.price si prefieres mostrar el precio base/rango
                    setMatchingImage(product.images?.[0]?.src || initialProductImage);
                    setIsMatched(false);
                    setMatchedVariation(null);
                }
            } else {
                // Selección incompleta para producto variable
                console.log("[useVariationMatcher] Selección de atributos incompleta para producto variable.");
                setMatchingPrice(undefined); // O product.price
                setMatchingImage(product.images?.[0]?.src || initialProductImage);
                setIsMatched(false);
                setMatchedVariation(null);
            }
        }

    }, [product, variationsData, selectedAttributes, initialProductImage]);

    return { matchingPrice, matchingImage, isMatched, matchedVariation };
}