// src/components/Footer.tsx


import './css/Footer.css'; // Importa los estilos para el footer
import logoPlaceholder from '../assets/logo/footer-logo.png'; // *** Reemplaza con la ruta real a tu logo si es diferente ***

// Importar Font Awesome para iconos
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Importar los iconos de marcas específicas que necesitas
import { faFacebook, faInstagram, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

// Define la interfaz para las propiedades del componente (si necesitaras alguna)
//interface FooterProps {
//	Por ahora no necesitamos ninguna prop específica, pero aquí irían si las hubiera
//}

// Componente funcional para el pie de página (Footer)
function Footer() {

	// Obtener el año actual para el copyright
	const currentYear = new Date().getFullYear();
	const storeName = "Soluciones Tácticas"; // Nombre oficial de la tienda


	return (
		// Utilizamos la etiqueta semántica <footer> para el pie de página
		<footer className="site-footer">

			{/* Contenedor interno para limitar el ancho y centrar el contenido del footer */}
			<div className="footer-content">

				{/* Contenedor principal de las columnas del footer */}
				<div className="footer-main">

					{/* Columna 1: Logo e Información de la tienda */}
					<div className="footer-brand-info">
						{/* Logo enlazado a la página de inicio */}
						<a href="/" className="footer-logo-link">
							<img src={logoPlaceholder} alt={`${storeName} Logo`} className="footer-logo"/> {/* *** Asegúrate de que la ruta del logo sea correcta *** */}
						</a>
						{/* Breve descripción o lema (opcional, puedes personalizar esto) */}
						<p className="footer-description">
							{storeName} - Tu tienda online y física de material policial, outdoor y airsoft en Córdoba.
						</p>
					</div>

					{/* Columna 2: Enlaces de Tienda */}
					<div className="footer-links-col">
						<h3>Tienda</h3>
						<ul>
							<li><a href="/productos">Todos los Productos</a></li>
							<li><a href="/categorias">Categorías</a></li>
							<li><a href="/marcas">Marcas</a></li> {/* Enlaza a la página de marcas si la creas */}
							<li><a href="/ofertas">Ofertas</a></li> 
						</ul>
					</div>

					{/* Columna 3: Enlaces de Empresa */}
					<div className="footer-links-col">
						<h3>Empresa</h3>
						<ul>
							<li><a href="/quienes-somos">Quiénes Somos</a></li>
							<li><a href="/contacto">Contacto</a></li> {/* Enlaza a la página de Contacto si la creas */}
							{/* <li><a href="/blog">Blog</a></li> */}{/* Si tienes blog */}
							{/* <li><a href="/faqs">FAQs</a></li> */}{/* Si tienes página de preguntas frecuentes */}
						</ul>
					</div>

					{/* Columna 4: Enlaces Legales (Ahora es una columna propia) */}
					{/* Eliminamos la sección de Soporte ya que la tienda no es funcional para ventas directas */}
					<div className="footer-links-col"> {/* Reutilizamos la clase para los estilos de columna de enlaces */}
						<h3>Legal</h3> {/* Título para la columna Legal */}
						<ul>
							{/* Estas páginas son relevantes para el uso del propio frontend de React */}
							<li><a href="/politica-privacidad">Política de Privacidad</a></li> {/* Asegúrate de crear esta página */}
							<li><a href="/terminos-condiciones">Términos y Condiciones</a></li> {/* Asegúrate de crear esta página */}
							<li><a href="/politica-cookies">Política de Cookies</a></li> {/* Asegúrate de crear esta página */}
						</ul>
					</div>


					{/* Columna 5: Información de Contacto (Horario detallado eliminado) */}
					{/* Esta columna mantuvo su contenido de dirección, teléfonos y email */}
					<div className="footer-contact">
						<h3>Contacto</h3> {/* Título para la columna */}
						<p>
							{/* Dirección */}
							Sta. María de Trassierra, 41<br/>
							14011 Córdoba, España
						</p>
						<p>
							{/* Teléfonos - Añadimos el prefijo +34 para enlaces tel: */}
							Teléfono Fijo: <a href="tel:+34957845238">957 84 52 38</a><br/>
							Móvil: <a href="tel:+34605363660">605 36 36 60</a>
							{/* Opcional: Enlace de WhatsApp si el móvil lo usa */}
							{/* <br/><a href="https://wa.me/34605363660" target="_blank" rel="noopener noreferrer">Enviar WhatsApp</a> */}
						</p>
						<p>Email: <a href="mailto:stmaterialpolicial@gmail.com">stmaterialpolicial@gmail.com</a></p>

						{/* El horario detallado ha sido eliminado de aquí */}
						{/* Puedes añadir un enlace a la página de Contacto para ver el horario completo: */}
						{/* <p><a href="/contacto">Ver Horario Completo</a></p> */}

					</div>

					{/* Columna 6: Redes Sociales (Ahora con iconos) */}
					{/* Esta columna mantuvo su contenido de enlaces a redes sociales */}
					<div className="footer-social">
						<h3>Síguenos</h3>
						<div className="social-icons">
							{/* Facebook Icon */}
							<a href="https://www.facebook.com/soluciones.tacticas.cor?locale=es_ES" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
								<FontAwesomeIcon icon={faFacebook} />
							</a>
							{/* Instagram Icon */}
							<a href="https://www.instagram.com/stmaterialpolicial/?hl=es" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
								<FontAwesomeIcon icon={faInstagram} />
							</a>
							{/* Twitter/X Icon */}
							<a href="https://x.com/STacticas" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X">
								<FontAwesomeIcon icon={faTwitter} />
							</a>
							{/* WhatsApp Icon - Usamos el formato wa.me para enlace directo */}
							<a href="https://wa.me/34605363660" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
								<FontAwesomeIcon icon={faWhatsapp} />
							</a>
							{/* Puedes añadir más iconos aquí si los necesitas */}
						</div>
					</div>


					{/* Eliminamos la columna de Métodos de Pago / Envío ya que no es relevante sin transacciones directas */}
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

				{/* Línea de Copyright y sección inferior */}
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