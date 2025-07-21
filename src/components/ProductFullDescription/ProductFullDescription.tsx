// src/components/ProductFullDescription.tsx
import React from 'react';

interface ProductFullDescriptionProps {
    descriptionHtml: string | undefined | null; // Permitimos undefined o null
}

const ProductFullDescription: React.FC<ProductFullDescriptionProps> = ({ descriptionHtml }) => {
    // Si no hay descripción o es una cadena vacía, muestra un mensaje alternativo.
    // (Una cadena vacía también se considera "falsy" en una condición booleana)
    if (!descriptionHtml) { 
        return (
            <div className="product-full-description">
                <h3>Descripción </h3>
                <p>No hay descripción completa disponible para este producto.</p>
            </div>
        );
    }

    return (
        <div className="product-full-description">
            <h3>Descripción</h3>
            <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
        </div>
    );
};

export default ProductFullDescription;