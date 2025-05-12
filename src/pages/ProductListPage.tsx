// src/pages/ProductListPage.tsx

// Importa los estilos CSS (asegúrate de que la ruta es correcta)
import	'./css/ProductListPage.css';


import	{ useEffect, useState, useMemo } from 'react';
import	{ useParams } from 'react-router-dom';
// *** Elimina la importación de Link si ya no la usas directamente aquí ***
// ProductGrid lo usa internamente.
// import	{ Link } from 'react-router-dom';

// Importa las funciones y interfaces necesarias
import	{ getProducts, getCategories } from '../api/wooApi';
import	{ Product , Category} from '../types';

// *** IMPORTA EL COMPONENTE ProductGrid ***
import	ProductGrid from '../components/ProductGrid'; // Asegúrate de que la ruta sea correcta


export default function ProductListPage() { // Usamos export default en la declaración de función
	// TODOS LOS HOOKS VAN AQUÍ ARRIBA, SIN CONDICIONES

	// Leemos el parámetro 'categorySlug' de la URL
	const	{ categorySlug } = useParams<{ categorySlug: string }>();

	// Estados para los productos
	const	[products, setProducts] = useState<Product[]>([]);
	const	[loading, setLoading] = useState<boolean>(true);
	const	[error, setError] = useState<Error | null>(null);

	// Estados para las categorias (lista completa)
	const	[categories, setCategories] = useState<Category[]>([]);
	const	[loadingCategories, setLoadingCategories] = useState<boolean>(true);
	// const	[errorCategories, setErrorCategories] = useState<Error | null>(null); // La advertencia de TypeScript aquí es menor.

	// Estados para la paginación
	const	[currentPage, setCurrentPage] = useState<number>(1); // Mantenemos el estado aquí
	const	[totalProducts, setTotalProducts] = useState<number>(0);
	const	[totalPages, setTotalPages] = useState<number>(0);

	// Productos por página
	const	productsPerPage = 8; // Ajusta según necesites

	// *** useEffect para cargar la lista COMPLETA DE CATEGORÍAS (UNA VEZ) ***
	// Este hook se ejecuta solo una vez al montar el componente.
	useEffect(() => {
		const	fetchCategories = async () => {
			setLoadingCategories(true);
			// setErrorCategories(null); // Limpiamos errores previos de categorías
			try {
				// Pedimos TODAS las categorías (con una cantidad por página alta)
				const	result = await getCategories(1, 100); // Puedes ajustar per_page si tienes muchísimas categorías
				setCategories(result.categories);
			} catch (caughtError: unknown) {
				const	error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
				console.error("[ProductListPage] Error al cargar la lista de categorías:", error);
				// setErrorCategories(error); // Establecemos el error si ocurre
			} finally {
				setLoadingCategories(false);
			}
		};

		fetchCategories();

	}, []);


	// *** useMemo para encontrar la categoría ACTUAL por slug (basado en la lista cargada) ***
	const	currentCategory = useMemo(() => {
		// Asegurarnos de tener categories cargadas y categorySlug
		if (!categories.length || !categorySlug) {
			return undefined; // No hemos cargado categorías o no hay slug en la URL
		}
		// Busca la categoría en la lista por el slug de la URL
		return categories.find(cat => cat.slug === categorySlug);
	}, [categories, categorySlug]); // Dependencias: categories (la lista), categorySlug (de la URL)


	// *** NUEVO useEffect para resetear la página actual cuando el slug de la categoría cambia ***
	// Este efecto se ejecuta cada vez que categorySlug cambia, reseteando currentPage a 1.
	useEffect(() => {
		console.log("[ProductListPage] categorySlug changed. Resetting currentPage to 1.");
		setCurrentPage(1); // <<< --- Aquí reseteamos la página
		// Nota: Este efecto se ejecutará antes del efecto de carga de productos (si categorySlug es la única dependencia cambiante)
		// asegurando que currentPage ya sea 1 cuando se dispare el fetch.
	}, [categorySlug]); // <<< --- Dependencia: categorySlug


	// *** useEffect para cargar los PRODUCTOS (cuando cambian categorySlug, currentPage, etc.) ***
	// Este hook ahora reacciona al cambio de currentPage (que el efecto de arriba maneja cuando cambia el slug)
	useEffect(() => {
		// Comprobación para salir si la categoría no se encontró después de cargar la lista completa
		if (categorySlug && currentCategory === undefined && categories.length > 0) {
			console.warn(`[ProductListPage] Category not found for slug: ${categorySlug} after categories loaded.`);
			setLoading(false);
			setError(new Error(`No se encontró la categoría con el slug: "${categorySlug}"`));
			setProducts([]);
			setTotalPages(1);
			setTotalProducts(0);
			return;
		}

		// Comprobación inicial: Esperar a que las categorías terminen de cargar y que tengamos el categorySlug si es necesario
		if (loadingCategories || (categorySlug && currentCategory === undefined)) {
			console.log("[ProductListPage] Waiting for categories to load or category to be found...");
			setLoading(true); setError(null); setProducts([]); setTotalPages(0); setTotalProducts(0);
			return;
		}

		// Si categorySlug está presente y currentCategory se encontró, proceed
		// Si categorySlug NO está presente, asumimos que no se debe cargar nada hasta que haya un slug válido
		// (Aunque la ruta está diseñada para tener un slug, esta verificación es robusta)
		if (!categorySlug && categories.length > 0) {
			console.log("[ProductListPage] No category slug in URL.");
			setLoading(false); setError(null); setProducts([]); setTotalPages(0); setTotalProducts(0);
			return;
		}


		// *** Lógica para encontrar TODAS las categorías con el MISMO NOMBRE que la categoría primaria ***
		// (Esta lógica parece específica de tu implementación para agrupar categorías por nombre)
		// Asegúrate de que `categories` está cargada antes de intentar agrupar.
		const	nameToCategories = categories.reduce((acc, cat) => {
			acc[cat.name] = acc[cat.name] || [];
			acc[cat.name].push(cat);
			return acc;
		}, {} as Record<string, Category[]>);

		const	primaryCategory = categories.find(cat => cat.slug === categorySlug);
		const	matchingCategories = primaryCategory ? nameToCategories[primaryCategory.name] || [] : [];
		const	matchingCategoryIds = matchingCategories.map(cat => cat.id);
		const	categoryIdsString = matchingCategoryIds.join(',');

		console.log(`[ProductListPage] Fetching products for category IDs: ${categoryIdsString} on page ${currentPage}`);


		// Manejo de caso donde no hay IDs de categoría coincidentes después del agrupamiento
		if (categorySlug && matchingCategoryIds.length === 0 && categories.length > 0) {
			console.warn(`[ProductListPage] No matching category IDs found after grouping by name for slug: ${categorySlug}. Cannot fetch products.`);
			setProducts([]); setTotalProducts(0); setTotalPages(0);
			setLoading(false);
			// Puedes establecer un error aquí si lo consideras un fallo, o simplemente mostrar "No productos"
			// setError(new Error(`Error interno al procesar categorías para "${primaryCategory?.name}".`)); // Error interno
			return; // Salir del useEffect ya que no hay IDs para buscar
		}


		// *** Definición de la función asíncrona fetchProducts para llamar a la API ***
		const	fetchProducts = async () => {
			setLoading(true); // Empezamos a cargar productos
			setError(null); // Limpiamos errores previos
			setProducts([]); // Limpiar productos de la carga anterior
			setTotalPages(1); // Resetear total pages

			try {
				const	result = await getProducts(
					currentPage, // <<< --- Usa el estado currentPage
					productsPerPage,
					categoryIdsString, // <<< --- Pasa la cadena de IDs combinados (si existe)
					undefined, undefined, undefined, undefined, undefined, undefined // Resto de parámetros undefined
				);

				setProducts(result.products);
				setTotalProducts(result.total);
				setTotalPages(result.totalPages);
				console.log(`[ProductListPage] Fetched ${result.products.length} products. Total: ${result.total}, Pages: ${result.totalPages}`);

			} catch (caughtError: unknown) {
				const	error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
				console.error(`[ProductListPage] Error al cargar productos para categoría(s) '${categoryIdsString}' (Página ${currentPage}):`, error); // Añadimos log de página en error
				setError(error);
				setProducts([]);
				setTotalProducts(0);
				setTotalPages(0);
			} finally {
				setLoading(false); // La carga de productos ha terminado
				console.log(`[ProductListPage] Finished fetching products process for category IDs: ${categoryIdsString} (Página ${currentPage})`); // Añadimos log de página
			}
		};

		// Solo llamar a fetchProducts si hay categorySlug Y IDs de categoría para buscar (después de agrupar)
		if (categorySlug && matchingCategoryIds.length > 0) {
			fetchProducts();
		}


	}, [categorySlug, currentPage, productsPerPage, categories, currentCategory, loadingCategories]); // <<< --- Dependencias clave: categories añadida


	// *** Lógica de Renderizado Condicional ***

	if (loading) {
		// Usamos las clases CSS para los mensajes de estado
		return	<div className="product-page-loading">Cargando productos...</div>; // O un spinner global
	}

	if (error) {
		// Usamos las clases CSS para los mensajes de estado
		return	<div className="product-page-error">Error al cargar productos: {error.message}</div>;
	}

	// Si no está cargando, no hay error, pero currentCategory es undefined (slug no encontró categoría)
	// Solo hacer esta verificación si las categorías ya cargaron para evitar "Categoría no encontrada" mientras cargan
	if (!loadingCategories && !currentCategory) {
		return	<div className="product-page-not-found">Categoría "{categorySlug}" no encontrada.</div>;
	}


	// Si no se encontraron productos para la categoría (o grupo por nombre) Y currentCategory sí se encontró
	// Esto cubre el caso de una categoría válida pero sin productos.
	if (products.length === 0 && totalProducts === 0 && currentCategory) {
		return	<div className="product-page-not-found">No se encontraron productos en la categoría "{currentCategory.name}".</div>; // Mensaje más específico
	}


	// *** Renderizado Final si todo cargó correctamente, la categoría fue encontrada Y hay productos ***
	// (Este bloque solo se ejecutará si hay productos para mostrar)
	return (
		// Usamos la clase CSS del contenedor principal para la página de lista de productos
		<div className="product-list-page-container">

			{/* NOTA: El Header y Footer normalmente se añaden en el Layout general (App.tsx o Layout.tsx) */}

			{/* *** Título dinámico usando el nombre real de la categoría encontrada *** */}
			{/* Solo muestra el título si currentCategory existe */}
			<div className='page-title-block'>
				{currentCategory && <h2>{currentCategory.name}</h2>}
			</div>

		

			{/* Lista de productos - Solo si products.length > 0 */}
			{products.length > 0 && (
				// Clase para aplicar estilos de cuadrícula y las tarjetas de producto
				// Este div .products-display-area APLICARÁ el layout Grid para envolver Y LOS ESTILOS DE CADA ITEM
				<div className="products-display-area"> {/* Este div tendrá el display: grid del CSS */}
					{/* !!! USAMOS EL COMPONENTE ProductGrid aquí !!! */}
					{/* ProductGrid solo renderiza los ítems que recibe (estructura). El layout (Grid) y LOS ESTILOS DE ITEM (.product-item, etc.) los ponen el contenedor padre (.products-display-area y ProductListPage.css). */}
					<ProductGrid products={products} /> {/* Le pasamos la lista de productos de la página actual */}
				</div>
			)}

			{/* Ya manejamos el caso de 0 productos válidos arriba con el mensaje de "No se encontraron productos..." */}

			{/* Botones de paginación - Solo si hay más de una página */}
			{totalPages > 1 && (
				// Usamos la clase CSS para este contenedor de botones
				<div className="pagination-buttons"> {/* Asegúrate de tener esta clase en tu CSS */}
					<button
						onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
						disabled={currentPage === 1 || loading}
						// Los estilos de los botones vendrán del CSS .pagination-buttons button
					>
						Página Anterior
					</button>
					{/* Mostrar número de página actual */}
					<span>Página {currentPage} de {totalPages}</span>
					<button
						onClick={() => setCurrentPage(prev => prev + 1)}
						disabled={currentPage === totalPages || loading}
						// Los estilos de los botones vendrán del CSS .pagination-buttons button
					>
						Página Siguiente
					</button>
				</div>
			)}

		</div> // Fin product-list-page-container div principal
	);
}