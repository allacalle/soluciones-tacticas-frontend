// src/components/ProductGrid.tsx

import { Link } from 'react-router-dom'; // Necesitamos Link para enlazar a la página de producto individual

// *** Importa los estilos CSS del ITEM. ESTO ES CLAVE. ***
import	'./css/ProductGrid.css';


import { Product } from '../types'; // Importa la interfaz Product

// Define las propiedades que acepta ProductGrid: solo la lista de productos
interface ProductGridProps {
	products: Product[];
}

function ProductGrid({ products }: ProductGridProps) {

	// Si no hay productos, devuelve null (el padre maneja el mensaje de lista vacía)
	if (!products || products.length === 0) {
		return	null;
	}

	// !!! ProductGrid AHORA SOLO RENDERIZA LA ESTRUCTURA HTML CON CLASES. !!!
	// Los estilos de ITEM (apariencia) están en ProductGrid.css y se aplican porque este archivo lo importa.
	// Los estilos de LAYOUT (flex/grid) estarán en el CSS de los componentes padre (ProductListSection.css, ProductListPage.css).

	return (
		<> {/* Usamos Fragment para no añadir un div extra innecesario si no se necesita un wrapper */}
			{/* Mapeamos sobre la lista de productos para mostrar cada uno */}
			{products.map(product => (
				// Cada ítem es un enlace a la página del producto individual
				// Usamos el slug del producto para la URL
				// Las clases product-item-link y product-item se mantienen para que ProductGrid.css pueda estilizar
				<Link key={product.id} to={`/producto/${product.slug}`} className="product-item-link">
					{/* Contenedor de la tarjeta individual del producto */}
					<div className="product-item">
						{/* Imagen del Producto o Placeholder */}
						{product.images && product.images.length > 0 ? (
							<img
								src={product.images[0].src}
								alt={product.images[0].alt || product.name}
								className="product-image" // Clase para que ProductGrid.css pueda estilizar
							/>
						) : (
							<div className="no-image-placeholder"> {/* Clase para que ProductGrid.css pueda estilizar */}
								Sin Imagen
							</div>
						)}

						{/* Nombre del Producto */}
						<h3 className="product-title">{product.name}</h3> {/* Clase para que ProductGrid.css pueda estilizar */}

						{/* Precio del Producto */}
						<p className="product-price">{product.price ? `${product.price} €` : 'Consultar precio'}</p> {/* Clase para que ProductGrid.css pueda estilizar */}

						{/* Puedes añadir aquí otros detalles si los necesitas en la tarjeta */}

					</div> {/* Cierre de product-item */}
				</Link> // Cierre del Link
			))}
		</> // Cierre del Fragment
	);
}

export default ProductGrid;