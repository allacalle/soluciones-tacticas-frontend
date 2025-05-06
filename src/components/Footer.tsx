// src/components/Footer.tsx


import './css/Footer.css'; // Importa los estilos para el footer
import logoPlaceholder from '../assets/logo/footer-logo.bmp'; // *** Reemplaza con la ruta real a tu logo ***

// Define la interfaz para las propiedades del componente (si necesitaras alguna)
//interface FooterProps {
    // Por ahora no necesitamos ninguna prop específica, pero aquí irían si las hubiera


// Componente funcional para el pie de página (Footer)
function Footer() {

    // Obtener el año actual para el copyright
    const currentYear = new Date().getFullYear();
    const storeName = "Soluciones Tácticas"; // *** Reemplaza con el nombre real de tu tienda ***


    return (
        // Utilizamos la etiqueta semántica <footer> para el pie de página
        <footer className="site-footer">

            {/* Contenedor interno para limitar el ancho y centrar el contenido del footer */}
            <div className="footer-content">

                {/* ============================================================== */}
                {/* ============================================================== */}
                <div className="footer-main">

                    {/* Columna 1: Logo e Información de la tienda */}
                    <div className="footer-brand-info">
                        {/* Logo enlazado a la página de inicio */}
                        <a href="/" className="footer-logo-link">
                            <img src={logoPlaceholder} alt={`${storeName} Logo`} className="footer-logo"/> {/* *** Asegúrate de la ruta del logo *** */}
                        </a>
                        {/* Breve descripción o lema (opcional) */}
                        <p className="footer-description">
                            Tu tienda online de confianza para equipamiento táctico y outdoor de alta calidad.
                        </p>
                    </div>

                    {/* Columna 2: Enlaces de Tienda */}
                    <div className="footer-links-col">
                        <h3>Tienda</h3>
                        <ul>
                            <li><a href="/productos">Todos los Productos</a></li>
                            <li><a href="/productos/categorias">Categorías</a></li>
                            <li><a href="/productos/marcas">Marcas</a></li> {/* Enlaza a la página de marcas si la creas */}
                            <li><a href="/ofertas">Ofertas</a></li>
                        </ul>
                    </div>

                    {/* Columna 3: Enlaces de Empresa */}
                    <div className="footer-links-col">
                        <h3>Empresa</h3>
                        <ul>
                            <li><a href="/quienes-somos">Quiénes Somos</a></li>
                            <li><a href="/contacto">Contacto</a></li>
                            <li><a href="/blog">Blog</a></li> {/* Si tienes blog */}
                            <li><a href="/faqs">FAQs</a></li> {/* Si tienes página de preguntas frecuentes */}
                        </ul>
                    </div>

                    {/* Columna 4: Enlaces de Soporte y Legal */}
                    <div className="footer-links-col">
                        <h3>Soporte</h3>
                        <ul>
                            <li><a href="/envios-devoluciones">Envíos y Devoluciones</a></li>
                            <li><a href="/metodos-pago">Métodos de Pago</a></li>
                            <li><a href="/garantias">Garantías</a></li>
                        </ul>
                        <h3>Legal</h3> {/* Sub-título dentro de la columna */}
                        <ul>
                            <li><a href="/politica-privacidad">Política de Privacidad</a></li>
                            <li><a href="/terminos-condiciones">Términos y Condiciones</a></li>
                            <li><a href="/politica-cookies">Política de Cookies</a></li>
                        </ul>
                    </div>

                     {/* Columna 5: Información de Contacto */}
                     <div className="footer-contact">
                         <h3>Contacto</h3>
                         <p>
                             [Tu Dirección Física Completa]<br/>
                             [Tu Ciudad, Código Postal]<br/>
                             [Tu País]
                         </p>
                         <p>Teléfono: [Tu Número de Teléfono]</p>
                         <p>Email: <a href="mailto:[tu@email.com]">[tu@email.com]</a></p>
                     </div>

                    {/* Columna 6: Redes Sociales (Opcional, podría estar en una columna propia o al final) */}
                    {/* Lo ponemos aquí por ahora, estilaremos los iconos con CSS */}
                    <div className="footer-social">
                         <h3>Síguenos</h3>
                         <div className="social-icons">
                             {/* *** Reemplaza # con las URLs de tus perfiles y añade/quita iconos *** */}
                             <a href="#" target="_blank" rel="noopener noreferrer">Facebook</a> {/* Icono de Facebook */}
                             <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a> {/* Icono de Instagram */}
                             <a href="#" target="_blank" rel="noopener noreferrer">Twitter</a> {/* Icono de Twitter */}
                             {/* Puedes añadir más: LinkedIn, YouTube, etc. */}
                         </div>
                     </div>


                    {/* Puedes añadir otra columna para Métodos de Pago / Envío si quieres iconos */}
                    {/*
                     <div className="footer-payment-shipping">
                         <h3>Pagos y Envío</h3>
                         <div className="payment-shipping-icons">
                             <img src="/ruta/icono-visa.png" alt="Visa"/>
                             <img src="/ruta/icono-mastercard.png" alt="Mastercard"/>
                             // ... etc.
                         </div>
                     </div>
                    */}


                </div> {/* Cierre de footer-main */}

                {/* ============================================================== */}
                {/* ============================================================== */}
                <div className="footer-bottom">
                    {/* Aviso de Copyright con año dinámico */}
                    <p>© {currentYear} {storeName}. Todos los derechos reservados.</p>
                    {/* Puedes añadir aquí enlaces legales rápidos de nuevo si quieres */}
                    {/* <a href="/politica-privacidad">Privacidad</a> | <a href="/terminos-condiciones">Términos</a> */}
                </div> {/* Cierre de footer-bottom */}


            </div> {/* Cierre de footer-content */}

        </footer> // Cierre de la etiqueta <footer>
    );
}

export default Footer; // Exporta el componente