// src/components/Header.tsx (o src/components/Header.jsx)
//import React from 'react';
import { Link } from 'react-router-dom'; // Necesitamos Link para la navegación
import './css/Header.css'; // <-- Añade esta línea


function Header() {
    // ... código anterior (sección superior del header, búsqueda, redes) ...

    return (
        <header className="site-header">
            {/* Fila Superior del Header (Logo, Búsqueda, Redes) - Mantén el código anterior */}
            <div className="header-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#f8f8f8' }}>
                {/* ... código del logo, nombre, búsqueda, redes ... */}
                 {/* Ejemplo de Sección del Logo y Nombre (Enlace a Home) */}
                <div className="site-branding">
                    <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>
                         {/* <img src="/path/to/your/logo.png" alt="Soluciones Tacticas Logo" style={{ height: '40px', verticalAlign: 'middle', marginRight: '10px' }} /> */}
                        <span className="site-title" style={{ fontWeight: 'bold', fontSize: '1.5em', verticalAlign: 'middle' }}>Soluciones Tacticas</span>
                    </Link>
                </div>
                 {/* Sección de la Barra de Búsqueda */}
                <div className="header-search">
                        <input type="text" placeholder="Buscar productos..." style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                {/* Sección de Redes Sociales */}
                <div className="header-social">
                    <a href="https://www.facebook.com/tupagina" target="_blank" rel="noopener noreferrer" style={{ marginRight: '10px' }}>Facebook</a>
                    <a href="https://www.instagram.com/tuperfil" target="_blank" rel="noopener noreferrer" style={{ marginRight: '10px' }}>Instagram</a>
                    <a href="https://wa.me/TUNUMERO" target="_blank" rel="noopener noreferrer">WhatsApp</a>
                </div>
            </div>

            {/* Fila Inferior del Header: Navegación Principal */}
            <div className="header-bottom-row" style={{ backgroundColor: '#333', padding: '0 20px' }}> {/* Padding vertical 0 para que el padding lo controle el li */}
                <nav className="main-navigation">
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex' }}>

                        {/* Enlace a Inicio */}
                        <li style={{ marginRight: '20px', padding: '10px 0' }}> {/* Añadimos padding aquí */}
                            <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Inicio</Link>
                        </li>

                        {/* *** ESTRUCTURA DE CATEGORÍAS Y SUBCATEGORÍAS *** */}

                        {/* Categoría Principal: Equipación */}
                        <li className="menu-item-has-children" style={{ marginRight: '20px', position: 'relative', padding: '10px 0' }}> {/* position: relative es clave para el dropdown absoluto */}
                             <Link to="/productos/equipacion" style={{ color: '#fff', textDecoration: 'none' }}>Equipación</Link> {/* Enlace a la categoría padre */}
                             {/* Submenú Desplegable de Equipación */}
                             {/* Este ul inicialmente estará oculto y se mostrará con CSS/JS al pasar el ratón o hacer clic */}
                             <ul className="sub-menu" style={{
                                 listStyle: 'none', padding: '10px 0', margin: 0,
                                 position: 'absolute', top: '100%', left: 0, // Posiciona el submenú debajo del padre
                                 backgroundColor: '#444', // Fondo del submenú
                                 minWidth: '200px', // Ancho mínimo del submenú
                                 zIndex: 100, // Asegura que esté por encima de otros contenidos
                             }}>
                                 <li><Link to="/productos/iluminacion" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Iluminación</Link></li>
                                 <li><Link to="/productos/equipo-sanitario" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Equipo sanitario</Link></li>
                                 <li><Link to="/productos/pouches-chaleco-cinturon" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Pouches chaleco/cinturón</Link></li>
                                  <li><Link to="/productos/cinturones-hebillas" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Cinturones/hebillas</Link></li>
                                   <li><Link to="/productos/mochilas-bolsas" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Mochilas/bolsas</Link></li>
                                    <li><Link to="/productos/equipo-proteccion" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Equipo protección</Link></li>
                                     <li><Link to="/productos/guantes" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Guantes</Link></li>
                                      <li><Link to="/productos/navajas-cuchillos" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Navajas/cuchillos</Link></li>
                                       <li><Link to="/productos/entrenamiento" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Entrenamiento</Link></li>
                                        <li><Link to="/productos/fundas-complementos" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Fundas complementos</Link></li>
                             </ul>
                        </li>

                        {/* Categoría Principal: Armería */}
                        <li className="menu-item-has-children" style={{ marginRight: '20px', position: 'relative', padding: '10px 0' }}>
                            <Link to="/productos/armeria" style={{ color: '#fff', textDecoration: 'none' }}>Armería</Link>
                            {/* Submenú Desplegable de Armería */}
                             <ul className="sub-menu" style={{
                                 listStyle: 'none', padding: '10px 0', margin: 0,
                                 position: 'absolute', top: '100%', left: 0,
                                 backgroundColor: '#444',
                                 minWidth: '200px',
                                 zIndex: 100,
                                  
                             }}>
                                 <li><Link to="/productos/spray-defensa" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Spray de defensa</Link></li>
                                  <li><Link to="/productos/complementos-armas" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Complementos armas</Link></li>
                                   <li><Link to="/productos/armas" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Armas</Link></li>
                                    <li><Link to="/productos/defensas" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Defensas</Link></li>
                                     <li><Link to="/productos/limpieza-armas" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Limpieza armas</Link></li>
                                      <li><Link to="/productos/grilletes" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Grilletes</Link></li>
                                       <li><Link to="/productos/fundas-arma" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Fundas arma</Link></li>
                                        <li><Link to="/productos/cargadores" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Cargadores</Link></li>
                             </ul>
                        </li>

                        {/* Categoría Principal: Vestuario */}
                        <li className="menu-item-has-children" style={{ marginRight: '20px', position: 'relative', padding: '10px 0' }}>
                             <Link to="/productos/vestuario" style={{ color: '#fff', textDecoration: 'none' }}>Vestuario</Link>
                              {/* Submenú Desplegable de Vestuario */}
                             <ul className="sub-menu" style={{
                                 listStyle: 'none', padding: '10px 0', margin: 0,
                                 position: 'absolute', top: '100%', left: 0,
                                 backgroundColor: '#444',
                                 minWidth: '200px',
                                 zIndex: 100,
                             }}>
                                 <li><Link to="/productos/pantalones" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Pantalones</Link></li>
                                  <li><Link to="/productos/botas" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Botas</Link></li>
                                   <li><Link to="/productos/chaquetas" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Chaquetas</Link></li>
                                    <li><Link to="/productos/cabeza" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Cabeza</Link></li>
                             </ul>
                        </li>

                         {/* Categoría Principal: Outdoor/Bushcraft */}
                        <li className="menu-item-has-children" style={{ marginRight: '20px', position: 'relative', padding: '10px 0' }}>
                             <Link to="/productos/outdoor-bushcraft" style={{ color: '#fff', textDecoration: 'none' }}>Outdoor/Bushcraft</Link>
                              {/* Submenú Desplegable */}
                             <ul className="sub-menu" style={{ listStyle: 'none', padding: '10px 0', margin: 0, position: 'absolute', top: '100%', left: 0, backgroundColor: '#444', minWidth: '200px', zIndex: 100 }}>
                                 <li><Link to="/productos/cuchillos-outdoor" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Cuchillos</Link></li>
                                 <li><Link to="/productos/pedernales" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Pedernales</Link></li>
                                 <li><Link to="/productos/utensilios-outdoor" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Utensilios</Link></li>
                                 <li><Link to="/productos/iluminacion-outdoor" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Iluminación</Link></li>
                                 <li><Link to="/productos/varios-outdoor" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Varios</Link></li>
                             </ul>
                        </li>

                        {/* Categoría Principal: Militar */}
                         <li className="menu-item-has-children" style={{ marginRight: '20px', position: 'relative', padding: '10px 0' }}>
                             <Link to="/productos/militar" style={{ color: '#fff', textDecoration: 'none' }}>Militar</Link>
                              {/* Submenú Desplegable */}
                             <ul className="sub-menu" style={{ listStyle: 'none', padding: '10px 0', margin: 0, position: 'absolute', top: '100%', left: 0, backgroundColor: '#444', minWidth: '200px', zIndex: 100}}>
                                 <li><Link to="/productos/pouches-militar" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Pouches</Link></li>
                                 <li><Link to="/productos/primera-linea" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Primera línea</Link></li>
                                 <li><Link to="/productos/complementos-militar" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Complementos</Link></li>
                                 <li><Link to="/productos/acceso-cefot" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Acceso Cefot</Link></li>
                             </ul>
                        </li>

                         {/* Categoría Principal: Policial/Vigilante */}
                         <li className="menu-item-has-children" style={{ marginRight: '20px', position: 'relative', padding: '10px 0' }}>
                             <Link to="/productos/policial-vigilante" style={{ color: '#fff', textDecoration: 'none' }}>Policial/Vigilante</Link>
                              {/* Submenú Desplegable */}
                             <ul className="sub-menu" style={{ listStyle: 'none', padding: '10px 0', margin: 0, position: 'absolute', top: '100%', left: 0, backgroundColor: '#444', minWidth: '200px', zIndex: 100 }}>
                                 <li><Link to="/productos/proteccion-anticorte" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Protección anticorte</Link></li>
                                  <li><Link to="/productos/grilletes-policial" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Grilletes</Link></li>
                                   <li><Link to="/productos/acceso-academia" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Acceso academia</Link></li>
                                    <li><Link to="/productos/defensas-policial" style={{ color: '#fff', textDecoration: 'none', padding: '8px 20px', display: 'block' }}>Defensas</Link></li>
                             </ul>
                        </li>


                         {/* Categoría Principal: Gala y regalos */}
                         {/* Asumiendo que esta no tiene submenú, es un enlace directo */}
                         <li style={{ marginRight: '20px', padding: '10px 0' }}>
                             <Link to="/productos/gala-regalos" style={{ color: '#fff', textDecoration: 'none' }}>Gala y regalos</Link>
                         </li>


                        {/* Enlace a Contacto (asumiendo una ruta /contacto) */}
                         {/* Usamos marginLeft: 'auto' para empujarlo a la derecha si el flexbox lo permite */}
                        <li style={{ marginLeft: 'auto', padding: '10px 0' }}>
                            <Link to="/contacto" style={{ color: '#fff', textDecoration: 'none' }}>Contacto</Link>
                        </li>

                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;