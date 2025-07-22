// src/components/Footer.test.tsx

// 1. IMPORTACIONES
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from './Footer';

// 2. "describe" - AGRUPADOR DE TESTS
describe('Footer Component', () => {
  // 3. "beforeEach" - FUNCIÓN DE SETUP
  beforeEach(() => {
    // Renderizamos el componente aquí para que esté disponible en cada test de este grupo
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
  });

  // 4. "it" o "test" - NUESTRO PRIMER CASO DE PRUEBA
  it('should render the copyright notice with the current year', () => {
    // 5. PREPARACIÓN (ARRANGE)
    const currentYear = new Date().getFullYear();
    const storeName = "Soluciones Tácticas";
    // Creamos el texto exacto que esperamos encontrar o una parte de él
    const copyrightText = `© ${currentYear} ${storeName}. Todos los derechos reservados.`;

    // 6. ACTUACIÓN (ACT)
    // En este test, la actuación es simplemente buscar el elemento.
    // screen.getByText() busca un elemento que contenga el texto que le pasamos.
    // Si no lo encuentra, el test falla automáticamente.
    const copyrightElement = screen.getByText(copyrightText);

    // 7. ASERCIÓN (ASSERT)
    // expect() es la función de aserción. Le pasamos el elemento que encontramos.
    // .toBeInTheDocument() es un "matcher". Verifica que el elemento realmente existe en el DOM.
    expect(copyrightElement).toBeInTheDocument();
  });

   // 1. "it.each" - ESTRUCTURA PARA TESTS REPETITIVOS
  it.each([
    { name: 'Todos los Productos', path: '/productos' },
    { name: 'Categorías', path: '/categorias' },
    { name: 'Marcas', path: '/marcas' },
    { name: 'Ofertas', path: '/ofertas' },
    { name: 'Quiénes Somos', path: '/quienes-somos' },
    { name: 'Contacto', path: '/contacto' },
    { name: 'Política de Privacidad', path: '/politica-privacidad' },
    { name: 'Términos y Condiciones', path: '/terminos-condiciones' },
    { name: 'Política de Cookies', path: '/politica-cookies' },
  ])('should render the link "$name" with the correct path "$path"', ({ name, path }) => {
    // 2. ACTUACIÓN (ACT)
    // Buscamos el enlace por su "nombre accesible", que en este caso es su texto visible.
    // Usamos una expresión regular (con /.../i) para que no sea sensible a mayúsculas/minúsculas.
    const linkElement = screen.getByRole('link', { name: new RegExp(name, 'i') });

    // 3. ASERCIÓN (ASSERT)
    // Verificamos dos cosas:
    // 3.1. Que el enlace esté en el documento.
    expect(linkElement).toBeInTheDocument();
    
    // 3.2. Que el atributo 'href' del enlace apunte a la ruta correcta.
    // React Router convierte <Link to="/ruta"> en <a href="/ruta"> en el DOM.
    expect(linkElement).toHaveAttribute('href', path);
  });

  // --- NUEVO TEST PARA REDES SOCIALES ---
  it.each([
    { label: 'Facebook', href: 'https://www.facebook.com/soluciones.tacticas.cor?locale=es_ES' },
    { label: 'Instagram', href: 'https://www.instagram.com/stmaterialpolicial/?hl=es' },
    { label: 'Twitter/X', href: 'https://x.com/STacticas' },
    { label: 'WhatsApp', href: 'https://wa.me/34605363660' },
  ])('should render the external social link for "$label"', ({ label, href }) => {
    // 1. ACTUACIÓN (ACT)
    // Buscamos el enlace por su "nombre accesible". Como tus enlaces son solo iconos,
    // el 'aria-label' que pusiste es la forma correcta de encontrarlos.
    const linkElement = screen.getByRole('link', { name: label });

    // 2. ASERCIÓN (ASSERT)
    // Verificamos que el enlace existe.
    expect(linkElement).toBeInTheDocument();

    // Verificamos que apunta a la URL externa correcta.
    expect(linkElement).toHaveAttribute('href', href);

    // Verificamos que se abre en una nueva pestaña, una buena práctica para enlaces externos.
    expect(linkElement).toHaveAttribute('target', '_blank');

    // Opcional pero recomendado: Verificar el atributo 'rel' por seguridad.
    // Tu código ya lo tiene, así que podemos testearlo.
    expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
  });

    // --- NUEVO TEST PARA ENLACES DE CONTACTO ---
  it('should render correctly formatted contact links for mobile and email', () => {
    
    // =======================================================
    // FASE 1: PREPARACIÓN (Arrange)
    // =======================================================
    // Definimos los datos que esperamos encontrar.
    const mobileNumberText = '605 36 36 60';
    const emailAddressText = 'stmaterialpolicial@gmail.com';
    
    // Definimos los 'href' que esperamos que tengan los enlaces.
    // El 'href' para un teléfono debe empezar con 'tel:' y sin espacios.
    // El 'href' para un email debe empezar con 'mailto:'.
    const expectedMobileHref = 'tel:+34605363660';
    const expectedEmailHref = 'mailto:stmaterialpolicial@gmail.com';


    // =======================================================
    // FASE 2: ACTUACIÓN (Act)
    // =======================================================
    // Buscamos los enlaces en la pantalla por el texto que muestran al usuario.
    const mobileLinkElement = screen.getByRole('link', { name: mobileNumberText });
    const emailLinkElement = screen.getByRole('link', { name: emailAddressText });


    // =======================================================
    // FASE 3: COMPROBACIÓN (Assert)
    // =======================================================
    // Comprobamos que ambos enlaces existen.
    expect(mobileLinkElement).toBeInTheDocument();
    expect(emailLinkElement).toBeInTheDocument();

    // Comprobamos que el atributo 'href' de cada enlace es el correcto.
    expect(mobileLinkElement).toHaveAttribute('href', expectedMobileHref);
    expect(emailLinkElement).toHaveAttribute('href', expectedEmailHref);
  });

  // --- NUEVO TEST PARA EL LOGO ---
  it('should display the company logo that links to the homepage', () => {
    
    // =======================================================
    // FASE 1: PREPARACIÓN (Arrange)
    // =======================================================
    // Definimos el "nombre accesible" de la imagen, que es su texto 'alt'.
    // Esto es lo que un lector de pantalla le diría a un usuario con discapacidad visual.
    const logoAltText = /soluciones tácticas logo/i; // Expresión regular para ser flexible
    const expectedHomepagePath = '/';

    
    // =======================================================
    // FASE 2: ACTUACIÓN (Act)
    // =======================================================
    // Buscamos la imagen por su rol de 'img' y su nombre accesible (el texto 'alt').
    const logoImage = screen.getByRole('img', { name: logoAltText });

    // También, para encontrar el enlace, podemos buscar un enlace que contenga nuestra imagen.
    // O podemos navegar desde la imagen a su enlace padre.
    const logoLink = logoImage.closest('a'); // closest('a') busca el ancestro 'a' más cercano.


    // =======================================================
    // FASE 3: COMPROBACIÓN (Assert)
    // =======================================================
    // 1. Comprobamos que la imagen del logo está en el documento.
    expect(logoImage).toBeInTheDocument();

    // 2. Comprobamos que el enlace que envuelve al logo también existe.
    // 'toBeTruthy()' es una forma de decir "espero que esto no sea null o undefined".
    expect(logoLink).toBeTruthy();

    // 3. Comprobamos que el enlace del logo apunta a la página de inicio.
    expect(logoLink).toHaveAttribute('href', expectedHomepagePath);
  });


});