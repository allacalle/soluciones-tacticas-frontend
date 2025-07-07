// src/components/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/Header.css';
import storeLogo from '../assets/logo/header-logo.jpg';
import { getProducts } from '../api/wooApi';
import { Product } from '../types';
import { FaSearch, FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

interface NavItem {
    label: string;
    path: string;
    children?: NavItem[];
    isMegaMenu?: boolean;
    isContact?: boolean;
}

const navigationData: NavItem[] = [
    { label: 'Inicio', path: '/' },
    {
        label: 'Equipación', path: '/productos/equipacion', children: [
            { label: 'Cinturones/hebillas', path: '/productos/cinturones_hebillas' },
            { label: 'Entrenamiento', path: '/productos/entrenamiento' },
            { label: 'Equipo protección', path: '/productos/equipo_proteccion' },
            { label: 'Equipo sanitario', path: '/productos/equipo_sanitario' },
            { label: 'Fundas complementos', path: '/productos/fundas_complementos' },
            { label: 'Guantes', path: '/productos/guantes' },
            { label: 'Iluminación', path: '/productos/iluminacion_equipacion' },
            { label: 'Mochilas/bolsas', path: '/productos/mochilas_bolsas' },
            { label: 'Navajas/cuchillos', path: '/productos/navajas_cuchillos_equipacion' },
            { label: 'Pouches chaleco/cinturón', path: '/productos/pouches_chaleco_cinturon' },
        ]
    },
    {
        label: 'Armería', path: '/productos/armeria', children: [
            { label: 'Armas', path: '/productos/armas' },
            { label: 'Cargadores', path: '/productos/cargadores' },
            { label: 'Complementos armas', path: '/productos/complementos_armas' },
            { label: 'Defensas', path: '/productos/defensas_armeria' },
            { label: 'Fundas arma', path: '/productos/fundas_arma' },
            { label: 'Grilletes', path: '/productos/grilletes_armeria' },
            { label: 'Limpieza armas', path: '/productos/limpieza_armas' },
            { label: 'Spray de defensa', path: '/productos/spray_de_defensa' },
        ]
    },
    {
        label: 'Vestuario', path: '/productos/vestuario', children: [
            { label: 'Botas', path: '/productos/botas' },
            { label: 'Cabeza', path: '/productos/cabeza' },
            { label: 'Chaquetas', path: '/productos/chaquetas' },
            { label: 'Pantalones', path: '/productos/pantalones' },
        ]
    },
    {
        label: 'Outdoor/Bushcraft', path: '/productos/outdoor_bushcraft', children: [
            { label: 'Iluminación', path: '/productos/iluminacion_outdoor' },
            { label: 'Navajas/Cuchillos', path: '/productos/navajas_cuchillos_outdoor' },
            { label: 'Pedernales', path: '/productos/pedernales' },
            { label: 'Utensilios', path: '/productos/utensilios' },
            { label: 'Varios', path: '/productos/varios' },
        ]
    },
    {
        label: 'Militar', path: '/productos/militar', children: [
            { label: 'Acceso Cefot', path: '/productos/acceso_cefot' },
            { label: 'Complementos', path: '/productos/complementos' },
            { label: 'Pouches', path: '/productos/pouches' },
            { label: 'Primera línea', path: '/productos/primera_linea' },
        ]
    },
    {
        label: 'Policial/Vigilante', path: '/productos/policial_vigilante', children: [
            { label: 'Acceso academia', path: '/productos/acceso_academia' },
            { label: 'Defensas', path: '/productos/defensas_policial' },
            { label: 'Grilletes', path: '/productos/grilletes_policial' },
            { label: 'Protección anticorte', path: '/productos/proteccion_anticorte' },
        ]
    },
    { label: 'Gala y regalos', path: '/productos/gala_y_regalos' },
    { label: 'Contacto', path: '/contacto', isContact: true },
];

function Header() {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
    const searchDropdownRef = useRef<HTMLDivElement>(null);
    // Estado para controlar qué submenú está abierto en la vista móvil
    const [openMobileSubMenu, setOpenMobileSubMenu] = useState<string | null>(null);

    // Función para abrir/cerrar un submenú específico en móvil
    const handleMobileSubMenuToggle = (itemPath: string) => {
        setOpenMobileSubMenu(prevPath => (prevPath === itemPath ? null : itemPath));
    };

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?s=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm('');
            setSearchResults([]);
        }
    };

    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        const debounceTimer = setTimeout(async () => {
            try {
                const result = await getProducts({ search: searchTerm.trim(), per_page: 5 });
                setSearchResults(result.products);
            } catch (error) {
                console.error("Error fetching search suggestions:", error);
            } finally {
                setIsSearching(false);
            }
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleSuggestionClick = (productSlug: string) => {
        setSearchTerm('');
        setSearchResults([]);
        navigate(`/producto/${productSlug}`);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
                setSearchResults([]);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchDropdownRef]);

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
        // Al cerrar el menú principal, también reseteamos los submenús abiertos
        if (showMobileMenu) {
            setOpenMobileSubMenu(null);
        }
    };

    // --- FUNCIÓN DE RENDERIZADO MODIFICADA ---
    const renderNavItems = (items: NavItem[], isSubMenu = false) => {
        return items.map((item) => {
            const isMobileSubMenuOpen = openMobileSubMenu === item.path;

            return (
                <li
                    key={item.path}
                    className={
                        [
                            item.children ? 'menu-item-has-children' : '',
                            item.isContact ? 'nav-contact-item' : '',
                            isMobileSubMenuOpen ? 'mobile-submenu-open' : '', // Clase para móvil
                            activeSubMenu === item.path ? 'active' : '' // Clase para hover en escritorio
                        ].join(' ').trim()
                    }
                    onMouseEnter={() => !showMobileMenu && item.children && setActiveSubMenu(item.path)}
                    onMouseLeave={() => !showMobileMenu && setActiveSubMenu(null)}
                >
                    <div className="menu-item-wrapper">
                        <Link
                            to={item.path}
                            className={isSubMenu ? "sub-menu-link" : "nav-link"}
                            onClick={() => {
                                // Al hacer clic, cerramos el menú móvil completo y reseteamos submenús
                                setShowMobileMenu(false);
                                setOpenMobileSubMenu(null);
                            }}
                        >
                            {item.label}
                        </Link>

                        {/* Botón separado para desplegar submenús (en móvil) */}
                        {item.children && (
                            <button
                                className="submenu-toggle-button"
                                onClick={() => handleMobileSubMenuToggle(item.path)}
                                aria-label={`Desplegar submenú de ${item.label}`}
                                aria-expanded={isMobileSubMenuOpen}
                            >
                                <FaChevronDown className="nav-arrow-icon" />
                            </button>
                        )}
                    </div>

                    {/* El submenú se muestra si está activo por hover (escritorio) O por clic (móvil) */}
                    {item.children && (
                        <ul className={`sub-menu ${item.isMegaMenu ? 'mega-menu' : ''} ${activeSubMenu === item.path || isMobileSubMenuOpen ? 'open' : ''}`}>
                            {renderNavItems(item.children, true)}
                        </ul>
                    )}
                </li>
            );
        });
    };

    return (
        <header className="site-header">
            <div className="header-top-row">
                <div className="site-branding">
                    <Link to="/" className="site-title-link">
                        <img src={storeLogo} alt="Soluciones Tacticas Logo" className="site-logo" />
                    </Link>
                </div>
                <div className="header-search" ref={searchDropdownRef}>
                    <form onSubmit={handleSearchSubmit} className="search-form">
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className="search-input"
                            value={searchTerm}
                            onChange={handleSearchInputChange}
                        />
                        <button type="submit" className="search-button" aria-label="Buscar">
                            <FaSearch />
                        </button>
                    </form>
                    {(isSearching || (searchTerm.trim() && searchResults.length > 0) || (!isSearching && searchTerm.trim() && searchResults.length === 0 && document.activeElement === document.querySelector('.search-input'))) && (
                        <div className="search-suggestions-dropdown">
                            {isSearching && <div className="search-loading">Buscando...</div>}
                            {!isSearching && searchResults.length > 0 && (
                                <ul> {searchResults.map(product => (
                                    <li key={product.id} className="search-suggestion-item" onClick={() => handleSuggestionClick(product.slug)}>
                                        {product.images && product.images[0]?.src && (<img src={product.images[0].src} alt={product.name} className="suggestion-image" />)}
                                        <span className="suggestion-name">{product.name}</span>
                                    </li>))}
                                </ul>
                            )}
                            {!isSearching && searchTerm.trim() && searchResults.length === 0 && document.activeElement === document.querySelector('.search-input') && (<div className="no-results">No se encontraron resultados.</div>)}
                        </div>
                    )}
                </div>
                <div className="header-social">
                    <h3>Síguenos</h3>
                    <div className="social-icons">
                        <a href="https://www.facebook.com/soluciones.tacticas.cor?locale=es_ES" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FontAwesomeIcon icon={faFacebook} /></a>
                        <a href="https://www.instagram.com/stmaterialpolicial/?hl=es" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FontAwesomeIcon icon={faInstagram} /></a>
                        <a href="https://x.com/STacticas" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X"><FontAwesomeIcon icon={faTwitter} /></a>
                        <a href="https://wa.me/34605363660" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><FontAwesomeIcon icon={faWhatsapp} /></a>
                    </div>
                </div>
                <div className="mobile-menu-toggle">
                    <button onClick={toggleMobileMenu} aria-label="Abrir menú">
                        {showMobileMenu ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </div>
            <div className={`header-bottom-row ${showMobileMenu ? 'mobile-menu-open' : ''}`}>
                <nav className="main-navigation">
                    <ul>
                        {renderNavItems(navigationData)}
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;