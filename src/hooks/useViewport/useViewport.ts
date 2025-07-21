// src/hooks/useViewport.ts
import { useState, useEffect } from 'react';

// Define el breakpoint aquí para mantenerlo consistente
const MOBILE_BREAKPOINT = 768;

// Función auxiliar para obtener el estado actual de la ventana.
// La comprobación 'typeof window' la hace segura en caso de renderizado en servidor (SSR).
const getIsMobile = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    return window.innerWidth < MOBILE_BREAKPOINT;
};

/**
 * Un hook de React que detecta si el ancho del viewport es de móvil.
 * Se actualiza automáticamente cuando se cambia el tamaño de la ventana.
 */
export function useViewport() {
  // Inicializamos el estado llamando a la función una vez.
  // Esto establece el valor correcto desde el PRIMER renderizado en el cliente.
  const [isMobileView, setIsMobileView] = useState(getIsMobile());

  useEffect(() => {
    // Función que se ejecutará cuando la ventana cambie de tamaño
    const handleResize = () => {
      setIsMobileView(getIsMobile());
    };

    // Añadimos el listener para el evento 'resize'
    window.addEventListener('resize', handleResize);

    // Limpiamos el listener cuando el componente se desmonte para evitar fugas de memoria
    return () => window.removeEventListener('resize', handleResize);
  }, []); // El array de dependencias vacío asegura que el efecto solo se ejecute al montar y desmontar

  return { isMobileView };
}