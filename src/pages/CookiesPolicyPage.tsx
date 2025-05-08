// src/pages/CookiesPolicyPage.tsx

import './css/CookiesPolicyPage.css'; // Importa los estilos CSS para esta página

function CookiesPolicyPage() {
	return (
		// Contenedor principal de la página. Usaremos esta clase en el CSS.
		<div className="cookies-policy-page-container">
			{/* Título de la página */}
			<h1>Política de Cookies</h1>

			{/* Contenedor para el texto del contenido. Usaremos esta clase en el CSS. */}
			<div className="cookies-policy-content">
				{/* =================================================================== */}
				{/* !!! MARCADOR DE POSICIÓN - REEMPLAZA ESTO CON LA POLÍTICA DE COOKIES REAL !!! */}
				{/* =================================================================== */}
				<p>Este sitio web utiliza cookies para mejorar su experiencia de usuario y analizar nuestro tráfico.</p>

				<h2>¿Qué son las cookies?</h2>
				<p>Las cookies son pequeños archivos de texto que los sitios web visitados por el usuario envían a su terminal (normalmente al navegador), donde se almacenan para ser retransmitidos a los mismos sitios en la siguiente visita del mismo usuario. Las cookies se utilizan para diferentes finalidades, como recordar sus preferencias (idioma, etc.), almacenar información de inicio de sesión, recopilar estadísticas, o personalizar la publicidad.</p>

				<h2>Tipos de cookies utilizadas</h2>
				<p>Podemos utilizar los siguientes tipos de cookies:</p>
				<ul>
					<li>**Cookies Técnicas:** Son aquellas que permiten al usuario la navegación a través de una página web, plataforma o aplicación y la utilización de las diferentes opciones o servicios que en ella existan.</li>
					<li>**Cookies de Personalización:** Son aquellas que permiten al usuario acceder al servicio con algunas características de carácter general predefinidas en función de una serie de criterios en el terminal del usuario.</li>
					<li>**Cookies de Análisis:** Son aquellas que bien tratadas por nosotros o por terceros, nos permiten cuantificar el número de usuarios y así realizar la medición y análisis estadístico de la utilización que hacen los usuarios del servicio ofertado.</li>
					<li>**Cookies Publicitarias:** Son aquellas que permiten la gestión, de la forma más eficaz posible, de los espacios publicitarios que, en su caso, el editor haya incluido en una página web, aplicación o plataforma desde la que presta el servicio solicitado en base a criterios como el contenido editado o la frecuencia en la que se muestran los anuncios.</li>
					<li>**Cookies de Publicidad Comportamental:** Son aquellas que permiten la gestión de los espacios publicitarios basando el tratamiento de los datos en el comportamiento del usuario, observando continuamente sus hábitos de navegación, lo que permite desarrollar un perfil específico para mostrar publicidad en función del mismo.</li>
				</ul>

				<h2>Gestión de cookies en su navegador</h2>
				<p>Puede configurar su navegador para aceptar o rechazar cookies, o para que se le notifique cuando una cookie intenta ser colocada en su ordenador. Sin embargo, si bloquea o elimina las cookies, algunas funcionalidades de nuestro sitio web pueden no funcionar correctamente.</p>
				<p>Aquí le proporcionamos enlaces a las páginas de ayuda de los navegadores más populares donde se explica cómo gestionar las cookies (los pasos exactos pueden variar ligeramente según la versión del navegador y el dispositivo):</p>
				<ul>
					<li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Gestión de cookies en Google Chrome</a></li>
					<li><a href="https://support.mozilla.org/es/kb/cookies-informacion-que-los-sitios-web-guardan-en-" target="_blank" rel="noopener noreferrer">Gestión de cookies en Mozilla Firefox</a></li>
					<li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Gestión de cookies en Safari (Mac)</a></li>
					<li><a href="https://support.microsoft.com/es-es/microsoft-edge/administrar-cookies-en-microsoft-edge-ver-permitir-bloquear-eliminar-y-usar-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer">Gestión de cookies en Microsoft Edge</a></li>
					{/* Puedes añadir enlaces para otros navegadores si lo consideras necesario */}
				</ul>
				<p>Para obtener más información general sobre las cookies y cómo gestionarlas en diferentes navegadores, puede visitar recursos como <a href="https://www.aboutcookies.org/" target="_blank" rel="noopener noreferrer">AboutCookies.org</a>.</p>

				<h2>Cambios a nuestra Política de Cookies</h2>
				<p>Es posible que actualicemos nuestra Política de Cookies ocasionalmente. Le recomendamos revisar esta página periódicamente para estar informado sobre cómo utilizamos las cookies.</p>
				<p>Fecha de última actualización: 08/05/2025</p>

				<h2>Contacto</h2>
				<p>Si tiene alguna pregunta sobre esta Política de Cookies, puede contactarnos:</p>
				<p>Por correo electrónico: stmaterialpolicial@gmail.com </p>


				{/* =================================================================== */}
				{/* !!! FIN DEL MARCADOR DE POSICIÓN !!! */}
				{/* =================================================================== */}

			</div>
		</div>
	);
}

export default CookiesPolicyPage;