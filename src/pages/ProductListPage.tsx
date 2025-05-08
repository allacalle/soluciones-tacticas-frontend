// src/pages/ProductListPage.tsx

import './css/ProductListPage.css'; // Importa los estilos CSS (asegúrate de que la ruta es correcta)

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom'; // Asegúrate de que Link se importa desde 'react-router-dom'

// Importa las funciones y interfaces necesarias
import { getProducts, getCategories } from '../api/wooApi';
import { Product , Category} from '../types';


export default function ProductListPage() { // Usamos export default en la declaración de función
	// TODOS LOS HOOKS VAN AQUÍ ARRIBA, SIN CONDICIONES

	// Leemos el parámetro 'categorySlug' de la URL
	const { categorySlug } = useParams<{ categorySlug: string }>();

	// Estados para los productos
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	// Estados para las categorias (lista completa)
	const [categories, setCategories] = useState<Category[]>([]);
	const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
	// const [errorCategories, setErrorCategories] = useState<Error | null>(null); // La advertencia de TypeScript aquí es menor.

	// Estados para la paginación
	const [currentPage, setCurrentPage] = useState<number>(1); // Mantenemos el estado aquí
	const [totalProducts, setTotalProducts] = useState<number>(0);
	const [totalPages, setTotalPages] = useState<number>(0);

	// Productos por página
	const productsPerPage = 10; // Ajusta según necesites

	// *** useEffect para cargar la lista COMPLETA DE CATEGORÍAS (UNA VEZ) ***
	// Este hook se ejecuta solo una vez al montar el componente.
	useEffect(() => {
		const fetchCategories = async () => {
			setLoadingCategories(true);
			// setErrorCategories(null); // Limpiamos errores previos de categorías
			try {
				// Pedimos TODAS las categorías (con una cantidad por página alta)
				const result = await getCategories(1, 100); // Puedes ajustar per_page si tienes muchísimas categorías
				setCategories(result.categories);
			} catch (caughtError: unknown) {
				const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
				console.error("[ProductListPage] Error al cargar la lista de categorías:", error);
				// setErrorCategories(error); // Establecemos el error si ocurre
			} finally {
				setLoadingCategories(false);
			}
		};

		fetchCategories();

	}, []); 


	// *** useMemo para encontrar la categoría ACTUAL por slug (basado en la lista cargada) ***
	const currentCategory = useMemo(() => {
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
		// *** Comprobación inicial: Esperar a que las categorías terminen de cargar y que tengamos el categorySlug ***
		if (loadingCategories || !categorySlug) {
			console.log("[ProductListPage] Waiting for categories to load or categorySlug to be defined for product fetch...");
			setProducts([]); setTotalProducts(0); setTotalPages(0);
			setLoading(true); setError(null);
			return;
		}

		const primaryCategory = categories.find(cat => cat.slug === categorySlug);

		if (!primaryCategory) {
			console.warn(`[ProductListPage] Primary category not found for slug: ${categorySlug}. Cannot fetch products.`);
			setProducts([]); setTotalProducts(0); setTotalPages(0);
			setLoading(false); setError(new Error(`La categoría con slug "${categorySlug}" no fue encontrada.`));
			return;
		}

		// *** Lógica para encontrar TODAS las categorías con el MISMO NOMBRE que la categoría primaria ***
		const nameToCategories = categories.reduce((acc, cat) => {
			acc[cat.name] = acc[cat.name] || [];
			acc[cat.name].push(cat);
			return acc;
		}, {} as Record<string, Category[]>);

		const matchingCategories = nameToCategories[primaryCategory.name] || [];
		const matchingCategoryIds = matchingCategories.map(cat => cat.id);
		const categoryIdsString = matchingCategoryIds.join(',');
		console.log(`[ProductListPage] Fetching products for category IDs: ${categoryIdsString} on page ${currentPage}`); // Añadimos log de página
		// ... console.log matchingCategoryIds ...

		if (matchingCategoryIds.length === 0) {
			console.warn(`[ProductListPage] No matching category IDs found after grouping by name for slug: ${categorySlug}`);
			setProducts([]); setTotalProducts(0); setTotalPages(0);
			setLoading(false);
			setError(new Error(`Error interno al procesar categorías para "${primaryCategory.name}".`)); // Error interno
			return;
		}


		// *** Definición de la función asíncrona fetchProducts para llamar a la API ***
		const fetchProducts = async () => {
			setLoading(true); // Empezamos a cargar productos
			setError(null); // Limpiamos errores previos

			try {
				const result = await getProducts(
					currentPage, // <<< --- Usa el estado currentPage
					productsPerPage,
					categoryIdsString, // <<< --- Pasa la cadena de IDs combinados
					undefined, undefined, undefined, undefined, undefined, undefined // Resto de parámetros undefined
				);

				setProducts(result.products);
				setTotalProducts(result.total);
				setTotalPages(result.totalPages);
				console.log(`[ProductListPage] Fetched ${result.products.length} products. Total: ${result.total}, Pages: ${result.totalPages}`);

			} catch (caughtError: unknown) {
				const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
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

		fetchProducts();

		// Función de limpieza (si no tienes timeouts o cosas que limpiar aquí, puedes dejarla vacía o eliminar el return)
		return () => {
			// Lógica de limpieza si es necesaria
		};

	}, [categorySlug, currentPage, productsPerPage, categories, loadingCategories]); // <<< --- Dependencias: categorySlug, currentPage, etc.


	// *** Lógica de Renderizado Condicional (Debe estar después de todos los hooks y useMemo) ***

	// Muestra mensaje de carga si la carga de productos está activa
	if (loading) {
		// Usamos las clases CSS para los mensajes de estado
		return <div className="product-page-loading">Cargando productos...</div>; // O un spinner global
	}

	// Muestra mensaje de error si hay error
	if (error) {
		// Usamos las clases CSS para los mensajes de estado
		return <div className="product-page-error">Error al cargar productos: {error.message}</div>;
	}

	// Si no está cargando, no hay error, pero currentCategory es undefined (slug no encontró categoría)
	if (!currentCategory) {
		// Usamos las clases CSS para los mensajes de estado
		return <div className="product-page-not-found">Categoría "{categorySlug}" no encontrada.</div>;
	}

	// Si no se encontraron productos para la categoría (o grupo por nombre)
	if (products.length === 0 && totalProducts === 0) {
		// Usamos las clases CSS para los mensajes de estado
		return <div className="product-page-not-found">No se encontraron productos en la categoría "{currentCategory.name}".</div>; // Mensaje más específico
	}


	// *** Renderizado Final si todo cargó correctamente, la categoría fue encontrada Y hay productos ***
	return (
		// Usamos la clase CSS del contenedor principal para la página de lista de productos
		<div className="product-list-page-container">

			{/* NOTA: El Header y Footer normalmente se añaden en el Layout general (App.tsx o Layout.tsx) */}
			{/* <Header /> */}
			{/* <Footer /> */}


			{/* *** Título dinámico usando el nombre real de la categoría encontrada *** */}
			<h2>Productos de la categoría "{currentCategory.name}"</h2>


			{/* Información de paginación */}
			{/* Usamos la clase CSS para este contenedor de info */}
			<div className="pagination-info"> {/* Asegúrate de tener esta clase en tu CSS */}
				{/* Solo mostramos info de paginación si hay productos */}
				{totalProducts > 0 && <p>Total de productos encontrados: {totalProducts}</p>}
				{totalPages > 1 && <p>Mostrando página {currentPage} de {totalPages}</p>} {/* Mostrar si hay más de 1 página */}
			</div>

			{/* Lista de productos - Solo si products.length > 0 */}
			{products.length > 0 && (
				// Clase para aplicar estilos de cuadrícula y las tarjetas de producto
				<div className="products-display-area"> {/* Este div tendrá el display: grid del CSS */}
					{products.map((product) => (
						// Link que envuelve la tarjeta entera con la clase .product-item-link
						<Link key={product.id} to={`/producto/${product.slug}`} className="product-item-link"> {/* Clase para el enlace */}
							{/* Contenedor de la tarjeta de producto individual con la clase .product-item */}
							<div className="product-item"> {/* Clase para la tarjeta de producto individual */}
								{/* Imagen */}
								{product.images && product.images.length > 0 ? (
									<img
										src={product.images[0].src}
										alt={product.images[0].alt || product.name}
										// className="product-image" // Los estilos de la imagen dentro del item se definen en .product-item img en CSS
									/>
								) : (
									// Usar .product-item .no-image-placeholder en CSS
									<div className="no-image-placeholder">Sin Imagen</div>
								)}
								{/* Nombre y Precio */}
								{/* Usar .product-item h3 en CSS */}
								<h3 className="product-title">{product.name}</h3>
								{/* Usar .product-item p en CSS */}
								<p className="product-price">{product.price} €</p>
							</div> {/* Fin product-item */}
						</Link> // Fin Link
					))}
				</div> // Fin products-display-area
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
					{/* Mostrar número de página actual (opcional, podrías estilizarlo) */}
					<span>Página {currentPage} de {totalPages}</span> {/* Mostramos la página actual */}
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