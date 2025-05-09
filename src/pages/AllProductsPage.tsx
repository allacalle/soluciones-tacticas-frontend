// src/pages/AllProductsPage.tsx

// Importa los estilos CSS específicos de esta página
import	'./css/AllProductsPage.css';

import	{ useEffect, useState } from 'react';
// No necesitamos useParams en esta página
// import	{ useParams } from 'react-router-dom';

// Importa las funciones y interfaces necesarias
import	{ getProducts } from '../api/wooApi'; // No necesitamos getCategories aquí
import	{ Product } from '../types';

// Importa el componente ProductGrid
import	ProductGrid from '../components/ProductGrid'; // Asegúrate de que la ruta sea correcta


export default function AllProductsPage() { // Página para listar todos los productos
	// TODOS LOS HOOKS VAN AQUÍ ARRIBA

	// Estados para los productos
	const	[products, setProducts] = useState<Product[]>([]);
	const	[loading, setLoading] = useState<boolean>(true);
	const	[error, setError] = useState<Error | null>(null);

	// Estados para la paginación
	const	[currentPage, setCurrentPage] = useState<number>(1);
	const	[totalProducts, setTotalProducts] = useState<number>(0);
	const	[totalPages, setTotalPages] = useState<number>(0);

	// Productos por página
	const	productsPerPage = 10; // Ajusta según necesites, debe ser el mismo que en la API si quieres paginación precisa


	// *** useEffect para cargar TODOS los PRODUCTOS ***
	useEffect(() => {

		// Definición de la función asíncrona fetchProducts para llamar a la API
		const	fetchProducts = async () => {
			setLoading(true); // Empezamos a cargar productos
			setError(null); // Limpiamos errores previos
			setProducts([]); // Limpiar productos de la carga anterior
			setTotalPages(1); // Resetear total pages
			setTotalProducts(0); // Resetear total products

			try {
				// !!! Llamada a getProducts SIN categoryId, on_sale, featured, etc. !!!
				const	result = await getProducts(
					currentPage, // Usa el estado currentPage
					productsPerPage,
					undefined, // categoryId
					undefined, // searchTerm
					undefined, // orderBy
					undefined, // order
					undefined, // on_sale
					undefined, // featured
					undefined // includeIds
				);

				setProducts(result.products);
				setTotalProducts(result.total);
				setTotalPages(result.totalPages);
				console.log(`[AllProductsPage] Fetched ${result.products.length} products. Total: ${result.total}, Pages: ${result.totalPages}`);

			} catch (caughtError: unknown) {
				const	error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
				console.error(`[AllProductsPage] Error al cargar todos los productos (Página ${currentPage}):`, error); // Añadimos log de página en error
				setError(error);
				setProducts([]);
				setTotalProducts(0);
				setTotalPages(0);
			} finally {
				setLoading(false); // La carga de productos ha terminado
				console.log(`[AllProductsPage] Finished fetching all products process (Página ${currentPage})`); // Añadimos log de página
			}
		};

		fetchProducts();

		// No necesitamos resetear la página aquí, solo reaccionamos a currentPage
		// return () => { }; // Función de limpieza si es necesaria

	}, [currentPage, productsPerPage]); // Dependencias: currentPage y productsPerPage


	// ======================================================================
	// Lógica de Renderizado Condicional
	// ======================================================================

	// Muestra mensaje de carga si la carga de productos está activa
	if (loading) {
		// Usamos las clases CSS para los mensajes de estado (adaptadas para esta página)
		return	<div className="all-products-page-loading">Cargando todos los productos...</div>; // O un spinner global
	}

	// Muestra mensaje de error si hay error
	if (error) {
		// Usamos las clases CSS para los mensajes de estado
		return	<div className="all-products-page-error">Error al cargar los productos: {error.message}</div>;
	}

	// Si no se encontraron productos
	if (products.length === 0 && totalProducts === 0) {
		// Usamos las clases CSS para los mensajes de estado
		return	<div className="all-products-page-not-found">No se encontraron productos en la tienda.</div>; // Mensaje específico
	}


	// ======================================================================
	// Renderizado Final si todo cargó correctamente Y hay productos
	// ======================================================================

	return (
		// Usamos una clase CSS del contenedor principal específica para esta página
		<div className="all-products-page-container">

			{/* Título de la página */}
			<div className="page-title-block">
				<h2>Todos los Productos</h2>
			</div>

			{/* Información de paginación */}
			{/* Usamos la clase CSS para este contenedor de info (reutilizando o similar a ProductListPage) */}
			<div className="pagination-info"> {/* Asegúrate de tener esta clase en tu CSS */}
				{/* Solo mostramos info de paginación si hay productos */}
				{totalProducts > 0 && <p>Total de productos encontrados: {totalProducts}</p>}
				{totalPages > 1 && <p>Mostrando página {currentPage} de {totalPages}</p>} {/* Mostrar si hay más de 1 página */}
			</div>

			{/* Lista de productos - Solo si products.length > 0 */}
			{products.length > 0 && (
				// Clase para aplicar estilos de cuadrícula y las tarjetas de producto
				// Este div .products-display-area APLICARÁ el layout Grid para envolver
				// Asumimos que ProductGrid.css estiliza los items y este CSS padre (.all-products-page.css) estiliza el layout
				<div className="products-display-area"> {/* Este div tendrá el display: grid del CSS */}
					{/* Usamos el componente ProductGrid */}
					<ProductGrid products={products} /> {/* Le pasamos la lista de productos de la página actual */}
				</div>
			)}

			{/* Botones de paginación - Solo si hay más de una página */}
			{totalPages > 1 && (
				// Usamos la clase CSS para este contenedor de botones (reutilizando o similar a ProductListPage)
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

		</div> // Fin all-products-page-container div principal
	);
}