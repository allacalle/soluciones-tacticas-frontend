// src/components/Header.tsx

import React, { useState, useEffect } from 'react'; // *** Importamos useState ***
import { Link, useNavigate } from 'react-router-dom'; // Necesitamos Link para la navegación
import './css/Header.css'; // Importamos los estilos CSS para el header
import storeLogo from '../assets/logo/header-logo.jpg'; // *** Asegúrate de la ruta correcta a tu logo ***

import { getProducts } from '../api/wooApi';
import { Product } from '../types'; // Asegúrate de que la ruta es correcta


function Header() {
     // *** Declaramos el estado para guardar el término de búsqueda ***
     const [searchTerm, setSearchTerm] = useState('');
     // *** Obtenemos la función de navegación ***
    const navigate = useNavigate(); // Llama al hook dentro del componente

    // *** Estado para las sugerencias de búsqueda (lista de productos) ***
    const [searchResults, setSearchResults] = useState<Product[]>([]); // Usamos la interfaz Product
    // *** Estado para indicar si se está buscando (ej: para mostrar un spinner) ***
    const [isSearching, setIsSearching] = useState(false);

     // *** Función que se ejecuta cuando el valor del input cambia ***
     const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
         setSearchTerm(event.target.value); // Actualiza el estado con el nuevo valor del input
         // console.log("Current search term:", event.target.value); // Opcional: para ver en consola cómo se actualiza
     };

      // *** Función para manejar el envío del formulario de búsqueda ***
    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // *** Previene el comportamiento por defecto del formulario (recargar la página) ***

        // Solo navegar si hay algo escrito en el campo de búsqueda
        if (searchTerm.trim()) { // .trim() quita espacios en blanco al inicio/final
            // *** Navegamos a la página de búsqueda, pasando el término en la URL ***
            // Usaremos una ruta '/search' con un parámetro de consulta 's' (search)
            navigate(`/search?s=${encodeURIComponent(searchTerm.trim())}`);
            // encodeURIComponent asegura que caracteres especiales en el término de búsqueda sean manejados correctamente en la URL
        }
        // Limpiar sugerencias al enviar el formulario con Enter
        setSearchResults([]);
    };

    // *** useEffect para la búsqueda en tiempo real con debouncing ***
    useEffect(() => {
        // No buscar si el término está vacío
        if (!searchTerm.trim()) {
            setSearchResults([]); // Limpia resultados si el campo está vacío
            setIsSearching(false); // Deja de indicar que busca
            return; // Salimos del efecto
        }

        setIsSearching(true); // Indicamos que empieza la búsqueda


        // *** Implementación del Debouncing ***
        // Limpiamos cualquier timeout anterior para reiniciar el contador
        const debounceTimer = setTimeout(async () => {
            setIsSearching(true); // Indicamos que la búsqueda ha comenzado
            console.log(`Workspaceing suggestions for: "${searchTerm}"`); // Log para depuración

            try {
                // Llamamos a getProducts con el término de búsqueda
                // Podemos limitar per_page para no traer demasiadas sugerencias
                const result = await getProducts(1, 5, undefined, searchTerm.trim()); // Busca 10 productos que coincidan

                setSearchResults(result.products); // Guardamos los productos encontrados en el estado
                console.log("Suggestions fetched:", result.products); // Log de resultados

            } catch (error) {
                console.error("Error fetching search suggestions:", error);
                setSearchResults([]); // Limpiamos resultados en caso de error
                // Puedes añadir un estado de error para sugerencias si quieres
            } finally {
                setIsSearching(false); // La búsqueda ha terminado
            }

        }, 300); // *** Tiempo de espera del Debouncing (300ms) ***


        // Función de limpieza del useEffect: se ejecuta al desmontar o antes de que el efecto se ejecute de nuevo
        // Limpia el timeout si el término de búsqueda cambia antes de que expire el timer
        return () => {
            clearTimeout(debounceTimer);
            console.log("Debounce timer cleared."); // Log de limpieza
        };

    }, [searchTerm]); // *** Dependencia: Este efecto se ejecuta cada vez que 'searchTerm' cambia ***

        // *** Función para manejar el clic en una sugerencia ***
        const handleSuggestionClick = (productSlug: string) => {
            // Limpiamos el término de búsqueda y los resultados al seleccionar una sugerencia
            setSearchTerm('');
            setSearchResults([]);
            // Navegamos a la página individual del producto usando su slug
            navigate(`/producto/${productSlug}`); 
        };

    return (
    <header className="site-header">
    {/* Fila Superior del Header (Logo, Búsqueda, Redes) */}
    <div className="header-top-row"> {/* Clase para estilizar esta fila */}
     {/* Sección del Logo y Nombre (Enlace a Home) */}
        <div className="site-branding"> {/* Clase para estilizar el logo/nombre */}
             <Link to="/" className="site-title-link"> {/* Clase para estilizar el enlace */}
             <img src={storeLogo} alt="Soluciones Tacticas Logo" className="site-logo" />
            {/* <img src={storeLogo} alt="Soluciones Tacticas Logo" className="site-logo" /> */}
             </Link>
             {/*<span className="site-title">Soluciones Tacticas</span> */}
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

                                        {/* ============================================================== */}
                                        {/* *** Contenedor para las SUGERENCIAS de búsqueda *** */}
                    {/* Se muestra si no está buscando Y hay resultados */}
                    {/* ============================================================== */}
                     {/* Mostramos el spinner si está buscando */}
                     {isSearching && (
                         <div className="search-suggestions-dropdown"> {/* Usamos el mismo contenedor para el spinner */}
                             <div className="search-loading">Buscando...</div>
                         </div>
                     )}

                     {/* Mostramos la lista de sugerencias si NO está buscando Y hay resultados */}
                     {!isSearching && searchResults.length > 0 && (
                         <div className="search-suggestions-dropdown"> {/* Clase para estilizar el dropdown */}
                             <ul> {/* Lista de sugerencias */}
                                 {searchResults.map(product => (
                                     // Cada sugerencia es un elemento clickeable
                                     <li
                                         key={product.id}
                                         className="search-suggestion-item" // Clase para estilizar cada item
                                         onClick={() => handleSuggestionClick(product.slug)} // Al hacer clic, navegar al producto
                                     >
                                         {/* Puedes mostrar la imagen pequeña si está disponible */}
                                         {product.images && product.images[0]?.src && (
                                             <img src={product.images[0].src} alt={product.name} className="suggestion-image"/>
                                         )}
                                         <span className="suggestion-name">{product.name}</span> {/* Nombre del producto */}
                                     </li>
                                 ))}
                             </ul>
                         </div>
                     )}

                    {/* Opcional: Mostrar mensaje "No results found" si NO está buscando, el término NO está vacío, Y searchResults está vacío */}
                     {!isSearching && searchTerm.trim() && searchResults.length === 0 && (
                         <div className="search-suggestions-dropdown"> {/* Usamos el mismo contenedor */}
                              <div className="no-results">No se encontraron resultados.</div>
                         </div>
                     )}

                    

                </div> {/* Cierre .header-search */}
     {/* Sección de Redes Sociales */}
             <div className="header-social"> {/* Clase para estilizar las redes sociales */}
    {/* Clases para estilizar los enlaces de redes sociales e iconos si los usas */}
                <a href="https://www.facebook.com/tupagina" target="_blank" rel="noopener noreferrer" className="social-link">Facebook</a>
                <a href="https://www.instagram.com/tuperfil" target="_blank" rel="noopener noreferrer" className="social-link">Instagram</a>
                <a href="https://wa.me/TUNUMERO" target="_blank" rel="noopener noreferrer" className="social-link">WhatsApp</a>
            </div>
        </div>

{/* Fila Inferior del Header: Navegación Principal */}
        <div className="header-bottom-row"> {/* Clase para estilizar esta fila */}
        <nav className="main-navigation">
	<ul>
		{/* ... Enlace Inicio ... */}

		{/* Categoría Principal: Equipación */}
		<li className="menu-item-has-children">
			{/* Si "equipacion" es el slug correcto para la categoría padre en WooCommerce (count 0), este link está bien */}
			<Link to="/productos/equipacion" className="nav-link">Equipación</Link>
			<ul className="sub-menu">
				{/* Iluminación: Slug es iluminacion (Count 2) -> este link está bien */}
				<li><Link to="/productos/iluminacion" className="sub-menu-link">Iluminación</Link></li>
				{/* Equipo sanitario: Slug en WooCommerce es equipo_sanitario -> CORREGIR */}
				<li><Link to="/productos/equipo_sanitario" className="sub-menu-link">Equipo sanitario</Link></li> {/* *** CORREGIDO *** */}
				{/* Pouches chaleco/cinturón: Slug en WooCommerce es pouches_chaleco_cinturon -> CORREGIR */}
				<li><Link to="/productos/pouches_chaleco_cinturon" className="sub-menu-link">Pouches chaleco/cinturón</Link></li> {/* *** CORREGIDO *** */}
				{/* Mochilas/bolsas: Slug en WooCommerce es mochilas_bolsas -> CORREGIR */}
				<li><Link to="/productos/mochilas_bolsas" className="sub-menu-link">Mochilas/bolsas</Link></li> {/* *** CORREGIDO *** */}
				{/* Equipo protección: Slug en WooCommerce es equipo_proteccion -> CORREGIR */}
				<li><Link to="/productos/equipo_proteccion" className="sub-menu-link">Equipo protección</Link></li> {/* *** CORREGIDO *** */}
				{/* Guantes: Slug en WooCommerce es guantes -> este link está bien */}
				<li><Link to="/productos/guantes" className="sub-menu-link">Guantes</Link></li>
				{/* Navajas/cuchillos: Slug en WooCommerce es navajas_cuchillos -> CORREGIR */}
				<li><Link to="/productos/navajas_cuchillos" className="sub-menu-link">Navajas/cuchillos</Link></li> {/* *** CORREGIDO *** */}
				{/* Entrenamiento: Slug en WooCommerce es entrenamiento -> este link está bien */}
				<li><Link to="/productos/entrenamiento" className="sub-menu-link">Entrenamiento</Link></li>
				{/* Fundas complementos: Slug en WooCommerce es fundas_complementos -> CORREGIR */}
				<li><Link to="/productos/fundas_complementos" className="sub-menu-link">Fundas complementos</Link></li> {/* *** CORREGIDO *** */}
			</ul>
		</li>

		{/* Categoría Principal: Armería */}
		<li className="menu-item-has-children">
			{/* Si "armeria" es el slug correcto para el padre (count 0), este link está bien */}
			<Link to="/productos/armeria" className="nav-link">Armería</Link>
			<ul className="sub-menu">
				{/* Spray de defensa: Slug en WooCommerce es spray_de_defensa -> CORREGIR */}
				<li><Link to="/productos/spray_de_defensa" className="sub-menu-link">Spray de defensa</Link></li> {/* *** CORREGIDO *** */}
				{/* Complementos armas: Slug en WooCommerce es complementos_armas -> CORREGIR */}
				<li><Link to="/productos/complementos_armas" className="sub-menu-link">Complementos armas</Link></li> {/* *** CORREGIDO *** */}
				{/* Armas: Slug en WooCommerce es armas -> este link está bien */}
				<li><Link to="/productos/armas" className="sub-menu-link">Armas</Link></li>
				{/* Defensas (bajo Armería): Slug en WooCommerce es defensas -> este link está bien */}
				<li><Link to="/productos/defensas" className="sub-menu-link">Defensas</Link></li>
				{/* Limpieza armas: Slug en WooCommerce es limpieza_armas -> CORREGIR */}
				<li><Link to="/productos/limpieza_armas" className="sub-menu-link">Limpieza armas</Link></li> {/* *** CORREGIDO *** */}
				{/* Grilletes (bajo Armería): Slug en WooCommerce es grilletes -> este link está bien */}
				<li><Link to="/productos/grilletes" className="sub-menu-link">Grilletes</Link></li>
				{/* Fundas arma: Slug en WooCommerce es fundas_arma -> CORREGIR */}
				<li><Link to="/productos/fundas_arma" className="sub-menu-link">Fundas arma</Link></li> {/* *** CORREGIDO *** */}
				{/* Cargadores: Slug en WooCommerce es cargadores -> este link está bien */}
				<li><Link to="/productos/cargadores" className="sub-menu-link">Cargadores</Link></li>
			</ul>
		</li>

		{/* Categoria Vestuario */}
		<li className="menu-item-has-children">
			{/* Si "vestuario" es el slug correcto para el padre (count 0), este link está bien */}
			<Link to="/productos/vestuario" className="nav-link">Vestuario</Link>
			<ul className="sub-menu">
				{/* Pantalones: Slug en WooCommerce es pantalones -> este link está bien */}
				<li><Link to="/productos/pantalones" className="sub-menu-link">Pantalones</Link></li>
				{/* Botas: Slug en WooCommerce es botas -> este link está bien */}
				<li><Link to="/productos/botas" className="sub-menu-link">Botas</Link></li>
				{/* Chaquetas: Slug en WooCommerce es chaquetas -> este link está bien */}
				<li><Link to="/productos/chaquetas" className="sub-menu-link">Chaquetas</Link></li>
				{/* Cabeza: Slug en WooCommerce es cabeza -> este link está bien */}
				<li><Link to="/productos/cabeza" className="sub-menu-link">Cabeza</Link></li>
			</ul>
		</li>

		{/* Outdoor/Bushcraft */}
		<li className="menu-item-has-children">
			{/* Outdoor/Bushcraft: Slug en WooCommerce es outdoor_bushcraft -> CORREGIR */}
			<Link to="/productos/outdoor_bushcraft" className="nav-link">Outdoor/Bushcraft</Link> {/* *** CORREGIDO *** */}
			<ul className="sub-menu">
				{/* Iluminación (Outdoor): Slug en WooCommerce es iluminacion-outdoor_bushcraft -> CORREGIR */}
				<li><Link to="/productos/iluminacion-outdoor_bushcraft" className="sub-menu-link">Iluminación</Link></li> {/* *** CORREGIDO *** */}
				{/* Cuchillos (Outdoor): Slug en WooCommerce es navajas_cuchillos_outdoor -> CORREGIR */}
				<li><Link to="/productos/navajas_cuchillos_outdoor" className="sub-menu-link">Cuchillos</Link></li> {/* *** CORREGIDO *** */}
				{/* Pedernales: Slug en WooCommerce es pedernales -> este link está bien */}
				<li><Link to="/productos/pedernales" className="sub-menu-link">Pedernales</Link></li>
				{/* Utensilios (Outdoor): Slug en WooCommerce es utensilios -> CORREGIR */}
				<li><Link to="/productos/utensilios" className="sub-menu-link">Utensilios</Link></li> {/* *** CORREGIDO *** */}
				{/* Varios (Outdoor): Slug en WooCommerce es varios -> CORREGIR */}
				<li><Link to="/productos/varios" className="sub-menu-link">Varios</Link></li> {/* *** CORREGIDO *** */}
			</ul>
		</li>

		{/* Militar */}
		<li className="menu-item-has-children">
			{/* Militar: Slug en WooCommerce es militar -> este link está bien */}
			<Link to="/productos/militar" className="nav-link">Militar</Link>
			<ul className="sub-menu">
				{/* Pouches (Militar): Slug en WooCommerce es pouches -> CORREGIR */}
				<li><Link to="/productos/pouches" className="sub-menu-link">Pouches</Link></li> {/* *** CORREGIDO *** */}
				{/* Primera línea: Slug en WooCommerce es primera_linea -> CORREGIR */}
				<li><Link to="/productos/primera_linea" className="sub-menu-link">Primera línea</Link></li> {/* *** CORREGIDO *** */}
				{/* Complementos (Militar): Slug en WooCommerce es complementos -> CORREGIR */}
				<li><Link to="/productos/complementos" className="sub-menu-link">Complementos</Link></li> {/* *** CORREGIDO *** */}
				{/* Acceso Cefot: Slug en WooCommerce es acceso_cefot -> CORREGIR */}
				<li><Link to="/productos/acceso_cefot" className="sub-menu-link">Acceso Cefot</Link></li> {/* *** CORREGIDO *** */}
			</ul>
		</li>

		{/* Policial/Vigilante */}
		<li className="menu-item-has-children">
			{/* Policial/Vigilante: Slug en WooCommerce es policial_vigilante -> CORREGIR */}
			<Link to="/productos/policial_vigilante" className="nav-link">Policial/Vigilante</Link> {/* *** CORREGIDO *** */}
			<ul className="sub-menu">
				{/* Protección anticorte: Slug en WooCommerce es proteccion_anticorte -> CORREGIR */}
				<li><Link to="/productos/proteccion_anticorte" className="sub-menu-link">Protección anticorte</Link></li> {/* *** CORREGIDO *** */}
				{/* Grilletes (Policial): Slug en WooCommerce es grilletes-policial_vigilante -> CORREGIR */}
				<li><Link to="/productos/grilletes-policial_vigilante" className="sub-menu-link">Grilletes</Link></li> {/* *** CORREGIDO *** */}
				{/* Acceso academia: Slug en WooCommerce es acceso_academia -> CORREGIR */}
				<li><Link to="/productos/acceso_academia" className="sub-menu-link">Acceso academia</Link></li> {/* *** CORREGIDO *** */}
				{/* Defensas (Policial): Slug en WooCommerce es defensas-policial_vigilante -> CORREGIR */}
				<li><Link to="/productos/defensas-policial_vigilante" className="sub-menu-link">Defensas</Link></li> {/* *** CORREGIDO *** */}
			</ul>
		</li>

		{/* Gala y regalos */}
		{/* Gala y regalos: Slug en WooCommerce es gala_y_regalos -> CORREGIR */}
		<li><Link to="/productos/gala_y_regalos" className="nav-link">Gala y regalos</Link></li> {/* *** CORREGIDO *** */}

		{/* Enlace a Contacto */}
		{/* Este link a /contacto está bien si tienes esa ruta */}
		<li className="nav-contact-item"><Link to="/contacto" className="nav-link">Contacto</Link></li>

	</ul>
</nav>
        
             </div>
         </header>
    );
}

export default Header;