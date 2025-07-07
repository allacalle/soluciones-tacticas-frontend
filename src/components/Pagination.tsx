// src/components/Pagination.tsx
import React from 'react';
import './css/Pagination.css'; // 1. Importamos su propio archivo de estilos

// 2. Definimos las "props" que este componente necesita para funcionar.
//    Esto es como un "contrato": cualquiera que use este componente
//    debe proporcionarle esta información.
interface PaginationProps {
  currentPage: number;  // El número de la página actual
  totalPages: number;   // El número total de páginas disponibles
  onNextPage: () => void; // Una función que se llamará al hacer clic en "Siguiente"
  onPrevPage: () => void; // Una función que se llamará al hacer clic en "Anterior"
}

// 3. Creamos el componente funcional
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
}) => {
  // 4. Lógica para no mostrar nada si no es necesario.
  //    Si solo hay una página o menos, la paginación no tiene sentido.
  if (totalPages <= 1) {
    return null;
  }

  // 5. La estructura JSX que se va a renderizar.
  //    Es un contenedor principal con dos botones y un párrafo en medio.
  return (
    <div className="pagination-controls">
      <button
        onClick={onPrevPage}
        disabled={currentPage === 1} // El botón "Anterior" se deshabilita si estamos en la primera página
        className="pagination-button"
      >
        Página Anterior
      </button>

      <p className="pagination-current-page">
        Página {currentPage} de {totalPages}
      </p>

      <button
        onClick={onNextPage}
        disabled={currentPage === totalPages} // El botón "Siguiente" se deshabilita si estamos en la última página
        className="pagination-button"
      >
        Página Siguiente
      </button>
    </div>
  );
};

// 6. Exportamos el componente para poder usarlo en otras partes de la aplicación
export default Pagination;