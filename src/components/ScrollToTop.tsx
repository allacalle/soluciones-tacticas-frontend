// src/components/ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation(); // Obtiene la ruta actual

  useEffect(() => {
    window.scrollTo(0, 0); // Hace scroll al inicio de la página (coordenadas 0,0)
  }, [pathname]); // Este efecto se ejecuta cada vez que 'pathname' (la ruta) cambia

  return null; // Este componente no renderiza nada visualmente
}

export default ScrollToTop;