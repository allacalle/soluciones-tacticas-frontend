// src/components/BrandCarousel.tsx

import  { useEffect, useState } from 'react'; // Importamos React, useEffect y useState

// *** Importamos la función getBrands desde WooApi.ts ***
import { getBrands } from '../api/wooApi'; // Asegúrate de la ruta correcta a tu WooApi.ts

// *** Importamos la interfaz Brand desde types.ts (como tú lo tienes configurado) ***
// Asegúrate de que la interfaz Brand en tu archivo src/types.ts coincide con la estructura esperada de la API
import { Brand } from '../types'; // *** Usaremos esta importación como prefieres ***
import { Link } from 'react-router-dom'; // Importa Link para enlazar a las páginas de productos por marca

// ======================================================================
// *** Importaciones de react-slick ***
// ======================================================================
// Importa el componente Slider
import Slider from 'react-slick';
// Importa los estilos base de Slick Carousel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Importa el archivo CSS local para este carrusel
import './css/BrandCarousel.css';


// Define las propiedades que recibirá el componente BrandCarousel
interface BrandCarouselProps {
    title?: string;
    brandsToShow?: number; // Cuántos logos de marcas mostrar a la vez
    autoPlayInterval?: number; // Intervalo de auto-play en ms
}

// Componente funcional para el carrusel de marcas usando react-slick y datos de API
function BrandCarousel({ title, brandsToShow = 5, autoPlayInterval = 3000 }: BrandCarouselProps) {

    // ======================================================================
    // *** Estado para los datos de las marcas y el estado de carga ***
    // ======================================================================
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    // ======================================================================
    // *** useEffect para cargar los datos de las marcas desde la API ***
    // ======================================================================
    useEffect(() => {
        console.log("[BrandCarousel] useEffect disparado para cargar marcas."); // Log de inicio del efecto
        const fetchBrands = async () => {
            try {
                setLoading(true); // Indicamos que la carga ha comenzado
                setError(null); // Limpiamos errores anteriores

                // Llama a la función getBrands de tu WooApi.ts
                // Pasamos 1 para la página y 50 para per_page como argumentos separados
                const result = await getBrands(1, 50); // *** Llamada a getBrands corregida ***


                // Filtramos las marcas que no tienen imagen
                const brandsWithImages = result.brands.filter(brand => brand.image && brand.image.src);


                 if (brandsWithImages.length === 0) {
                     setError("No se encontraron marcas con imágenes.");
                     console.log("[BrandCarousel] No se encontraron marcas con imágenes después de filtrar.");
                 } else {
                     setBrands(brandsWithImages); // Actualiza el estado
                     console.log(`[BrandCarousel] Marcas cargadas exitosamente (${brandsWithImages.length} con imagen).`);
                 }


            // ==============================================================
            /* *** Manejo de errores (usando tu estilo con instanceof Error) *** */
            // ==============================================================
            } catch (caughtError: unknown) { // *** El catch correcto empieza aquí ***
                 console.error("[BrandCarousel] Error al cargar marcas:", caughtError);
                 if (caughtError instanceof Error) {
                      setError(caughtError.message); // Si es un Error, usa su mensaje
                 } else {
                      setError("Error al cargar las marcas."); // Si no es un Error conocido, usa mensaje genérico
                 }
            } finally {
                setLoading(false); // La carga termina siempre
                 console.log("[BrandCarousel] Carga de marcas finalizada."); // Log de finalización del efecto
            }
        };

        fetchBrands(); // Ejecuta la función de carga al montar el componente

        // Dependencias vacías: este efecto se ejecuta solo una vez al montar
    }, []);


    // ======================================================================
    // *** Configuración de react-slick (Props del componente <Slider>) ***
    // ======================================================================
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: brandsToShow,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: autoPlayInterval,
        pauseOnHover: true,
        arrows: false,

        // Consideración si brandsToShow es mayor que el número de marcas total
        // Si el número total de marcas es bajo, podrías ajustar slidesToShow o las settings responsive
        // o no mostrar el carrusel si brands.length es muy pequeño (nuestro renderizado ya lo maneja)
    };


    // ======================================================================
    // --- Renderizado (Manejo de estados: Cargando, Error, Carrusel) ---
    // ======================================================================
    return ( // *** Abre paréntesis para el return ***
        // Contenedor principal de la sección de marcas
        <section className="brand-carousel-section"> {/* Clase para estilos de sección */}

             {/* Título de la sección */}
             <div className="brand-section-title-container"> {/* *** Nuevo div contenedor *** */}
                 <h2>{title}</h2> {/* El h2 va dentro */}
             </div>


            {/* ============================================================== */}
            {/* ============================================================== */}
            {loading && <p style={{ textAlign: 'center' }}>Cargando marcas...</p>} {/* Muestra mensaje de carga */}
            {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>} {/* Muestra mensaje de error */}

            {/* ============================================================== */}
            {/* Condición para renderizar el Slider: Hay marcas, no está cargando y no hay error */}
            {brands.length > 0 && !loading && !error ? (
                // *** Abre paréntesis para el retorno implícito del map ***
                <Slider {...settings}>
                    {/* Mapea sobre la lista de marcas obtenida de la API */}
                    {brands.map((brand) => ( 
                         <div key={brand.id} className="brand-slide">
                        <Link to={`/marca/${brand.slug}`} className="brand-slide-link"> {/* A\u00F1ade una clase para estilizar el enlace si es necesario */}
                             {brand.image?.src ? ( 
                                 <img
                                     src={brand.image.src} 
                                     alt={brand.name}     
                                     className="brand-logo" 
                                 />
                             ) : (
                                 <p>{brand.name}</p>
                             )}
                        </Link> {/* <<< Cierra el Link >>> */}
                         </div> // Cierre del div brand-slide
                    ))} 
                 </Slider> // Cierre del componente Slider
             ) : (
                 // Muestra un mensaje si no hay marcas después de la carga/error
                 // Condición: No está cargando, no hay error Y el array de marcas está vacío
                 !loading && !error && brands.length === 0 && <p style={{ textAlign: 'center' }}>No hay marcas disponibles.</p>
             )}

         </section> 
     ); 
 } 

export default BrandCarousel; // Exporta el componente