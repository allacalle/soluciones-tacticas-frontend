// src/components/Header.tsx

import React, { useState, useEffect } from 'react'; // Asegúrate de importar useMemo si lo usas en el Header para algo más
import { Link, useNavigate } from 'react-router-dom';
import './css/Header.css'; // Importa tus estilos
import storeLogo from '../assets/logo/header-logo.jpg'; // Asegúrate de la ruta correcta a tu logo

import { getProducts } from '../api/wooApi'; // Necesitas getProducts para la búsqueda
import { Product } from '../types'; // Necesitas Product para las sugerencias de búsqueda

function Header() {
	// *** Estados para la barra de búsqueda ***
	const [searchTerm, setSearchTerm] = useState('');
	const navigate = useNavigate();
	const [searchResults, setSearchResults] = useState<Product[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	// *** Función para manejar el cambio en el input de búsqueda ***
	const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
	};

	// *** Función para manejar el envío del formulario de búsqueda (tecla Enter) ***
	const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault(); // Previene la recarga de la página

		if (searchTerm.trim()) {
			// Navegamos a la página de búsqueda con el término
			navigate(`/search?s=${encodeURIComponent(searchTerm.trim())}`);
			// Limpiamos las sugerencias al enviar
			setSearchResults([]);
		}
	};

	// *** useEffect para la búsqueda en tiempo real con debouncing ***
	useEffect(() => {
		// No buscar si el término está vacío
		if (!searchTerm.trim()) {
			setSearchResults([]); // Limpia resultados si el campo está vacío
			setIsSearching(false); // Deja de indicar que busca
			return;
		}

		setIsSearching(true); // Indicamos que empieza la búsqueda

		// Implementación del Debouncing
		const debounceTimer = setTimeout(async () => {
			console.log(`Workspaceing suggestions for: "${searchTerm}"`);

			try {
				// Llamamos a getProducts con el término de búsqueda
				// per_page: limita el número de sugerencias
				const result = await getProducts(1, 5, undefined, searchTerm.trim());

				setSearchResults(result.products); // Guardamos los productos encontrados
				console.log("Suggestions fetched:", result.products);

			} catch (error) {
				console.error("Error fetching search suggestions:", error);
				setSearchResults([]);
			} finally {
				setIsSearching(false); // La búsqueda ha terminado
			}

		}, 300); // Tiempo de espera del Debouncing (300ms)

		// Función de limpieza del useEffect: se ejecuta al desmontar o antes de que el efecto se re-ejecute
		return () => {
			clearTimeout(debounceTimer);
			console.log("Debounce timer cleared.");
		};

	}, [searchTerm]); // Dependencia: Este efecto se ejecuta cada vez que 'searchTerm' cambia


	// *** Función para manejar el clic en una sugerencia ***
	const handleSuggestionClick = (productSlug: string) => {
		// Limpiamos el término y los resultados al seleccionar una sugerencia
		setSearchTerm('');
		setSearchResults([]);
		// Navegamos a la página individual del producto
		navigate(`/producto/${productSlug}`);
	};


	return (
		<header className="site-header">
			{/* Fila Superior del Header (Logo, Búsqueda, Redes) */}
			<div className="header-top-row">
				{/* Sección del Logo y Nombre (Enlace a Home) */}
				<div className="site-branding">
					<Link to="/" className="site-title-link">
						<img src={storeLogo} alt="Soluciones Tacticas Logo" className="site-logo" />
					</Link>
				</div>
				{/* Sección de la Barra de Búsqueda */}
				<div className="header-search">
					<form onSubmit={handleSearchSubmit}>
						<input
							type="text"
							placeholder="Buscar productos..."
							className="search-input"
							value={searchTerm}
							onChange={handleSearchInputChange}
						/>
						{/* Opcional: Botón de búsqueda si no quieres depender solo de Enter */}
						{/* <button type="submit" className="search-button">Buscar</button> */}
					</form>

					{/* Contenedor para las SUGERENCIAS de búsqueda */}
					{/* Se muestra si está buscando (spinner) O si hay resultados */}
					{(isSearching || (searchTerm.trim() && searchResults.length > 0) || (!isSearching && searchTerm.trim() && searchResults.length === 0)) && (
						<div className="search-suggestions-dropdown">
							{/* Mostramos el spinner si está buscando */}
							{isSearching && (
								<div className="search-loading">Buscando...</div>
							)}

							{/* Mostramos la lista de sugerencias si NO está buscando Y hay resultados */}
							{!isSearching && searchResults.length > 0 && (
								<ul>
									{searchResults.map(product => (
										// Cada sugerencia es un elemento clickeable
										<li
											key={product.id}
											className="search-suggestion-item"
											onClick={() => handleSuggestionClick(product.slug)} // Usa el slug para navegar
										>
											{/* Puedes mostrar la imagen pequeña si está disponible */}
											{product.images && product.images[0]?.src && (
												<img src={product.images[0].src} alt={product.name} className="suggestion-image"/>
											)}
											<span className="suggestion-name">{product.name}</span> {/* Nombre del producto */}
										</li>
									))}
								</ul>
							)}

							{/* Mostrar mensaje "No results found" si NO está buscando, el término NO está vacío, Y searchResults está vacío */}
							{!isSearching && searchTerm.trim() && searchResults.length === 0 && (
								<div className="no-results">No se encontraron resultados.</div>
							)}
						</div>
					)}


				</div> {/* Cierre .header-search */}
				{/* Sección de Redes Sociales */}
				<div className="header-social">
					<a href="https://www.facebook.com/tupagina" target="_blank" rel="noopener noreferrer" className="social-link">Facebook</a>
					<a href="https://www.instagram.com/tuperfil" target="_blank" rel="noopener noreferrer" className="social-link">Instagram</a>
					<a href="https://wa.me/TUNUMERO" target="_blank" rel="noopener noreferrer" className="social-link">WhatsApp</a>
				</div>
			</div>

			{/* Fila Inferior del Header: Navegación Principal - ESTA ES LA SECCIÓN ACTUALIZADA */}
			<div className="header-bottom-row">
				<nav className="main-navigation">
					<ul>
						{/* Enlace Inicio */}
						<li><Link to="/" className="nav-link">Inicio</Link></li>

						{/* Categoría Principal: Equipación (slug: equipacion) */}
						<li className="menu-item-has-children">
							<Link to="/productos/equipacion" className="nav-link">Equipación</Link>
							<ul className="sub-menu">
								{/* Cinturones/hebillas (slug: cinturones_hebillas) */}
								<li><Link to="/productos/cinturones_hebillas" className="sub-menu-link">Cinturones/hebillas</Link></li>
								{/* Entrenamiento (slug: entrenamiento) */}
								<li><Link to="/productos/entrenamiento" className="sub-menu-link">Entrenamiento</Link></li>
								{/* Equipo protección (slug: equipo_proteccion) */}
								<li><Link to="/productos/equipo_proteccion" className="sub-menu-link">Equipo protección</Link></li>
								{/* Equipo sanitario (slug: equipo_sanitario) */}
								<li><Link to="/productos/equipo_sanitario" className="sub-menu-link">Equipo sanitario</Link></li>
								{/* Fundas complementos (slug: fundas_complementos) */}
								<li><Link to="/productos/fundas_complementos" className="sub-menu-link">Fundas complementos</Link></li>
								{/* Guantes (slug: guantes) */}
								<li><Link to="/productos/guantes" className="sub-menu-link">Guantes</Link></li>
								{/* Iluminación (slug: iluminacion_equipacion) */}
								<li><Link to="/productos/iluminacion_equipacion" className="sub-menu-link">Iluminación</Link></li>
								{/* Mochilas/bolsas (slug: mochilas_bolsas) */}
								<li><Link to="/productos/mochilas_bolsas" className="sub-menu-link">Mochilas/bolsas</Link></li>
								{/* Navajas/cuchillos (slug: navajas_cuchillos_equipacion) */}
								<li><Link to="/productos/navajas_cuchillos_equipacion" className="sub-menu-link">Navajas/cuchillos</Link></li>
								{/* Pouches chaleco/cinturón (slug: pouches_chaleco_cinturon) */}
								<li><Link to="/productos/pouches_chaleco_cinturon" className="sub-menu-link">Pouches chaleco/cinturón</Link></li>
							</ul>
						</li>

						{/* Categoría Principal: Armería (slug: armeria) */}
						<li className="menu-item-has-children">
							<Link to="/productos/armeria" className="nav-link">Armería</Link>
							<ul className="sub-menu">
								{/* Armas (slug: armas) */}
								<li><Link to="/productos/armas" className="sub-menu-link">Armas</Link></li>
								{/* Cargadores (slug: cargadores) */}
								<li><Link to="/productos/cargadores" className="sub-menu-link">Cargadores</Link></li>
								{/* Complementos armas (slug: complementos_armas) */}
								<li><Link to="/productos/complementos_armas" className="sub-menu-link">Complementos armas</Link></li>
								{/* Defensas (slug: defensas_armeria) */}
								<li><Link to="/productos/defensas_armeria" className="sub-menu-link">Defensas</Link></li>
								{/* Fundas arma (slug: fundas_arma) */}
								<li><Link to="/productos/fundas_arma" className="sub-menu-link">Fundas arma</Link></li>
								{/* Grilletes (slug: grilletes_armeria) */}
								<li><Link to="/productos/grilletes_armeria" className="sub-menu-link">Grilletes</Link></li>
								{/* Limpieza armas (slug: limpieza_armas) */}
								<li><Link to="/productos/limpieza_armas" className="sub-menu-link">Limpieza armas</Link></li>
								{/* Spray de defensa (slug: spray_de_defensa) */}
								<li><Link to="/productos/spray_de_defensa" className="sub-menu-link">Spray de defensa</Link></li>
							</ul>
						</li>

						{/* Categoria Vestuario (slug: vestuario) */}
						<li className="menu-item-has-children">
							<Link to="/productos/vestuario" className="nav-link">Vestuario</Link>
							<ul className="sub-menu">
								{/* Botas (slug: botas) */}
								<li><Link to="/productos/botas" className="sub-menu-link">Botas</Link></li>
								{/* Cabeza (slug: cabeza) */}
								<li><Link to="/productos/cabeza" className="sub-menu-link">Cabeza</Link></li>
								{/* Chaquetas (slug: chaquetas) */}
								<li><Link to="/productos/chaquetas" className="sub-menu-link">Chaquetas</Link></li>
								{/* Pantalones (slug: pantalones) */}
								<li><Link to="/productos/pantalones" className="sub-menu-link">Pantalones</Link></li>
							</ul>
						</li>

						{/* Outdoor/Bushcraft (slug: outdoor_bushcraft) */}
						<li className="menu-item-has-children">
							<Link to="/productos/outdoor_bushcraft" className="nav-link">Outdoor/Bushcraft</Link>
							<ul className="sub-menu">
								{/* Iluminación (slug: iluminacion_outdoor) */}
								<li><Link to="/productos/iluminacion_outdoor" className="sub-menu-link">Iluminación</Link></li>
								{/* Navajas/Cuchillos (slug: navajas_cuchillos_outdoor) */}
								<li><Link to="/productos/navajas_cuchillos_outdoor" className="sub-menu-link">Navajas/Cuchillos</Link></li>
								{/* Pedernales (slug: pedernales) */}
								<li><Link to="/productos/pedernales" className="sub-menu-link">Pedernales</Link></li>
								{/* Utensilios (slug: utensilios) */}
								<li><Link to="/productos/utensilios" className="sub-menu-link">Utensilios</Link></li>
								{/* Varios (slug: varios) */}
								<li><Link to="/productos/varios" className="sub-menu-link">Varios</Link></li>
							</ul>
						</li>

						{/* Militar (slug: militar) */}
						<li className="menu-item-has-children">
							<Link to="/productos/militar" className="nav-link">Militar</Link>
							<ul className="sub-menu">
								{/* Acceso Cefot (slug: acceso_cefot) */}
								<li><Link to="/productos/acceso_cefot" className="sub-menu-link">Acceso Cefot</Link></li>
								{/* Complementos (slug: complementos) */}
								<li><Link to="/productos/complementos" className="sub-menu-link">Complementos</Link></li>
								{/* Pouches (slug: pouches) */}
								<li><Link to="/productos/pouches" className="sub-menu-link">Pouches</Link></li>
								{/* Primera línea (slug: primera_linea) */}
								<li><Link to="/productos/primera_linea" className="sub-menu-link">Primera línea</Link></li>
							</ul>
						</li>

						{/* Policial/Vigilante (slug: policial_vigilante) */}
						<li className="menu-item-has-children">
							<Link to="/productos/policial_vigilante" className="nav-link">Policial/Vigilante</Link>
							<ul className="sub-menu">
								{/* Acceso academia (slug: acceso_academia) */}
								<li><Link to="/productos/acceso_academia" className="sub-menu-link">Acceso academia</Link></li>
								{/* Defensas (slug: defensas_policial) */}
								<li><Link to="/productos/defensas_policial" className="sub-menu-link">Defensas</Link></li>
								{/* Grilletes (slug: grilletes_policial) */}
								<li><Link to="/productos/grilletes_policial" className="sub-menu-link">Grilletes</Link></li>
								{/* Protección anticorte (slug: proteccion_anticorte) */}
								<li><Link to="/productos/proteccion_anticorte" className="sub-menu-link">Protección anticorte</Link></li>
							</ul>
						</li>

						{/* Gala y regalos (slug: gala_y_regalos) */}
						<li><Link to="/productos/gala_y_regalos" className="nav-link">Gala y regalos</Link></li>

						{/* Enlace a Contacto (slug: contacto) - Asumiendo que la ruta de Contacto es /contacto */}
						<li className="nav-contact-item"><Link to="/contacto" className="nav-link">Contacto</Link></li>

					</ul>
				</nav>
			</div> {/* Cierre .header-bottom-row */}
		</header>
	);
}

export default Header;