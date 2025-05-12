// src/pages/ContactPage.tsx

// Importar React (necesario para JSX)
// Importar los estilos para esta página
import './css/ContactPage.css';

// *** Importar Font Awesome para iconos ***
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// *** Importar el icono específico de WhatsApp (asegúrate de que esté instalado: npm install @fortawesome/free-brands-svg-icons) ***
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';


// Puedes usar la información de contacto confirmada
const address = "Sta. María de Trassierra, 41, 14011 Córdoba, España";
const phoneFixed = "957 84 52 38"; // Teléfono fijo
const phoneMobile = "605 36 36 60"; // Teléfono móvil
const email = "stmaterialpolicial@gmail.com";

// URL de incrustación del mapa de Google Maps para la dirección de la tienda
// Obtén esta URL desde Google Maps -> Buscar dirección -> Compartir -> Insertar mapa -> Copiar HTML del iframe -> Extraer el src=""
// Ejemplo de URL real (esta puede variar, genera la tuya desde Google Maps):
// Asegúrate de que la URL real no contenga espacios innecesarios o caracteres especiales
const realMapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1dXXX!2dXXX!3dXXX!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdXXXX:0xXXXX!2sSta.+Mar%C3%ADa+de+Trassierra,+41,+14011+C%C3%B3rdoba,+Spain!5e0!3m2!1sen!2ses!4vYOUR_API_KEY!5m2!1sen!2ses"; // ** REEMPLAZA XXXXX y YOUR_API_KEY CON LA URL REAL DE GOOGLE MAPS **


function ContactPage() {
	// *** ELIMINADO: La lógica para manejar el envío del formulario ya no es necesaria ***
	// const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => { ... };


	return (
		// Contenedor principal de la página de Contacto
		// Puedes usar la clase page-container de pageLayout.css si prefieres que tenga el padding y max-width comunes
		<div className="contact-page-container page-container"> {/* Ejemplo: Añadiendo la clase page-container */}
			{/* Título principal - Puedes usar la clase page-title si quieres el estilo de título común */}
			{/* Si quieres el estilo de banner, usa <div className="page-title-block"><h1>Contacto</h1></div> */}

			{/* Subtítulo o texto introductorio */}
			<div className="contact-intro">
				<div className='page-title-block'>
					<h2>Hablemos</h2> {/* Podrías usar una clase genérica para h2/h3 de subtítulo si la creas */}
				</div>
				<p>
					Ya sea que tengas preguntas sobre nuestros productos, necesites asistencia o simplemente quieras compartir tus comentarios, estamos aquí para escucharte. Utiliza los siguientes métodos de contacto para ponerte en contacto con nuestro equipo. Tu satisfacción es nuestra prioridad.
				</p>
			</div>


			{/* Contenedor principal para el contenido (Info/Mapa solamente ahora) */}
			{/* Eliminamos el contenedor principal de 2 columnas y la columna del formulario */}
			{/* Usamos un nuevo div para organizar la info y el mapa ahora que ocupan todo el ancho */}
			<div className="contact-details-and-map"> {/* Nueva clase para el contenedor restante */}

				{/* Eliminado: Columna del Formulario */}
				{/* <div className="contact-form-col"> ... </div> */}

				{/* Columna de Información de Contacto y Mapa (Ahora ocupa todo el ancho disponible dentro de contact-details-and-map) */}
				<div className="contact-info-map-col"> {/* Mantenemos esta clase, ajustaremos su layout en CSS */}
					<h3>Datos de Contacto</h3> {/* Podrías usar una clase genérica para h3 si la creas */}

					{/* Información de Contacto */}
					<div className="contact-details"> {/* Mantenemos esta clase */}
						<p>
							<strong>Dirección:</strong><br/>
							{address}
						</p>
						<p>
							<strong>Teléfono Fijo:</strong><br/>
							{/* Enlace tel: para el teléfono fijo */}
							<a href={`tel:+34${phoneFixed.replace(/\s/g, '')}`}>{phoneFixed}</a>
						</p>
						<p>
							<strong>Móvil / WhatsApp:</strong><br/>
							{/* <<< MODIFICADO: Enlace TEL para llamar y Enlace WA con Icono por separado >>> */}

							{/* Enlace 1: Para llamar (el texto del número) */}
							<a href={`tel:+34${phoneMobile.replace(/\s/g, '')}`}>{phoneMobile}</a>

							{/* Enlace 2: Para WhatsApp (el icono) */}
							<a
								href={`https://wa.me/34${phoneMobile.replace(/\s/g, '')}`} // URL para abrir WhatsApp (formato wa.me)
								target="_blank" // Abrir en una nueva pestaña
								rel="noopener noreferrer" // Buena práctica de seguridad
								className="whatsapp-icon-link" // Añadir una clase para estilizar el espacio entre los enlaces
								aria-label="Enviar mensaje de WhatsApp" // Etiqueta para accesibilidad (especialmente útil si es solo un icono)
							>
								{/* <<< Aquí solo el Icono de WhatsApp >>> */}
								<FontAwesomeIcon icon={faWhatsapp} />
							</a>
						</p>
						<p>
							<strong>Correo Electrónico:</strong><br/>
							{/* Enlace mailto: para el correo electrónico */}
							<a href={`mailto:${email}`}>{email}</a>
						</p>

						{/* ... horario opcional ... */}
					</div> {/* Cierre de contact-details */}

					{/* Mapa Incrustado de Google Maps */}
					<div className="contact-map"> {/* Mantenemos esta clase */}
						{/* Reemplaza el 'src' con la URL real que obtuviste de Google Maps Embed */}
						{/* Añadimos title para accesibilidad */}
						<iframe
							src={realMapEmbedUrl} // Usa la URL real que obtuviste
							title="Ubicación de Soluciones Tácticas en Google Maps"
							width="100%" // Ancho del iframe (lo haremos responsive con CSS)
							height="400"
							style={{ border: 0 }}
							allowFullScreen={true}
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade">
						</iframe>
					</div> {/* Cierre de contact-map */}

				</div> {/* Cierre de contact-info-map-col */}

			</div> {/* Cierre de contact-details-and-map */}


		</div> // Cierre de contact-page-container (y page-container)
	);
}

export default ContactPage;