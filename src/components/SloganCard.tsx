// src/components/SloganCard.tsx

//import React from 'react';
// Si usas iconos de alguna librería, los importarías aquí
// Por ahora, usaremos un placeholder
import './css/SloganCard.css'


// Define las propiedades que recibirá una tarjeta de eslogan individual
interface SloganCardProps {
    icon: string; // Podría ser una URL a la imagen del icono, o una clase CSS, o un nombre
    title: string; // El título de la tarjeta (ej: "Variedad de Productos")
    slogan: string; // El texto/eslogan debajo del título
}

// Define el componente funcional para una tarjeta de eslogan
function SloganCard({ icon, title, slogan }: SloganCardProps) {
    return (
        // Contenedor principal de la tarjeta individual
        <div className="slogan-card" > {/* Estilos temporales */}
            {/* Área del Icono */}
            <div className="slogan-card-icon" > {/* Estilos temporales */}
                {/* Por ahora, un simple carácter o podrías usar un <img> */}
                {icon} {/* Renderiza el 'icono' (la prop) */}
            </div>

            {/* Título de la tarjeta */}
            <h3 className="slogan-card-title" > {/* Estilos temporales */}
                {title} {/* Renderiza el título */}
            </h3>

            {/* Texto del eslogan */}
            <p className="slogan-card-slogan" > {/* Estilos temporales */}
                {slogan} {/* Renderiza el eslogan */}
            </p>
        </div>
    );
}

export default SloganCard; // Exporta el componente