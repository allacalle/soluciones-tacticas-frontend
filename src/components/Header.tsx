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
            navigate(`/productos/${productSlug}`); // *** Asegúrate de que tu ruta de producto individual usa /productos/:slug ***
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
        <nav className="main-navigation"> {/* Clase para la navegación */}
        <ul> {/* Lista principal de navegación */}

            <li> {/* Elemento de lista */}
                <Link to="/" className="nav-link">Inicio</Link> {/* Clase para enlaces de navegación */}
            </li>

 {/* *** ESTRUCTURA DE CATEGORÍAS Y SUBCATEGORÍAS *** */}

{/* Categoría Principal: Equipación */}
            <li className="menu-item-has-children"> {/* Clase para items con submenú */}
                <Link to="/productos/equipacion" className="nav-link">Equipación</Link> {/* Enlace categoría padre */}
            {/* Submenú Desplegable de Equipación */}
                         <ul className="sub-menu"> {/* Clase para el submenú */}
                                <li><Link to="/productos/iluminacion" className="sub-menu-link">Iluminación</Link></li> {/* Clase para enlaces de submenú */}
                                <li><Link to="/productos/equipo-sanitario" className="sub-menu-link">Equipo sanitario</Link></li>
                                <li><Link to="/productos/pouches-chaleco-cinturon" className="sub-menu-link">Pouches chaleco/cinturón</Link></li>
                                <li><Link to="/productos/mochilas-bolsas" className="sub-menu-link">Mochilas/bolsas</Link></li>
                                <li><Link to="/productos/equipo-proteccion" className="sub-menu-link">Equipo protección</Link></li>
                                <li><Link to="/productos/guantes" className="sub-menu-link">Guantes</Link></li>
                                <li><Link to="/productos/navajas-cuchillos" className="sub-menu-link">Navajas/cuchillos</Link></li>
                                <li><Link to="/productos/entrenamiento" className="sub-menu-link">Entrenamiento</Link></li>
                                <li><Link to="/productos/fundas-complementos" className="sub-menu-link">Fundas complementos</Link></li>
                            </ul>
                         </li>

                    {/* Categoría Principal: Armería */}
                         <li className="menu-item-has-children"> {/* Clase para items con submenú */}
                             <Link to="/productos/armeria" className="nav-link">Armería</Link> {/* Enlace categoría padre */}
                         {/* Submenú Desplegable de Armería */}
                            <ul className="sub-menu"> {/* Clase para el submenú */}
                                <li><Link to="/productos/spray-defensa" className="sub-menu-link">Spray de defensa</Link></li>
                                <li><Link to="/productos/complementos-armas" className="sub-menu-link">Complementos armas</Link></li>
                                <li><Link to="/productos/armas" className="sub-menu-link">Armas</Link></li>
                                <li><Link to="/productos/defensas" className="sub-menu-link">Defensas</Link></li>
                                <li><Link to="/productos/limpieza-armas" className="sub-menu-link">Limpieza armas</Link></li>
                                <li><Link to="/productos/grilletes" className="sub-menu-link">Grilletes</Link></li>
                                <li><Link to="/productos/fundas-arma" className="sub-menu-link">Fundas arma</Link></li>
                                <li><Link to="/productos/cargadores" className="sub-menu-link">Cargadores</Link></li>
                            </ul>
                        </li>

                         {/* Categoría Principal: Vestuario */}
                         <li className="menu-item-has-children"> {/* Clase para items con submenú */}
                         <Link to="/productos/vestuario" className="nav-link">Vestuario</Link> {/* Enlace categoría padre */}
                         {/* Submenú Desplegable de Vestuario */}
                             <ul className="sub-menu"> {/* Clase para el submenú */}
                                <li><Link to="/productos/pantalones" className="sub-menu-link">Pantalones</Link></li>
                                <li><Link to="/productos/botas" className="sub-menu-link">Botas</Link></li>
                                <li><Link to="/productos/chaquetas" className="sub-menu-link">Chaquetas</Link></li>
                                <li><Link to="/productos/cabeza" className="sub-menu-link">Cabeza</Link></li>
                            </ul>
                        </li>

                        {/* Categoría Principal: Outdoor/Bushcraft */}
                         <li className="menu-item-has-children"> {/* Clase para items con submenú */}
                             <Link to="/productos/outdoor-bushcraft" className="nav-link">Outdoor/Bushcraft</Link> {/* Enlace categoría padre */}
                             {/* Submenú Desplegable */}
                             <ul className="sub-menu"> {/* Clase para el submenú */}
                                <li><Link to="/productos/cuchillos-outdoor" className="sub-menu-link">Cuchillos</Link></li>
                                <li><Link to="/productos/pedernales" className="sub-menu-link">Pedernales</Link></li>
                                <li><Link to="/productos/utensilios-outdoor" className="sub-menu-link">Utensilios</Link></li>
                                <li><Link to="/productos/iluminacion-outdoor" className="sub-menu-link">Iluminación</Link></li>
                                <li><Link to="/productos/varios-outdoor" className="sub-menu-link">Varios</Link></li>
                            </ul>
                         </li>

                             {/* Categoría Principal: Militar */}
                        <li className="menu-item-has-children"> {/* Clase para items con submenú */}
                         <Link to="/productos/militar" className="nav-link">Militar</Link> {/* Enlace categoría padre */}
                        {/* Submenú Desplegable */}
                         <ul className="sub-menu"> {/* Clase para el submenú */}
                            <li><Link to="/productos/pouches-militar" className="sub-menu-link">Pouches</Link></li>
                            <li><Link to="/productos/primera-linea" className="sub-menu-link">Primera línea</Link></li>
                            <li><Link to="/productos/complementos-militar" className="sub-menu-link">Complementos</Link></li>
                            <li><Link to="/productos/acceso-cefot" className="sub-menu-link">Acceso Cefot</Link></li>
                        </ul>
                    </li>

                        {/* Categoría Principal: Policial/Vigilante */}
                        <li className="menu-item-has-children"> {/* Clase para items con submenú */}
                            <Link to="/productos/policial-vigilante" className="nav-link">Policial/Vigilante</Link> {/* Enlace categoría padre */}
                         {/* Submenú Desplegable */}
                             <ul className="sub-menu"> {/* Clase para el submenú */}
                                <li><Link to="/productos/proteccion-anticorte" className="sub-menu-link">Protección anticorte</Link></li>
                                <li><Link to="/productos/grilletes-policial" className="sub-menu-link">Grilletes</Link></li>
                                <li><Link to="/productos/acceso-academia" className="sub-menu-link">Acceso academia</Link></li>
                                <li><Link to="/productos/defensas-policial" className="sub-menu-link">Defensas</Link></li>
                            </ul>
                        </li>


                        {/* Categoría Principal: Gala y regalos */}
                        {/* Asumiendo que esta no tiene submenú, es un enlace directo */}
                        <li> {/* Elemento de lista */}
                             <Link to="/productos/gala-regalos" className="nav-link">Gala y regalos</Link> {/* Clase para enlace */}
                        </li>


                        {/* Enlace a Contacto (asumiendo una ruta /contacto) */}
                        {/* Usamos marginLeft: 'auto' para empujarlo a la derecha si el flexbox lo permite */}
                        <li className="nav-contact-item"> {/* Clase para el item de contacto */}
                         <Link to="/contacto" className="nav-link">Contacto</Link> {/* Clase para enlace */}
                        </li>

                    </ul>
                </nav>
             </div>
         </header>
    );
}

export default Header;