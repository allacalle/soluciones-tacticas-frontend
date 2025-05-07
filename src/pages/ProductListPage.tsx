// src/pages/ProductListPage.tsx

import { useEffect, useState, useMemo } from 'react'; // *** Importa useMemo ***
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

// *** Importa las funciones y interfaces necesarias ***
import { getProducts, getCategories } from '../api/wooApi';
import { Product , Category} from '../types';


function ProductListPage() {
	// *** TODOS LOS HOOKS VAN AQUÍ ARRIBA, SIN CONDICIONES ***

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
	const productsPerPage = 10; // O 100 si lo tenías así

	// *** useEffect para cargar los PRODUCTOS DE LA CATEGORÍA ACTUAL ***
	// Este hook usa categorySlug y currentPage como dependencias.
	useEffect(() => {
		// Opcional: Validar si categorySlug existe (la ruta lo garantiza, pero buena práctica)
		if (!categorySlug) {
			setError(new Error("No se especificó una categoría en la URL."));
			setLoading(false);
			setProducts([]); // Asegurar que la lista esté vacía si no hay slug
			setTotalProducts(0);
			setTotalPages(0);
			return;
		}

		// No reseteamos currentPage a 1 aquí si el slug cambia, para evitar doble fetch
		// La dependencia en categorySlug asegura que se vuelve a pedir la pág 1 si cambias de cat
		// Si quieres resetear la página a 1 al cambiar de categoría, la lógica de reset (comentada antes) iría aquí, pero manejada cuidadosamente.
		// Por simplicidad, la dependencia en categorySlug ya pide la página 1 cuando el slug *cambia* (porque currentPage inicialmente es 1)


		const fetchProducts = async () => {
			setLoading(true);
			setError(null);

			console.log(`[ProductListPage] Fetching products for category slug: ${categorySlug} (Page ${currentPage})`);

			try {
				const result = await getProducts(currentPage, productsPerPage, categorySlug, undefined, undefined, undefined, undefined, undefined, undefined);

				setProducts(result.products);
				setTotalProducts(result.total);
				setTotalPages(result.totalPages);

			} catch (caughtError: unknown) {
				const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
				console.error(`[ProductListPage] Error al cargar productos para categoría '${categorySlug}':`, error);
				setError(error);
				setProducts([]);
				setTotalProducts(0);
				setTotalPages(0);
			} finally {
				setLoading(false);
				console.log(`[ProductListPage] Finished fetching products for category slug: ${categorySlug}`);
			}
		};

		fetchProducts();

	}, [categorySlug, currentPage, productsPerPage]); // Dependencias: categorySlug, currentPage, productsPerPage


	// *** useEffect para cargar la lista COMPLETA DE CATEGORÍAS (UNA VEZ) ***
	// Este hook no tiene dependencias.
	useEffect(() => {
		const fetchCategories = async () => {
			setLoadingCategories(true);
			setErrorCategories(null);
			try {
				const result = await getCategories(1, 100); // Ajusta per_page si tienes muchas categorías
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
		return categories.find(cat => cat.slug === categorySlug);
	}, [categories, categorySlug]); // Dependencias: categories (la lista), categorySlug (de la URL)


	// *** Lógica de Renderizado Condicional (VIENE DESPUÉS DE TODOS LOS HOOKS Y useMemo) ***

	// Muestra mensaje de carga si cualquiera de las cargas está activa
	if (loading || loadingCategories) {
		// Puedes mostrar un mensaje más específico si quieres, pero con un solo loading es suficiente
		return <div>Cargando...</div>; // O un spinner global
	}

	// Muestra mensaje de error si hay error en productos o categorías
	if (error || errorCategories) {
		return <div>Error: {error?.message || errorCategories?.message}</div>;
	}

	// Si no se encontró la categoría por el slug de la URL (y no hay error de carga)
	// Esto maneja el caso de un slug inválido en la URL
	if (!currentCategory && !loadingCategories) {
		// Solo mostramos este mensaje si terminamos de cargar categorías Y no encontramos el slug
		return <div>Categoría "{categorySlug}" no encontrada.</div>;
	}


	// *** Renderizado Final si todo cargó correctamente y la categoría fue encontrada ***
	return (
		<div>
			{/* *** Título dinámico usando el nombre real de la categoría encontrada *** */}
			{/* currentCategory ya no es undefined aquí debido a la comprobación anterior */}
			<h2>Productos de la categoría "{currentCategory?.name}"</h2> {/* Usamos ?.name por seguridad, aunque no debería ser undefined aquí */}


			{/* Información de paginación */}
			<div style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
				<p>Total de productos encontrados: {totalProducts}</p>
				{/* Solo mostramos info de paginación si hay productos o si el totalProducts es > 0 */}
				{totalProducts > 0 && <p>Mostrando página {currentPage} de {totalPages}</p>}
				{totalProducts === 0 && !loading && !error && <p>No se encontraron productos en esta categoría.</p>} {/* Mensaje si totalProducts es 0 */}
			</div>

			{/* Lista de productos - Solo si products.length > 0 */}
			{products.length > 0 && (
				// *** Clase para aplicar estilos de cuadrícula (asegúrate de que esté en tu CSS) ***
				// Asegúrate de tener los estilos para products-display-area, product-item-link, product-item, etc. en tu ProductListPage.css
				<div className="products-display-area">
					{products.map((product) => (
						// *** Link a la página de producto individual (usa /producto/) ***
						// Asegúrate de tener la importación: import { Link } from 'react-router-dom';
						<Link key={product.id} to={`/producto/${product.slug}`} className="product-item-link"> {/* CORREGIDO a /producto/ */}
							{/* Contenedor del item de producto (tarjeta) */}
							<div className="product-item">
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