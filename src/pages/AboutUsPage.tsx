import React from 'react';
import './css/AboutUsPage.css'; // Asegúrate de que la ruta al CSS sea correcta

// Opcional: Si tienes un logo de la tienda o una imagen genérica que quieras usar
// import storeImage from '../assets/store-front.jpg'; // Ejemplo

const AboutUsPage: React.FC = () => {
  const storeName = "Soluciones Tácticas"; // Puedes cambiar esto si tienen un nombre más completo
  const address = "Sta. María de Trassierra n41 local 2, Córdoba, Spain, 14011";
  const phoneNumber = "605 36 36 60";
  const email = "stmaterialpolicial@gmail.com";

  return (
    <div className="page-container about-us-page-container">
      <header className="about-us-header">
        <h1>Sobre {storeName}</h1>
        {/* 
          Podrías añadir una imagen representativa de la tienda aquí si tienes una
          <img src={storeImage} alt={`Fachada de ${storeName}`} className="store-header-image" /> 
        */}
      </header>

      <section className="about-us-section what-we-do">
        <h2>Tu Tienda Especializada</h2>
        <p>
          En <strong>{storeName}</strong>, somos tu punto de referencia en Córdoba para material de alta calidad en las siguientes áreas:
        </p>
        <ul>
          <li>Material Policial</li>
          <li>Equipamiento Outdoor</li>
          <li>Artículos de Airsoft</li>
        </ul>
        <p>
          Nos esforzamos por ofrecer productos que cumplen con las exigencias de profesionales y aficionados,
          asegurando fiabilidad y rendimiento en cada artículo.
        </p>
      </section>

      <section className="about-us-section our-commitment">
        <h2>Nuestro Compromiso</h2>
        <p>
          Aunque la información de Facebook no detalla una misión o valores específicos,
          podemos inferir un compromiso con la provisión de equipamiento especializado.
          Si tienes un texto que quieras añadir aquí sobre la filosofía de la tienda,
          ¡sería perfecto!
        </p>
        <p>
          Ejemplo: "Nuestro objetivo es ser más que una tienda; aspiramos a ser un aliado para nuestros
          clientes, ofreciendo asesoramiento experto y productos en los que pueden confiar."
        </p>
      </section>

      <section className="about-us-section visit-us">
        <h2>Visítanos o Contáctanos</h2>
        <div className="contact-details-grid">
          <div className="contact-detail-item">
            <h3>Dirección</h3>
            <p>{address}</p>
            {/* Podrías integrar un mapa de Google aquí si quieres */}
            {/* <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className="map-link">
              Ver en Google Maps
            </a> */}
          </div>

          <div className="contact-detail-item">
            <h3>Teléfono</h3>
            <p><a href={`tel:${phoneNumber.replace(/\s/g, '')}`}>{phoneNumber}</a></p>
          </div>

          <div className="contact-detail-item">
            <h3>Correo Electrónico</h3>
            <p><a href={`mailto:${email}`}>{email}</a></p>
          </div>
        </div>
        <p className="opening-hours-note">
          Consulta nuestros horarios actualizados o contáctanos para más información.
          {/* Si tienes horarios específicos, los puedes listar aquí */}
        </p>
      </section>

      {/* Si en el futuro tienes más información (historia, equipo, etc.), puedes añadir más secciones */}
    </div>
  );
};

export default AboutUsPage;