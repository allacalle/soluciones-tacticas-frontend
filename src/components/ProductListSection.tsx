// src/components/ProductListSection.tsx

// Importa los estilos de la sección y el layout Flexbox (QUE TAMBIÉN TENDRÁN LOS ESTILOS DE ITEM)
import './css/ProductListSection.css';

import { useEffect, useState } from 'react';
// *** Elimina la importación de Link si ya no la usas directamente aquí ***
// ProductGrid lo usa internamente.
// import { Link } from 'react-router-dom';


// Importa la función para obtener productos y la interfaz Product
import { getProducts } from '../api/wooApi';
import { Product } from '../types';
// *** IMPORTA EL COMPONENTE ProductGrid ***
import ProductGrid from './ProductGrid'; // Asegúrate de que la ruta de importación sea correcta


// Define las propiedades que aceptará el componente
interface ProductListSectionProps {
	title: string;
	subtitle?: string;
	type: 'latest' | 'popular' | 'sale' | 'featured' | 'category' | 'ids';
	categoryId?: number;
	productIds?: number[];
	productsPerPage?: number;
}

// Define el componente funcional
function ProductListSection({ title, subtitle, type, categoryId, productIds, productsPerPage = 10 }: ProductListSectionProps) {

	// Estados locales para los productos y el estado de carga/error
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);


	// *** useEffect para cargar los productos para ESTA sección ***
	useEffect(() => {
		const fetchProducts = async () => {
			setLoading(true);
			setError(null);

			try {
				let productsData: Product[] = [];
				let result;

				// Lógica para LLAMAR a getProducts basándose en el 'type' de la prop
				switch (type) {
					case 'latest': {
						result = await getProducts(1, productsPerPage, undefined, undefined, 'date', 'desc', undefined, undefined, undefined);
						productsData = result.products;
						break;
					}
					case 'popular': {
						result = await getProducts(1, productsPerPage, undefined, undefined, 'popularity', 'desc', undefined, undefined, undefined);
						productsData = result.products;
						break;
					}
					case 'sale': {
						result = await getProducts(1, productsPerPage, undefined, undefined, 'date', 'desc', true, undefined, undefined);
						productsData = result.products;
						break;
					}
					case 'featured': {
						result = await getProducts(1, productsPerPage, undefined, undefined, undefined, undefined, undefined, true, undefined);
						productsData = result.products;
						break;
					}
					case 'category': {
						if (categoryId !== undefined) {
							// Convierte categoryId a string si la API lo espera
							result = await getProducts(1, productsPerPage, categoryId.toString(), undefined, undefined, undefined, undefined, undefined, undefined);
							productsData = result.products;
						} else {
							throw new Error(`El componente ProductListSection con type='category' requiere la prop 'categoryId'. Título: ${title}`);
						}
						break;
					}
					case 'ids': {
						if (productIds && productIds.length > 0) {
							result = await getProducts(1, productsPerPage, undefined, undefined, undefined, undefined, undefined, undefined, productIds);
							productsData = result.products;
						} else {
							console.warn(`[ProductListSection] Componente con type='ids' pero sin 'productIds'. Título: ${title}`);
							productsData = [];
						}
						break;
					}
					default: {
						throw new Error(`Tipo de lista de productos desconocido en ProductListSection: '${type}'. Título: ${title}`);
					}
				}

				setProducts(productsData);

			} catch (caughtError: unknown) {
				const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
				console.error(`[ProductListSection] Error al cargar productos para tipo '${type}' (Título: ${title}):`, error);
				setError(error);
				setProducts([]);
			} finally {
				setLoading(false);
			}
		};

		fetchProducts();

	}, [type, categoryId, productIds, productsPerPage, title]);


	// ======================================================================
	// Renderizado (Return JSX) - USANDO ProductGrid (estructura) dentro de .products-display-area (layout Flexbox + estilos de item)
	// ======================================================================

	return (
		// Contenedor principal de la sección de lista de productos
		<section className="product-list-section">
			{/* Banner o título de la sección */}
			<div className="section-banner">
				<h2>{title}</h2>
				{subtitle && <p>{subtitle}</p>}
			</div>

			{/* Área donde se mostrarán los productos o los mensajes de estado */}
			{/* Este div .products-display-area APLICARÁ el layout Flexbox con scroll horizontal Y LOS ESTILOS DE CADA ITEM */}
			<div className="products-display-area">

				{/* Renderizado Condicional: Muestra mensajes de estado */}
				{loading && <div className="product-list-loading">Cargando productos...</div>}
				{!loading && error && <div className="product-list-error">Error al cargar productos: {error.message}</div>}
				{!loading && !error && products.length === 0 && <div className="product-list-empty">No se encontraron productos en esta sección.</div>}


				{/* !!! USAMOS EL COMPONENTE ProductGrid aquí !!! */}
				{/* ProductGrid solo renderiza los ítems que recibe (estructura HTML). El layout (flexbox) y LOS ESTILOS DE ITEM (.product-item, etc.) los pone el contenedor padre (.products-display-area y ProductListSection.css). */}
				{!loading && !error && products.length > 0 && (
					<ProductGrid products={products} /> 
				)}

			</div> {/* Cierre de products-display-area */}

		</section> // Cierre de product-list-section
	);
}

export default ProductListSection;