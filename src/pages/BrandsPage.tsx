// src/pages/BrandsPage.tsx

// Importa los estilos CSS específicos de esta página
import	'./css/BrandsPage.css';

import	{ useEffect, useState } from 'react';
import	{ Link } from 'react-router-dom'; // Necesitamos Link para enlazar a las páginas de productos por marca

// Importa las funciones y interfaces necesarias
import	{ getBrands } from '../api/wooApi'; // Importa la función para obtener marcas
import	{ Brand } from '../types'; // Importa la interfaz Brand

// NO necesitamos importar ProductGrid en esta página principal


export default function BrandsPage() { // Página para listar todas las marcas
	// TODOS LOS HOOKS VAN AQUÍ ARRIBA

	// Estados para las marcas
	const	[brands, setBrands] = useState<Brand[]>([]);
	const	[loading, setLoading] = useState<boolean>(true);
	const	[error, setError] = useState<Error | null>(null);

	// No solemos paginar la lista de marcas, pero getBrands la soporta
	// Si tienes muchísimas marcas, podrías implementar paginación aquí también.
	// const	[currentPage, setCurrentPage] = useState<number>(1);
	// const	[totalBrands, setTotalBrands] = useState<number>(0);
	// const	[totalPages, setTotalPages] = useState<number>(0);

	const	perPage = 100; // Cantidad de marcas a obtener (ajústalo si tienes más)


	// *** useEffect para cargar la lista de MARCAS ***
	useEffect(() => {

		// Definición de la función asíncrona fetchBrands para llamar a la API
		const	fetchBrands = async () => {
			setLoading(true); // Empezamos a cargar marcas
			setError(null); // Limpiamos errores previos
			setBrands([]); // Limpiar marcas

			try {
				// !!! Llamada a getBrands !!!
				// Usamos los parámetros por defecto de paginación (página 1, 100 por página)
				const	result = await getBrands(1, perPage);

				// Opcional: filtrar marcas sin productos asociados si la API lo indica y quieres ocultarlas
				// const	filteredBrands = result.brands.filter(brand => brand.count > 0);

				// Opcional: ordenar las marcas alfabéticamente
				const	sortedBrands = result.brands.sort((a, b) => a.name.localeCompare(b.name));


				setBrands(sortedBrands);
				// Si implementas paginación para marcas, actualiza los estados de paginación aquí
				// setTotalBrands(result.total);
				// setTotalPages(result.totalPages);
				console.log(`[BrandsPage] Fetched ${sortedBrands.length} brands.`);

			} catch (caughtError: unknown) {
				const	error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
				console.error("[BrandsPage] Error al cargar las marcas:", error);
				setError(error);
				setBrands([]);
				// setTotalBrands(0); // Resetear si hay paginación
				// setTotalPages(0); // Resetear si hay paginación
			} finally {
				setLoading(false); // La carga de marcas ha terminado
				console.log("[BrandsPage] Finished fetching brands process.");
			}
		};

		fetchBrands();

		// Este efecto solo se ejecuta una vez al montar el componente (array de dependencias vacío)
	}, []); // Dependencias: array vacío para que se ejecute solo al montar


	// ======================================================================
	// Lógica de Renderizado Condicional
	// ======================================================================

	// Muestra mensaje de carga si la carga está activa
	if (loading) {
		// Usamos clases CSS para los mensajes de estado (adaptadas para esta página)
		return	<div className="brands-page-loading">Cargando marcas...</div>; // O un spinner global
	}

	// Muestra mensaje de error si hay error
	if (error) {
		// Usamos clases CSS para los mensajes de estado
		return	<div className="brands-page-error">Error al cargar las marcas: {error.message}</div>;
	}

	// Si no se encontraron marcas
	if (brands.length === 0) {
		// Usamos clases CSS para los mensajes de estado
		return	<div className="brands-page-not-found">No se encontraron marcas disponibles.</div>; // Mensaje específico
	}


	// ======================================================================
	// Renderizado Final si todo cargó correctamente Y hay marcas
	// ======================================================================

	return (
		// Usamos una clase CSS del contenedor principal específica para esta página
		<div className="brands-page-container">

			{/* Título de la página */}
			<div className='page-title-block'>
				<h2>Nuestras Marcas</h2>
			</div>

			{/* Área donde se mostrarán las marcas en una cuadrícula/lista */}
			{/* Este div .brands-list-area APLICARÁ el layout Grid o Flexbox */}
			<div className="brands-list-area">

				{/* Mapeamos sobre la lista de marcas para mostrar cada una */}
				{brands.map((brand) => (
					// Cada ítem es un enlace a la página de productos de esa marca
					// Asumimos una ruta como /marca/:brandSlug
					<Link key={brand.id} to={`/marca/${brand.slug}`} className="brand-item-link">
						{/* Contenedor de la tarjeta individual de marca */}
						<div className="brand-item">
							{/* Imagen/Icono de la Marca o Placeholder */}
							{brand.image ? (
								<img
									src={brand.image.src}
									alt={brand.image.alt || `Logo de la marca ${brand.name}`}
									className="brand-image" // Clase para que el CSS estilice
								/>
							) : (
								// Si no hay imagen, mostramos un placeholder o solo el nombre
								<div className="no-brand-image-placeholder"> {/* Clase para el placeholder */}
									{/* Puedes mostrar la primera letra o un icono genérico */}
									{brand.name.charAt(0).toUpperCase()}
								</div>
							)}

							{/* Nombre de la Marca */}
							<h3 className="brand-name">{brand.name}</h3> {/* Clase para estilizar */}

							{/* Opcional: Pequeña descripción si quieres mostrarla en la tarjeta */}
							{/* {brand.description && <p className="brand-description">{brand.description}</p>} */}

							{/* Opcional: Número de productos si quieres mostrarlo */}
							{/* {brand.count > 0 && <p className="brand-count">{brand.count} productos</p>} */}

						</div> {/* Cierre de brand-item */}
					</Link> // Cierre del Link
				))}

			</div> {/* Cierre de brands-list-area */}

			{/* NOTA: No suele haber paginación para la lista de marcas, a menos que sea muy larga */}

		</div> // Fin brands-page-container div principal
	);
}