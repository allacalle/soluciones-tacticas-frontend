// src/components/ReviewCarousel.tsx - ARCHIVO COMPLETO Y CORREGIDO

import  { useState, useEffect } from 'react';
import ReviewCard from './ReviewCard';

// *** Importa la interfaz ReviewData desde types.ts ***
// Asegúrate de que esta interfaz está correctamente definida y exportada en types.ts
import { ReviewData } from '../types'; // <-- ¡Verifica la ruta!

// *** Importa los datos de las reseñas desde tu archivo JSON ***
// Usamos 'as ReviewData[]' para decirle explícitamente a TypeScript
// que este JSON se importa como un array de objetos ReviewData.
import reviewsData from '../data/reviews.json'; // <-- ¡Verifica la ruta!


// Importa un archivo CSS para este componente (lo crearemos pronto)
// import './ReviewCarousel.css';


// Define las propiedades que recibirá el componente del carrusel (si las necesita)
interface ReviewCarouselProps {
    // Quizás un título para la sección de reseñas
    title?: string;
    // Cuántas reseñas mostrar a la vez (ej: 2 como en la imagen)
    reviewsToShow?: number;
    // Puedes añadir una prop para hacer que las reseñas sean aleatorias en cada carga
    // randomize?: boolean;
}

// Define el componente funcional para el carrusel de reseñas
// Definimos un valor por defecto de 2 para reviewsToShow
function ReviewCarousel({ title, reviewsToShow = 2 }: ReviewCarouselProps) {

    // Aquí usamos los datos importados directamente
    const allReviews: ReviewData[] = reviewsData; // Explicitamos el tipo aunque ya lo hicimos en la importación

    // Estado para controlar qué reseñas son visibles actualmente
    // Inicializamos el estado con un array de ReviewData
    const [visibleReviews, setVisibleReviews] = useState<ReviewData[]>(allReviews.slice(0, reviewsToShow));

    // Estado para seguir el índice de la primera reseña visible (para la navegación)
    const [currentIndex, setCurrentIndex] = useState(0); // Empieza en la primera reseña

    // Efecto para actualizar las reseñas visibles cuando cambian las props o el índice actual
    useEffect(() => {
        // Calculamos las reseñas a mostrar basadas en el índice actual y cuántas queremos mostrar
        const startIndex = currentIndex;
        const endIndex = startIndex + reviewsToShow;

        // Manejar el 'loop' del carrusel: si llegamos al final, volvemos al principio
        // Una implementación simple de looping:
        let reviewsToDisplay = [];
        if (endIndex <= allReviews.length) {
             reviewsToDisplay = allReviews.slice(startIndex, endIndex);
        } else {
             // Si el final excede el total, tomamos del final y el resto del principio
             reviewsToDisplay = allReviews.slice(startIndex).concat(allReviews.slice(0, endIndex - allReviews.length));
        }

        setVisibleReviews(reviewsToDisplay); // Actualiza el estado con las nuevas reseñas visibles

        // Dependencias del useEffect: re-ejecutar si cambian allReviews (aunque reviewsData es constante),
        // currentIndex o reviewsToShow.
    }, [currentIndex, reviewsToShow, allReviews /* allReviews es constante, puedes quitarlo si quieres */]);


    // --- Lógica de navegación ---
    const handleNext = () => {
        // Calcula el índice del inicio del siguiente conjunto de reseñas
        const nextIndex = (currentIndex + reviewsToShow) % allReviews.length; // Usa el operador módulo para el loop
        setCurrentIndex(nextIndex); // Actualiza el estado del índice
         console.log("Siguiente reseña. Nuevo índice:", nextIndex); // Mensaje de depuración
    };

    const handlePrevious = () => {
        // Calcula el índice del inicio del conjunto anterior de reseñas
        // Hay que manejar el caso de retroceder desde el principio
        const previousIndex = (currentIndex - reviewsToShow + allReviews.length) % allReviews.length;
        setCurrentIndex(previousIndex); // Actualiza el estado del índice
        console.log("Reseña anterior. Nuevo índice:", previousIndex); // Mensaje de depuración
    };


    // Renderizado
    return (
        // Contenedor principal de la sección de reseñas
        // Usa la clase CSS (asegúrate de importar ReviewCarousel.css cuando lo crees)
        <section className="review-carousel-section" style={{ margin: '40px 0', padding: '20px', backgroundColor: '#f0f0f0', textAlign: 'center' }}> {/* Estilos temporales */}
            {/* Título de la sección si lo pasas como prop */}
            {title && <h2 style={{ marginBottom: '30px' }}>{title}</h2>}

            {/* Contenedor de las tarjetas de reseña visibles */}
            {/* Este será el área que mostrará las reseñas y tendrá el movimiento */}
            {/* Usa la clase CSS (ReviewCarousel.css) */}
            <div className="review-cards-display" style={{ display: 'flex', overflow: 'hidden', justifyContent: 'center', gap: '20px' }}> {/* Estilos temporales */}
                {/* Renderiza las tarjetas de reseña actualmente visibles */}
                {visibleReviews.map((review) => ( // Ya no necesitamos 'index' aquí a menos que lo usemos para algo visual
                    <ReviewCard
                        key={review.id} // Usa el ID de la reseña como key (es mejor que el índice)
                        name={review.name}
                        text={review.text}
                        // rating={review.rating} // Pasa el rating si lo incluyes en tu JSON y en la interfaz ReviewData
                    />
                ))}
            </div>

            {/* Controles de navegación (flechas y puntos) */}
             {/* Usa la clase CSS (ReviewCarousel.css) */}
            <div className="review-carousel-controls" style={{ marginTop: '20px' }}> {/* Estilos temporales */}
                <button onClick={handlePrevious} style={{ margin: '0 10px' }}>← Anterior</button> {/* Flecha izquierda */}
                {/* Aquí irían los indicadores de puntos (implementación futura) */}
                <button onClick={handleNext} style={{ margin: '0 10px' }}>Siguiente →</button> {/* Flecha derecha */}
            </div>
        </section>
    );
}

export default ReviewCarousel;