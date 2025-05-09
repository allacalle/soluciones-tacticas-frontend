// src/pages/ProductsByBrandPage.tsx

// Importa los estilos CSS específicos de esta página
import	'./css/ProductsByBrandPage.css';

import	{ useEffect, useState } from 'react';
import	{ useParams, useNavigate } from 'react-router-dom'; // Necesitamos useParams y useNavigate

// Importa las funciones y interfaces necesarias
// Asegúrate de que getBrandBySlug y getProducts están correctamente implementadas en tu API
import	{ getProducts, getBrandBySlug } from '../api/wooApi';
import	{ Product, Brand } from '../types'; // Asegúrate de que Product y Brand están definidas en types.ts

import	ProductGrid from '../components/ProductGrid'; // Importa el componente ProductGrid


export default function ProductsByBrandPage() {
	// TODOS LOS HOOKS VAN AQUÍ ARRIBA

	// Obtiene el slug de la marca de la URL (ej: 'mi-super-marca' de /marca/mi-super-marca)
	const	{ brandSlug } = useParams<{ brandSlug?: string }>(); // brandSlug puede ser undefined si la ruta no lo tiene
	const	navigate = useNavigate(); // Para redirigir si es necesario

	// Estado para la información de la marca específica
	const	[brand, setBrand] = useState<Brand | null>(null);
	const	[loadingBrand, setLoadingBrand] = useState<boolean>(true);
	const	[errorBrand, setErrorBrand] = useState<Error | null>(null);

	// Estado para los productos de esta marca
	const	[products, setProducts] = useState<Product[]>([]);
	const	[loadingProducts, setLoadingProducts] = useState<boolean>(true);
	const	[errorProducts, setErrorProducts] = useState<Error | null>(null);

	// Estados para la paginación de productos
	const	[currentPage, setCurrentPage] = useState<number>(1);
	const	[totalProducts, setTotalProducts] = useState<number>(0);
	const	[totalPages, setTotalPages] = useState<number>(0);

	const	productsPerPage = 10; // Productos por página para el listado

	// Bandera para saber si ya intentamos cargar la marca (útil para coordinar las dos llamadas API)
	const	[brandFetched, setBrandFetched] = useState<boolean>(false);


	// *** useEffect 1: Cargar la información de la MARCA específica (una vez al montar o cambiar slug) ***
	useEffect(() => {
		if (!brandSlug) {
			// Si no hay slug en la URL, quizás redirigir o mostrar un error
			console.error("[ProductsByBrandPage] No brand slug provided in URL.");
			setErrorBrand(new Error("No se proporcionó un identificador de marca (slug) en la URL."));
			setLoadingBrand(false);
			setBrandFetched(true); // Marcar como intentado incluso si falta slug
			// Opcional: redirigir a la página de marcas
			// navigate('/marcas', { replace: true });
			return;
		}

		const	fetchBrandDetails = async () => {
			setLoadingBrand(true);
			setErrorBrand(null);
			setBrand(null);
			setBrandFetched(false); // Resetear la bandera al iniciar

			try {
				console.log(`[ProductsByBrandPage] Attempting to fetch brand with slug: ${brandSlug}`);
				const	fetchedBrand = await getBrandBySlug(brandSlug);

				if (fetchedBrand) {
					setBrand(fetchedBrand);
					console.log(`[ProductsByBrandPage] Successfully fetched brand: ${fetchedBrand.name} (ID: ${fetchedBrand.id})`);
				} else {
					// Si no se encuentra la marca con ese slug
					console.warn(`[ProductsByBrandPage] Brand with slug "${brandSlug}" not found via API.`);
					setErrorBrand(new Error(`La marca "${brandSlug}" no fue encontrada.`)); // Mensaje de "Marca no encontrada"
				}

			} catch (caughtError: unknown) {
				const	error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
				console.error(`[ProductsByBrandPage] Error fetching brand "${brandSlug}" details:`, error);
				setErrorBrand(error);
			} finally {
				setLoadingBrand(false);
				setBrandFetched(true); // Marcar que la carga de marca ha finalizado
				console.log(`[ProductsByBrandPage] Finished fetching brand details process for "${brandSlug}".`);
			}
		};

		fetchBrandDetails();

		// Dependencias: brandSlug y navigate (si se usa para redirigir)
	}, [brandSlug, navigate]);


	// *** useEffect 2: Cargar los PRODUCTOS de esta MARCA (cuando la marca esté cargada con éxito o cambie la paginación) ***
	// Este efecto depende de que el primer efecto haya terminado Y haya encontrado la marca.
	useEffect(() => {
		// Solo intentar cargar productos si la marca ya se cargó exitosamente Y tenemos su ID.
		// Si hubo error en la marca o no se encontró, el primer efecto ya manejó el estado de error general.
		if (!brandFetched || !brand || errorBrand) {
			console.log("[ProductsByBrandPage] Skipping product fetch: Brand not successfully fetched.");
			// Asegurarse de que el estado de productos refleja que no hay productos si la marca no se encontró
			if (!brand) { // Si brand es null, asegurar que los productos están vacíos y no cargando
				setLoadingProducts(false);
				setProducts([]);
				setTotalProducts(0);
				setTotalPages(0);
			}
			return;
		}

		// Si llegamos aquí, la marca (objeto 'brand') se cargó correctamente. Ahora cargamos sus productos.
		const	fetchProductsForBrand = async () => {
			setLoadingProducts(true); // Empezamos a cargar productos
			setErrorProducts(null); // Limpiamos errores previos
			setProducts([]); // Limpiar productos de la carga anterior
			setTotalPages(1); // Resetear total pages
			setTotalProducts(0); // Resetear total products

			try {
				console.log(`[ProductsByBrandPage] Attempting to fetch products for brand ID: ${brand.id} (Page: ${currentPage})`);
				// !!! Llama a getProducts PASANDO EL ID DE LA MARCA !!!
				// Asegúrate de que getProducts ha sido modificado para aceptar brandId
				const	result = await getProducts(
					currentPage,
					productsPerPage,
					undefined, // categoryId
					undefined, // searchTerm
					undefined, // orderBy
					undefined, // order
					undefined, // on_sale
					undefined, // featured
					undefined, // includeIds
					brand.id // <--- PASAMOS EL ID DE LA MARCA PARA FILTRAR
					// Si tu getProducts filtra por slug, pasarías brand.slug aquí, pero por ID es más común.
				);

				setProducts(result.products);
				setTotalProducts(result.total);
				setTotalPages(result.totalPages);
				console.log(`[ProductsByBrandPage] Fetched ${result.products.length} products for brand "${brand.name}". Total: ${result.total}, Pages: ${result.totalPages}`);

			} catch (caughtError: unknown) {
				const	error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
				console.error(`[ProductsByBrandPage] Error al cargar productos para marca "${brand.name}" (Página ${currentPage}):`, error);
				setErrorProducts(error);
				setProducts([]);
				setTotalProducts(0);
				setTotalPages(0);
			} finally {
				setLoadingProducts(false); // La carga de productos ha terminado
				console.log(`[ProductsByBrandPage] Finished fetching products process for brand "${brand.name}" (Página ${currentPage}).`);
			}
		};

		fetchProductsForBrand();

		// Dependencias: brand (para obtener el ID), currentPage, productsPerPage
		// No es necesario brandFetched o errorBrand aquí porque la condición de arriba ya los filtra
	}, [brand, brandFetched, currentPage, errorBrand, productsPerPage]);


	// Funciones para la paginación (igual que en otras páginas de listado)
	const	goToPreviousPage = () => {
		// Solo cambiamos la página si no estamos cargando productos
		if (!loadingProducts) {
			setCurrentPage(prev => Math.max(1, prev - 1));
		}
	};

	const	goToNextPage = () => {
		// Solo cambiamos la página si no estamos cargando productos
		if (!loadingProducts) {
			setCurrentPage(prev => prev + 1);
		}
	};


	// ======================================================================
	// Lógica de Renderizado Condicional
	// ======================================================================

	// Muestra mensaje de carga inicial (mientras se intenta cargar la marca por primera vez)
	if (loadingBrand && !brandFetched) {
		return	<div className="products-by-brand-loading">Cargando información de la marca...</div>;
	}

	// Muestra error si hubo un problema cargando la marca
	if (errorBrand) {
		return	<div className="products-by-brand-error">Error: {errorBrand.message}</div>;
	}

	// Si la marca no se encontró (y ya terminó de cargar y no hubo error)
	if (brandFetched && !brand && !errorBrand) {
		return	<div className="products-by-brand-not-found">La marca solicitada no existe.</div>; // Mensaje 404 para la marca
	}

	// Si la marca se cargó correctamente (ahora 'brand' NO es null)
	if (brand) {
		// Mostrar estado de carga O error SOLO si no hay productos todavía cargados
		// Si products.length > 0, mantenemos los productos anteriores visibles durante la carga de la nueva página
		if (loadingProducts && products.length === 0) {
			return	(
				<div className="products-by-brand-container">
					{/* Mostrar la información de la marca mientras cargan los productos */}
					<div className="brand-info-header">
						{brand.image ? (
							<img src={brand.image.src} alt={brand.image.alt || `Logo de ${brand.name}`} className="brand-info-image" />
						) : (
							<div className="no-brand-info-image-placeholder">{brand.name.charAt(0).toUpperCase()}</div>
						)}
						<h2>{brand.name}</h2>
						{brand.description && <div className="brand-info-description" dangerouslySetInnerHTML={{ __html: brand.description }} />}
					</div>
					<div className="products-by-brand-loading">Cargando productos de la marca {brand.name}...</div>
				</div>
			);
		}

		if (errorProducts && products.length === 0) {
			return	(
				<div className="products-by-brand-container">
					{/* Mostrar la información de la marca aunque haya error en productos */}
					<div className="brand-info-header">
						{brand.image ? (
							<img src={brand.image.src} alt={brand.image.alt || `Logo de ${brand.name}`} className="brand-info-image" />
						) : (
							<div className="no-brand-info-image-placeholder">{brand.name.charAt(0).toUpperCase()}</div>
						)}
						<h2>{brand.name}</h2>
						{brand.description && <div className="brand-info-description" dangerouslySetInnerHTML={{ __html: brand.description }} />}
					</div>
					<div className="products-by-brand-error">Error al cargar los productos de {brand.name}: {errorProducts.message}</div>
				</div>
			);
		}

		// Si la marca se encontró, pero no se encontraron productos para ella (y ya terminaron de cargar y no hubo error)
		if (!loadingProducts && products.length === 0 && totalProducts === 0) {
			return	(
				<div className="products-by-brand-container">
					{/* Mostramos la información de la marca aunque no haya productos */}
					<div className="brand-info-header">
						{brand.image ? (
							<img src={brand.image.src} alt={brand.image.alt || `Logo de ${brand.name}`} className="brand-info-image" />
						) : (
							<div className="no-brand-info-image-placeholder">{brand.name.charAt(0).toUpperCase()}</div>
						)}
						<h2>{brand.name}</h2>
						{brand.description && <div className="brand-info-description" dangerouslySetInnerHTML={{ __html: brand.description }} />}
					</div>
					<div className="products-by-brand-not-found">No se encontraron productos para la marca "{brand.name}".</div> {/* Mensaje específico */}
				</div>
			);
		}


		// ======================================================================
		// Renderizado Final si la marca se cargó correctamente Y hay productos (o se están cargando pero ya tenemos data inicial)
		// ======================================================================

		return (
			// Usamos una clase CSS del contenedor principal específica
			<div className="products-by-brand-container">

				{/* Sección de información de la marca en la parte superior */}
				<div className="brand-info-header"> {/* Asegúrate de estilizar esto en CSS */}
					{brand.image ? (
						<img src={brand.image.src} alt={brand.image.alt || `Logo de ${brand.name}`} className="brand-info-image" />
					) : (
						<div className="no-brand-info-image-placeholder">{brand.name.charAt(0).toUpperCase()}</div>
					)}
					<h2>{brand.name}</h2>
					{brand.description && <div className="brand-info-description" dangerouslySetInnerHTML={{ __html: brand.description }} />}
				</div>

			

				{/* Lista de productos - Solo si products.length > 0 */}
				{/* Mantenemos la cuadrícula visible incluso si cargando la siguiente página */}
				{(products.length > 0 || loadingProducts) && (
					// Clase para aplicar estilos de cuadrícula y las tarjetas de producto
					<div className="products-display-area"> {/* Reutilizamos esta clase para el layout Grid */}
						{/* Usamos el componente ProductGrid */}
						<ProductGrid products={products} /> {/* Le pasamos la lista de productos de la página actual */}
					</div>
				)}

				{/* Mensaje de carga de productos mientras la info de marca ya está visible */}
				{/* Esto se muestra si loadingProducts es true Y products.length es 0 */}
				{loadingProducts && products.length === 0 && (
					<div className="products-by-brand-loading">Cargando productos de la marca {brand.name}...</div>
				)}
                 {/* Mensaje de error de productos mientras la info de marca ya está visible */}
                 {/* Esto se muestra si errorProducts es true Y products.length es 0 */}
                 {errorProducts && products.length === 0 && (
                     <div className="products-by-brand-error">Error al cargar los productos: {errorProducts.message}</div>
                 )}


				{/* Botones de paginación - Solo si hay más de una página */}
				{/* Mostramos botones si hay más de 1 página Y no estamos cargando (o ya hay productos visibles) */}
				{totalPages > 1 && (!loadingProducts || products.length > 0) && (
					<div className="pagination-buttons"> {/* Reutilizamos la clase */}
						<button
							onClick={goToPreviousPage}
							disabled={currentPage === 1 || loadingProducts}
						>
							Página Anterior
						</button>
						<span>Página {currentPage} de {totalPages}</span>
						<button
							onClick={goToNextPage}
							disabled={currentPage === totalPages || loadingProducts}
						>
							Página Siguiente
						</button>
					</div>
				)}

			</div> // Fin products-by-brand-container div principal
		);
	}

	// Si llegamos aquí, algo salió mal antes de poder renderizar la marca o los productos (ej: slug falta, error inicial)
	// Los mensajes de estado iniciales (loadingBrand, errorBrand, not-found de marca) ya deberían haber sido renderizados.
	return null;
}