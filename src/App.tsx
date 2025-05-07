// src/App.tsx
//import React from 'react'; // Solo necesitamos React aquí por ahora

// *** Importa los componentes de React Router DOM ***
import { Routes, Route } from 'react-router-dom';


import HomePage from './pages/HomePage'; // <-- Asegúrate que la ruta sea correcta
import ProductListPage from './pages/ProductListPage'; // <-- Asegúrate que la ruta sea correcta
import Header from './components/Header'; // <-- Asegúrate que la ruta sea correcta
import ProductPage from './pages/ProductPage';
import Footer from './components/Footer';


// Define una interfaz para tipar los datos de producto que esperamos de la API de WooCommerce
// Esta interfaz se queda aquí en App.tsx (o puedes moverla a un archivo compartido si la usas en varios sitios)


function App() {
  return (
    <div>
      {/* *** Usa el componente Header aquí en lugar de la etiqueta <header> *** */}
      <Header /> {/* <-- Aquí va tu nuevo componente Header */}

      {/* Área principal donde React Router renderiza el contenido de la página actual */}
      <main style={{ padding: '20px' }}>
        <Routes>
          {/* Rutas definidas */}
          <Route path="/" element={<HomePage />} />
          {/* Mantén las rutas de productos y detalle */}
          <Route path="/producto/:productSlug" element={<ProductPage />} />
          <Route path="/productos/:categorySlug" element={<ProductListPage />} />
          {/* *** Opcional: Si tienes una página de Contacto, define su ruta aquí *** */}
          {/* <Route path="/contacto" element={<ContactPage />} /> */}
          {/* Ruta 404 */}
          <Route path="*" element={<div>Página No Encontrada (404)</div>} />
        </Routes>
      </main>

      {/* Pie de página (persistente en todas las rutas) */}
      <Footer /> {/* <-- Aquí va tu nuevo componente Footer */}
    </div>
  );
}

export default App;