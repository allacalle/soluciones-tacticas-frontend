// src/components/ReviewCard.tsx

// Importa un archivo CSS para esta tarjeta (lo crearemos pronto)
// import './ReviewCard.css';

// Define las propiedades que recibirá una tarjeta de reseña individual
interface ReviewCardProps {
    name: string; // Nombre del cliente
    text: string; // Texto de la reseña
    // rating?: number; // Opcional: si añades rating a tu JSON en el futuro
}

// Define el componente funcional para una tarjeta de reseña
function ReviewCard({ name, text /*, rating */ }: ReviewCardProps) {
    return (
        // Contenedor principal de la tarjeta de reseña
        <div className="review-card" style={{ border: '1px solid #ccc', padding: '20px', margin: '10px', borderRadius: '8px', backgroundColor: '#fff', width: '45%', flexShrink: 0 }}> {/* Estilos temporales */}
            {/* Aquí podrías poner un icono de comillas o estrellas si tuvieras rating */}
            {/* <div className="review-rating">{'⭐'.repeat(rating || 5)}</div> */} {/* Ejemplo visual de rating */}
            {/* <div className="review-icon">❝</div>  Ejemplo visual de comillas */}

            {/* Texto de la reseña */}
            <p className="review-text" style={{ fontSize: '1em', fontStyle: 'italic', marginBottom: '15px', color: '#555' }}> {/* Estilos temporales */}
                "{text}" {/* Muestra el texto de la reseña entre comillas */}
            </p>

            {/* Nombre del cliente */}
            <p className="reviewer-name" style={{ fontSize: '0.9em', fontWeight: 'bold', textAlign: 'right', color: '#333' }}> {/* Estilos temporales */}
                - {name} {/* Muestra el nombre del cliente */}
            </p>
        </div>
    );
}

export default ReviewCard; // Exporta el componente