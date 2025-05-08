// src/pages/PrivacyPolicyPage.tsx

import './css/PrivacyPolicyPage.css'; // Importa los estilos CSS para esta página

function PrivacyPolicyPage() {
	return (
		// Contenedor principal de la página. Usaremos esta clase en el CSS.
		<div className="privacy-policy-page-container">
			{/* Título de la página */}
			<h1>Política de Privacidad</h1>

			{/* Contenedor para el texto del contenido. Usaremos esta clase en el CSS. */}
			<div className="privacy-policy-content">
				{/* =================================================================== */}
				{/* !!! MARCADOR DE POSICIÓN - REEMPLAZA ESTO CON LA POLÍTICA DE PRIVACIDAD REAL !!! */}
				{/* =================================================================== */}
				<p>Esta es la Política de Privacidad de Soluciones Tácticas. Explica cómo recopilamos, usamos y protegemos su información personal.</p>

				<h2>Información que recopilamos</h2>
				<p>Podemos recopilar información personal que usted nos proporciona directamente, como su nombre, dirección de correo electrónico, dirección postal y número de teléfono, cuando se pone en contacto con nosotros o utiliza nuestros servicios.</p>
				<p>También podemos recopilar información no personal automáticamente mientras navega por el sitio, como su dirección IP, tipo de navegador, páginas visitadas y tiempos de visita. Esto a menudo se hace a través de cookies.</p>

				<h2>Uso de su información</h2>
				<p>Utilizamos la información recopilada para:</p>
				<ul>
					<li>Proporcionar y mantener nuestro sitio web.</li>
					<li>Mejorar, personalizar y expandir nuestro sitio web.</li>
					<li>Comprender y analizar cómo utiliza nuestro sitio web.</li>
					<li>Comunicarnos con usted, ya sea directamente o a través de uno de nuestros socios, para servicio al cliente, para proporcionarle actualizaciones y otra información relacionada con el sitio web, y para fines de marketing y promoción.</li>
					<li>Enviarle correos electrónicos.</li>
					<li>Prevenir fraudes.</li>
				</ul>

				<h2>Cookies</h2>
				<p>Utilizamos cookies para almacenar información sobre las preferencias de los visitantes, y para registrar información sobre las páginas que el usuario accede o visita, para personalizar el contenido de nuestra página web basándonos en el tipo de navegador de los visitantes u otra información.</p>

				<h2>Seguridad de sus datos</h2>
				<p>Nos esforzamos por utilizar medios comercialmente aceptables para proteger su información personal, pero recuerde que ningún método de transmisión por Internet, o método de almacenamiento electrónico es 100% seguro y no podemos garantizar su seguridad absoluta.</p>

				<h2>Sus derechos de protección de datos (GDPR)</h2>
				<p>Si usted es residente del Espacio Económico Europeo (EEE), tiene ciertos derechos de protección de datos...</p>
				{/* Mencionar derechos como acceso, rectificación, eliminación, restricción, objeción, portabilidad */}

				<h2>Cambios a esta Política de Privacidad</h2>
				<p>Podemos actualizar nuestra Política de Privacidad de vez en cuando. Le notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página.</p>
				<p>Fecha de última actualización: 08/05/2025</p>

				<h2>Contacto</h2>
				<p>Si tiene alguna pregunta sobre esta Política de Privacidad, puede contactarnos:</p>
				<p>Por correo electrónico: stmaterialpolicial@gmail.com</p>
				<p>Visitando esta página en nuestro sitio web: [Enlace a la página de Contacto si la creas]</p>

				{/* =================================================================== */}
				{/* !!! FIN DEL MARCADOR DE POSICIÓN !!! */}
				{/* =================================================================== */}

			</div>
		</div>
	);
}

export default PrivacyPolicyPage;