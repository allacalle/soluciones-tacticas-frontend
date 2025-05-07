// src/pages/ProductListPage.tsx

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

// Importa las funciones y interfaces necesarias
import { getProducts, getCategories } from '../api/wooApi';
import { Product , Category} from '../types';


function ProductListPage() {
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
	const [errorCategories, setErrorCategories] = useState<Error | null>(null);

	// Estados para la paginación
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalProducts, setTotalProducts] = useState<number>(0);
	const [totalPages, setTotalPages] = useState<number>(0);

	// Productos por página
	const productsPerPage = 10; // Ajusta según necesites

	// *** useEffect para cargar la lista COMPLETA DE CATEGORÍAS (UNA VEZ) ***
	// Este hook se ejecuta solo una vez al montar el componente.
	useEffect(() => {
		const fetchCategories = async () => {
			setLoadingCategories(true);
			setErrorCategories(null);
			try {
				// Pedimos TODAS las categorías (con una cantidad por página alta)
				const result = await getCategories(1, 100); // Puedes ajustar per_page si tienes muchísimas categorías
				setCategories(result.categories);
			} catch (caughtError: unknown) {
				const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
				console.error("[ProductListPage] Error al cargar la lista de categorías:", error);
				setErrorCategories(error);
			} finally {
				setLoadingCategories(false);
			}
		};

		fetchCategories();

	}, []); // <--- Array de dependencias vacío: []


	// *** useMemo para encontrar la categoría ACTUAL por slug (basado en la lista cargada) ***
	// Se recalcula solo si categories o categorySlug cambian
	const currentCategory = useMemo(() => {
		// Asegurarnos de tener categories cargadas y categorySlug
		if (!categories.length || !categorySlug) {
			return undefined; // No hemos cargado categorías o no hay slug en la URL
		}
		// Busca la categoría en la lista por el slug de la URL
		return categories.find(cat => cat.slug === categorySlug);
	}, [categories, categorySlug]); // Dependencias: categories (la lista), categorySlug (de la URL)


	// *** useEffect para cargar los PRODUCTOS, agrupando por nombre de categoría ***
	// Este hook depende del slug de la URL, la página actual, la cantidad por página, Y la lista de categorías cargada.
	useEffect(() => {
		// *** Comprobación inicial: Esperar a que las categorías estén cargadas y que tengamos un categorySlug ***
		if (!categories.length || loadingCategories || !categorySlug) {
			console.log("[ProductListPage] Waiting for categories to load or categorySlug to be defined...");
			// Limpiar estados de productos mientras esperamos
			setProducts([]);
			setTotalProducts(0);
			setTotalPages(0);
			setLoading(true); // Indicamos que estamos esperando (estado de carga)
			setError(null); // Limpiamos errores previos
			return; // Salimos del efecto hasta que las dependencias estén listas
		}

		// *** Si llegamos aquí, significa que las categorías están cargadas y tenemos el categorySlug ***

		// 1. Encontrar la categoría "primaria" usando el slug de la URL
		const primaryCategory = categories.find(cat => cat.slug === categorySlug);

		// Si la categoría primaria no fue encontrada por el slug (a pesar de tener la lista cargada)
		if (!primaryCategory) {
			console.warn(`[ProductListPage] Primary category not found for slug: ${categorySlug}`);
			setProducts([]); setTotalProducts(0); setTotalPages(0); setLoading(false); setError(new Error(`La categoría con slug "${categorySlug}" no fue encontrada.`));
			return; // Salimos, no podemos buscar productos sin una categoría válida
		}

		// 2. Encontrar TODAS las categorías (en toda la lista 'categories') que tienen el MISMO NOMBRE que la categoría primaria
		const matchingCategoryIds = categories
			.filter(cat => cat.name === primaryCategory.name) // Filtramos: solo categorías con el mismo Nombre EXACTO
			.map(cat => cat.id); // Mapeamos: obtenemos solo sus IDs

		console.log(`[ProductListPage] Found ${matchingCategoryIds.length} categories with name "${primaryCategory.name}". IDs:`, matchingCategoryIds);

		// Si no encontramos IDs coincidentes (debería encontrar al menos la de la URL)
		if (matchingCategoryIds.length === 0) {
			console.warn(`[ProductListPage] No matching categories found by name for slug: ${categorySlug}`);
			setProducts([]); setTotalProducts(0); setTotalPages(0); setLoading(false); setError(new Error(`No se encontraron categorías con el nombre "${primaryCategory.name}".`));
			return; // Salimos, no hay IDs de categorías para buscar productos
		}

		// 3. Convertir la lista de IDs a una cadena separada por comas para la llamada a la API
		const categoryIdsString = matchingCategoryIds.join(',');
		console.log("[ProductListPage] Fetching products for category IDs:", categoryIdsString);


		// *** Definición de la función asíncrona fetchProducts para llamar a la API ***
		const fetchProducts = async () => {
			setLoading(true); // Empezamos a cargar productos
			setError(null); // Limpiamos errores previos

			try {
				// *** LLAMADA A getProducts - PASANDO LA CADENA DE IDs COMBINADOS ***
				// getProducts(page, per_page, category, search, orderby, order, on_sale, featured, includeIds)
				// Le pasamos la cadena categoryIdsString (ej: "15,22,30") al 3er argumento 'category'
				const result = await getProducts(currentPage, productsPerPage, categoryIdsString, undefined, undefined, undefined, undefined, undefined, undefined);

				setProducts(result.products);
				setTotalProducts(result.total);
				setTotalPages(result.totalPages);
				console.log(`[ProductListPage] Fetched ${result.products.length} products. Total: ${result.total}, Pages: ${result.totalPages}`);

			} catch (caughtError: unknown) {
				const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
				console.error(`[ProductListPage] Error al cargar productos para categoría(s) '${categoryIdsString}':`, error);
				setError(error);
				setProducts([]);
				setTotalProducts(0);
				setTotalPages(0);
			} finally {
				setLoading(false); // La carga de productos ha terminado
				console.log(`[ProductListPage] Finished fetching products for category IDs: ${categoryIdsString}`);
			}
		};

		// *** Llamar a la función fetchProducts para iniciar la carga ***
		fetchProducts();

		// Función de limpieza (si no tienes timeouts o cosas que limpiar aquí, puedes dejarla vacía o eliminar el return)
		return () => {
			// Lógica de limpieza si es necesaria (ej: cancelar una petición fetch si fuera posible)
		};

	}, [categorySlug, currentPage, productsPerPage, categories, loadingCategories]); // <-- Dependencias finales: se re-ejecuta si cambia el slug, página, por_página, o si la lista de categorías termina de cargar.


	// *** Lógica de Renderizado Condicional (Debe estar después de todos los hooks y useMemo) ***

	// Muestra mensaje de carga si cualquiera de las cargas está activa
	// Mantenemos loadingCategories aquí para el mensaje inicial "Cargando..."
	if (loading || loadingCategories) {
		return <div>Cargando...</div>; // O un spinner global
	}

	// Muestra mensaje de error si hay error en productos o categorías
	if (error || errorCategories) {
		// Si errorCategories ocurre, el currentCategory useMemo puede ser undefined, así que mostramos solo el error.
		// Si solo hay error de productos (y currentCategory sí se encontró), podríamos ser más específicos.
		return <div>Error: {error?.message || errorCategories?.message}</div>;
	}

	// Si no se encontró la categoría por el slug de la URL (y ya terminamos de cargar categorías sin error)
	// Esto maneja el caso de un slug inválido en la URL
	if (!currentCategory) { // No necesitamos !loadingCategories aquí porque ya salimos arriba si loadingCategories es true
		return <div>Categoría "{categorySlug}" no encontrada.</div>;
	}


	// *** Renderizado Final si todo cargó correctamente y la categoría fue encontrada ***
	return (
		<div>
			{/* *** Título dinámico usando el nombre real de la categoría encontrada *** */}
			{/* currentCategory ya no es undefined aquí debido a la comprobación anterior */}
			<h2>Productos de la categoría "{currentCategory.name}"</h2>


			{/* Información de paginación */}
			<div style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
				<p>Total de productos encontrados: {totalProducts}</p>
				{/* Solo mostramos info de paginación si hay productos o si el totalProducts es > 0 */}
				{totalProducts > 0 && <p>Mostrando página {currentPage} de {totalPages}</p>}
				{totalProducts === 0 && !loading && !error && <p>No se encontraron productos en esta categoría.</p>}
			</div>

			{/* Lista de productos - Solo si products.length > 0 */}
			{products.length > 0 && (
				// *** Clase para aplicar estilos de cuadrícula (asegúrate de que esté en tu CSS) ***
				<div className="products-display-area"> {/* Asegúrate de tener esta clase en tu CSS */}
					{products.map((product) => (
						// *** Link a la página de producto individual (usa /producto/) ***
						<Link key={product.id} to={`/producto/${product.slug}`} className="product-item-link"> {/* Clase para el enlace */}
							{/* Contenedor del item de producto (tarjeta) */}
							<div className="product-item"> {/* Clase para la tarjeta de producto individual */}
								{/* Imagen */}
								{product.images && product.images.length > 0 ? (
									<img
										src={product.images[0].src}
										alt={product.images[0].alt || product.name}
										className="product-image"
									/>
								) : (
									<div className="no-image-placeholder">Sin Imagen</div>
								)}
								{/* Nombre y Precio */}
								<h3 className="product-title">{product.name}</h3>
								<p className="product-price">{product.price} €</p>
							</div> {/* Fin product-item */}
						</Link> // Fin Link
					))}
				</div> // Fin products-display-area
			)}

			{/* Mensaje si no hay productos Y no estamos cargando Y no hay error */}
			{products.length === 0 && !loading && !error && totalProducts === 0 && (
				<p>No se encontraron productos en esta categoría.</p>
			)}


			{/* Botones de paginación - Solo si hay más de una página */}
			{totalPages > 1 && (
				<div style={{ marginTop: '20px', textAlign: 'center' }}>
					<button
						onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
						disabled={currentPage === 1 || loading}
						style={{ marginRight: '10px', padding: '8px 15px', cursor: (currentPage === 1 || loading) ? 'not-allowed' : 'pointer' }}
					>
						Página Anterior
					</button>
					{/* Mostrar número de página actual */}
					<span>Página {currentPage} de {totalPages}</span>
					<button
						onClick={() => setCurrentPage(prev => prev + 1)}
						disabled={currentPage === totalPages || loading}
						style={{ marginLeft: '10px', padding: '8px 15px', cursor: (currentPage === totalPages || loading) ? 'not-allowed' : 'pointer' }}
					>
						Página Siguiente
					</button>
				</div>
			)}

		</div> // Fin div principal
	);
}

export default ProductListPage;