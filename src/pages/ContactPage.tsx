// src/pages/ContactPage.tsx

import React from 'react';
import './css/ContactPage.css'; // Importa los estilos para esta página

// Puedes usar la información de contacto confirmada
const address = "Sta. María de Trassierra, 41, 14011 Córdoba, Spain";
const phoneFixed = "957 84 52 38"; // Teléfono fijo
const phoneMobile = "605 36 36 60"; // Teléfono móvil
const email = "stmaterialpolicial@gmail.com";

// URL de incrustación del mapa de Google Maps para la dirección de la tienda
// Obtén esta URL desde Google Maps -> Buscar dirección -> Compartir -> Insertar mapa -> Copiar HTML del iframe -> Extraer el src=""
// Ejemplo de URL real (esta puede variar, genera la tuya desde Google Maps):
const realMapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3168.6779115035426!2d-4.800068084695381!3d37.89301577973846!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6871d91472f4f1%3A0x51410e6c19e2b106!2sSta.%20Mar%C3%ADa%20de%20Trassierra%2C%2041%2C%2014011%20C%C3%B3rdoba!5e0!3m2!1ses!2ses!4v1678912345678!5m2!1ses!2ses"; // URL para Sta. María de Trassierra, 41, Córdoba


function ContactPage() {
	// *** NOTA IMPORTANTE SOBRE EL FORMULARIO ***
	// La lógica para MANEJAR EL ENVÍO del formulario (enviar el email) NO está implementada aquí.
	// Esto requeriría un backend o un servicio de terceros.
	// Este formulario es solo la estructura visual por ahora.
	// Para hacerlo funcional, tendrías que añadir estado para cada campo, una función onSubmit, y la llamada a tu API/servicio de envío.


	// Ejemplo de manejo básico de envío (solo para ver que el botón funciona)
	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault(); // Evita que la página se recargue al enviar el formulario
		console.log("Formulario enviado (funcionalidad de envío de email no implementada)");
		alert("Gracias por tu mensaje. La funcionalidad de envío de email no está activa en esta demo.");
		// Aquí iría la lógica real para enviar los datos del formulario a un backend
	};


	return (
		// Contenedor principal de la página de Contacto
		<div className="contact-page-container">
			{/* Título principal */}
			<h1>Contacto</h1>

			{/* Subtítulo o texto introductorio */}
			<div className="contact-intro">
				<h2>Hablemos</h2>
				<p>
					Ya sea que tengas preguntas sobre nuestros productos, necesites asistencia o simplemente quieras compartir tus comentarios, estamos aquí para escucharte. Utiliza los siguientes métodos de contacto para ponerte en contacto con nuestro equipo. Tu satisfacción es nuestra prioridad.
				</p>
			</div>


			{/* Contenedor principal para el contenido de dos columnas (Formulario + Info/Mapa) */}
			<div className="contact-content-main">

				{/* Columna del Formulario */}
				<div className="contact-form-col">
					<h3>Envíanos un Mensaje</h3>
					{/* Formulario de contacto - Estructura visual */}
					<form onSubmit={handleSubmit} className="contact-form">
						<div className="form-group">
							<label htmlFor="name">Nombre *</label>
							<input type="text" id="name" name="name" required />
						</div>

						<div className="form-group">
							<label htmlFor="whatsapp">WhatsApp</label> {/* Marcado como opcional en la imagen vieja */}
							<input type="text" id="whatsapp" name="whatsapp" /> {/* Podría ser type="tel" con patrón si se necesita */}
						</div>

						<div className="form-group">
							<label htmlFor="email">Correo Electrónico *</label>
							<input type="email" id="email" name="email" required />
						</div>

						<div className="form-group">
							<label htmlFor="message">Mensaje *</label>
							<textarea id="message" name="message" rows={6} placeholder="Introduce tu mensaje" required></textarea>
						</div>

						<button type="submit" className="btn-submit">
							Enviar
						</button>
					</form>
				</div> {/* Cierre de contact-form-col */}

				{/* Columna de Información de Contacto y Mapa */}
				<div className="contact-info-map-col">
					<h3>Datos de Contacto</h3>

					{/* Información de Contacto */}
					<div className="contact-details">
						<p>
							<strong>Dirección:</strong><br/>
							{address}
						</p>
						<p>
							<strong>Teléfono Fijo:</strong><br/>
							<a href={`tel:+34${phoneFixed.replace(/\s/g, '')}`}>{phoneFixed}</a>
						</p>
						<p>
							<strong>Móvil / WhatsApp:</strong><br/>
							<a href={`tel:+34${phoneMobile.replace(/\s/g, '')}`}>{phoneMobile}</a>
							{/* Enlace directo a WhatsApp si lo prefieres */}
							{/* <br/><a href={`https://wa.me/34${phoneMobile.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer">Enviar WhatsApp</a> */}
						</p>
						<p>
							<strong>Correo Electrónico:</strong><br/>
							<a href={`mailto:${email}`}>{email}</a>
						</p>

						{/* Puedes añadir el horario aquí si quieres, aunque lo quitamos del footer */}
						{/*
						<h4>Horario de Tienda:</h4>
						<ul>
							<li>Lunes: 10:00–14:00, 17:00–20:30</li>
							// ... resto del horario ...
						</ul>
						*/}
					</div> {/* Cierre de contact-details */}

					{/* Mapa Incrustado de Google Maps */}
					<div className="contact-map">
						{/* Reemplaza el 'src' con la URL que obtuviste de Google Maps Embed */}
						{/* Añadimos title para accesibilidad */}
						<iframe
							src={realMapEmbedUrl} // Usa la URL real que obtuviste
							title="Ubicación de Soluciones Tácticas en Google Maps"
							width="100%" // Ancho del iframe, el CSS lo hará responsive
							height="400" 
							style={{ border: 0 }} 
							allowFullScreen={true}
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade">
						</iframe>
					</div> {/* Cierre de contact-map */}

				</div> {/* Cierre de contact-info-map-col */}

			</div> {/* Cierre de contact-content-main */}

		</div> 
	);
}

export default ContactPage;