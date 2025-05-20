// src/components/BrandInfoHeader.tsx
import React from 'react';
import { Brand } from '../types'; // Asegúrate que la ruta a types.ts sea correcta
// Considera crear un CSS para este componente si necesita estilos propios
// import './css/BrandInfoHeader.css'; 

interface BrandInfoHeaderProps {
    brand: Brand; // Asumimos que brand no es null cuando se llama a este componente
}

const BrandInfoHeader: React.FC<BrandInfoHeaderProps> = ({ brand }) => {
    return (
        <div className="brand-info-header"> {/* Clase para estilizar este bloque */}
            {brand.image ? (
                <img 
                    src={brand.image.src} 
                    alt={brand.image.alt || `Logo de ${brand.name}`} 
                    className="brand-info-image" // Clase para la imagen
                />
            ) : (
                // Placeholder si no hay imagen de marca
                <div className="no-brand-info-image-placeholder"> 
                    {brand.name.charAt(0).toUpperCase()}
                </div>
            )}
            <h2>{brand.name}</h2> {/* Título de la marca */}
            {brand.description && (
                <div 
                    className="brand-info-description" // Clase para la descripción
                    dangerouslySetInnerHTML={{ __html: brand.description }} 
                />
            )}
        </div>
    );
};

export default BrandInfoHeader;