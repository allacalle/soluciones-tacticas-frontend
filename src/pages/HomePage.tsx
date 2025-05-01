// src/pages/HomePage.tsx (o src/pages/HomePage.jsx)
//import React from 'react';

function HomePage() {
  return (
    // Este div contendrá la sección hero
    // Le daremos estilos (como la imagen de fondo) después
    <div className="home-hero-section">
      {/* Este div es el recuadro de texto que va encima de la imagen */}
      <div className="hero-text-box">
        {/* El texto de bienvenida y contacto */}
        <p>
          Somos una tienda en Córdoba dedicada a material policial, militar y de aventura. Esta tienda es el escaparate
          para todos nuestros clientes. Si estás interesado en nuestros productos, ponte en contacto con nosotros
          mediante <a href="https://wa.me/TU_NUMERO_WHATSAPP" target="_blank" rel="noopener noreferrer">Whatsapp</a>, <a href="mailto:TU_CORREO_ELECTRONICO">correo</a>, o en nuestra página de <a href="/contacto">contacto</a>.
        </p>
        {/* Aquí podrías añadir un botón "Explora Productos" */}
      </div>
      {/* La imagen de fondo se aplicará mediante CSS al div 'home-hero-section' */}
    </div>
  );
}

export default HomePage;