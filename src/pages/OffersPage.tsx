// src/pages/OffersPage.tsx

import  { useEffect, useState } from 'react';
import './css/OffersPage.css'; // Importa los estilos para esta página
import { Product } from '../types'; // Importa el tipo Product (asegúrate de que la ruta sea correcta)
import ProductGrid from '../components/ProductGrid'; // Importa el componente ProductGrid (asegúrate de que la ruta sea correcta)

import { getProducts } from '../api/wooApi' // <<< Importa la funci\u00F3n getProducts



function OffersPage() {
	const [offerProducts, setOfferProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

		useEffect(() => {
		// *** Lógica CORREGIDA para cargar SOLO los productos en oferta usando getProducts ***

		const fetchOffers = async () => {
			setLoading(true);
			setError(null);
			try {
				// *** Llama directamente a tu funci\u00F3n getProducts de wooApi.ts ***
				// *** P\u00E1sale el par\u00E1metro on_sale: true para obtener solo las ofertas ***
				const data = await getProducts(1, 10, undefined, undefined, undefined, undefined, true); // Adjusted to match expected parameters

				// getProducts ya devuelve el array de productos en data.products
				setOfferProducts(data.products);

				// TODO: Si quieres implementar paginaci\u00F3n, usa data.total y data.totalPages.

			} catch (e: unknown) { // Manejo de errores robusto para 'unknown'
				const error = e instanceof Error ? e : new Error(String(e));
				console.error("Error al cargar ofertas:", error);
				setError("No se pudieron cargar las ofertas."); // Mensaje de error amigable
			} finally {
				setLoading(false);
			}
		};

		fetchOffers();

	}, []); // Dependencias: s\u00F3lo se ejecuta al montar el componente.


	return (
		// Usamos el contenedor común de página definido en pageLayout.css
        <div className="page-container">
			{/* Bloque de Título de la Página (Estilo Banner Verde Oscuro) */}
			{/* Usamos la clase page-title-block de pageLayout.css */}
			<div className="page-title-block">
				<h2>Ofertas</h2> {/* Título específico para la página de Ofertas */}
			</div>

			{/* Área de visualización de productos - Usará el layout Grid definido en OffersPage.css */}
			{/* El componente ProductGrid renderizará las tarjetas individuales */}
			{loading && <p className="page-loading">Cargando ofertas...</p>} {/* Clase genérica para mensaje de carga */}
			{error && <p className="page-error">Error: {error}</p>} {/* Clase genérica para mensaje de error */}

			{/* Muestra la cuadrícula de productos si no hay carga/error y hay productos */}
			{!loading && !error && offerProducts.length > 0 && (
				 // La clase products-display-area aplica el layout Grid desde OffersPage.css
				<div className="products-display-area">
					{/* Pasamos la lista de productos en oferta al componente ProductGrid */}
					<ProductGrid products={offerProducts} />
				</div>
			)}

			{/* Mensaje si no se encuentran ofertas */}
			 {!loading && !error && offerProducts.length === 0 && (
				<p className="page-empty">No hay ofertas disponibles en este momento.</p> 
			)}

			{/* TODO: Añadir Paginación aquí si esperas muchas ofertas */}
			{/* La paginación requeriría lógica y estado adicional */}

		</div> // Cierra page-container
	);
}

export default OffersPage;