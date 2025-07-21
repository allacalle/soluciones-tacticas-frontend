// src/pages/HomePage.tsx (o src/pages/HomePage.jsx)

// Importa el archivo CSS de la página de inicio (si lo tienes)
import './HomePage.css';

// Importa el componente del carrusel hero
import ImageCarousel from '../../components/ImageCarrousel/ImageCarrousel';

// *** Importa el componente ProductListSection ***
import { Link } from 'react-router-dom';
import ProductListSection from '../../components/ProductListSection/ProductListSection';
import SloganSection from '../../components/SloganSection/SloganSection'; 
import ReviewCarousel from '../../components/ReviewCarousel/ReviewCarousel'; 
import BrandCarousel from '../../components/BrandCarousel/BrandCarousel'; // *** Importa el componente ***




function HomePage() {
  return (
    // Este div principal puede ser útil para estructurar la página
    <div>
        {/* Sección Hero (Carrusel con texto) */}
        <div className="home-hero-section"> {/* Asegúrate de que este div existe con esa clase */}
            <ImageCarousel /> {/* El componente del carrusel */}
            <div className="hero-text-box"> {/* Asegúrate de que este div existe con esa clase */}
                {/* El texto de bienvenida y contacto */}
                <p>
                  Somos una tienda en Córdoba dedicada a material policial, militar y de aventura. Esta tienda es el escaparate
                  para todos nuestros clientes. Si estás interesado en nuestros productos, ponte en contacto con nosotros
                  mediante <a href="https://wa.me/34605363660" target="_blank" rel="noopener noreferrer">Whatsapp</a>, <a href="mailto:stmaterialpolicial@gmail.com">correo</a>, o en nuestra página de <Link to="/contacto">contacto</Link>.
                </p>
            </div>
        </div> {/* Fin de la sección Hero */}

        {/* ============================================================== */}
        {/* *** SECCIÓN DE ÚLTIMOS PRODUCTOS (Usando ProductListSection) *** */}
        {/* ============================================================== */}
        {/* Colocamos una instancia de la Estantería Inteligente aquí. */}
        {/* Le pasamos las props para decirle qué título, subtítulo y qué tipo de productos cargar. */}
        <ProductListSection
            title="Últimos Productos" // Prop para el título
            subtitle="Lo Último en Tecnología Táctica y Equipamiento Militar" // Prop para el subtítulo
            type="latest" // Prop CLAVE: Le dice que cargue los productos 'latest' (los últimos por fecha)
        />


        {/* ============================================================== */}
        {/* *** AÑADIMOS LA SECCIÓN DE ESLÓGANES/TARJETAS AQUÍ *** */}
        {/* ============================================================== */}
        {/* Colocamos el componente contenedor de las tarjetas de eslogan */}
        {/* *** ¡Asegúrate de que esta línea está aquí! *** */}
        <SloganSection />

         {/* ============================================================== */}
        {/* *** SECCIÓN 2: PRODUCTOS DESTACADOS *** */}
        {/* ============================================================== */}
        {/* Esta instancia muestra los productos que marcaste como "Destacados" en WooCommerce */}
        <ProductListSection
            title="Productos Destacados" // Un título claro para esta sección
            subtitle="Nuestras recomendaciones" // Un subtítulo para los destacados
            type="featured" // La prop CLAVE: le dice que cargue los productos "featured"
        />

      <ReviewCarousel
            title="Lo que dicen nuestros clientes" // Opcional: Puedes pasar un título
            reviewsToShow={3} // Opcional: Cuántas reseñas mostrar a la vez (2 es común)
        />

        {/* ============================================================== */}
        {/* *** SECCIÓN 3: PRODUCTOS EN OFERTA *** */}
        {/*============================================================= */}
        {/* Esta instancia muestra los productos que configuraste con precio rebajado en WooCommerce */}
        <ProductListSection
            title="Productos en Oferta" // Un título claro para esta sección
            subtitle="¡Aprovecha nuestras promociones!" // Un subtítulo para las ofertas
            type="sale" // La prop CLAVE: le dice que cargue los productos "on sale"
        />


        {/* Aquí irían otras secciones si las añades más adelante */}
        <BrandCarousel
                 title="Nuestras Marcas Destacadas" // Puedes ponerle un título a la sección
                 brandsToShow={4} // Número de logos a mostrar a la vez (ajusta este número)
                 autoPlayInterval={4000} // Intervalo de rotación en ms (ajusta este tiempo)
        />

      

       

    </div> // Cierre del div principal (si lo usas)
  );
}

export default HomePage; // Asegúrate de exportar el componente HomePage