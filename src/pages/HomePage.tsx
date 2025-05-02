// src/pages/HomePage.tsx (o src/pages/HomePage.jsx)

// Importa el archivo CSS de la página de inicio (si lo tienes)
import './HomePage.css';

// Importa el componente del carrusel hero
import ImageCarousel from '../components/ImageCarrousel';

// *** Importa el componente ProductListSection ***
import ProductListSection from '../components/ProductListSection'; // <-- ¡Añade esta importación!


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
                  mediante <a href="https://wa.me/TU_NUMERO_WHATSAPP" target="_blank" rel="noopener noreferrer">Whatsapp</a>, <a href="mailto:TU_CORREO_ELECTRONICO">correo</a>, o en nuestra página de <a href="/contacto">contacto</a>.
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
            productsPerPage={6} // Prop opcional: Le dice que muestre 10 productos (o el valor por defecto si no la pones)
        />

         {/* ============================================================== */}
        {/* *** SECCIÓN 2: PRODUCTOS DESTACADOS *** */}
        {/* ============================================================== */}
        {/* Esta instancia muestra los productos que marcaste como "Destacados" en WooCommerce */}
        <ProductListSection
            title="Productos Destacados" // Un título claro para esta sección
            subtitle="Nuestras recomendaciones" // Un subtítulo para los destacados
            type="featured" // La prop CLAVE: le dice que cargue los productos "featured"
            productsPerPage={6} // Cuántos productos destacados mostrar
        />

        {/* ============================================================== */}
        {/* *** SECCIÓN 3: PRODUCTOS EN OFERTA *** */}
        {/*============================================================= */}
        {/* Esta instancia muestra los productos que configuraste con precio rebajado en WooCommerce */}
        <ProductListSection
            title="Productos en Oferta" // Un título claro para esta sección
            subtitle="¡Aprovecha nuestras promociones!" // Un subtítulo para las ofertas
            type="sale" // La prop CLAVE: le dice que cargue los productos "on sale"
            productsPerPage={6} // Cuántos productos en oferta mostrar
        />


        {/* Aquí irían otras secciones si las añades más adelante */}



       

    </div> // Cierre del div principal (si lo usas)
  );
}

export default HomePage; // Asegúrate de exportar el componente HomePage