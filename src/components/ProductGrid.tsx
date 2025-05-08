// src/components/ProductGrid.tsx

import { Link } from 'react-router-dom'; // Necesitamos Link para enlazar a la página de producto individual
import './css/ProductGrid.css'; // Importa los estilos para la cuadrícula y los items

import { Product } from '../types'; // Importa la interfaz Product

// Define las propiedades que acepta ProductGrid: solo la lista de productos
interface ProductGridProps {
	products: Product[];
}

function ProductGrid({ products }: ProductGridProps) {

	// Si no hay productos (ej: lista vacía después de cargar, o error manejado por el padre)
	// El componente padre que llama a ProductGrid debería manejar el estado de carga/error/vacío
	if (!products || products.length === 0) {
		// Puedes devolver null, un mensaje, o lo que sea apropiado si la lista está vacía.
		// Aquí devolvemos null, asumiendo que el padre mostrará un mensaje "No se encontraron productos".
		return null;
	}

	return (
		// Contenedor de la cuadrícula de productos. Usaremos esta clase en el CSS.
		<div className="products-grid">
			{/* Mapeamos sobre la lista de productos para mostrar cada uno */}
			{products.map(product => (
				// Cada ítem de la cuadrícula es un enlace a la página del producto individual
				// Usamos el slug del producto para la URL
				<Link key={product.id} to={`/producto/${product.slug}`} className="product-item-link">
					{/* Contenedor de la tarjeta individual del producto */}
					<div className="product-item">
						{/* Imagen del Producto o Placeholder */}
						{product.images && product.images.length > 0 ? (
							<img
								src={product.images[0].src}
								alt={product.images[0].alt || product.name}
								className="product-image" // Clase para estilizar la imagen
							/>
						) : (
							<div className="no-image-placeholder"> {/* Clase para el placeholder sin imagen */}
								Sin Imagen
							</div>
						)}

						{/* Nombre del Producto */}
						<h3 className="product-title">{product.name}</h3> {/* Clase para el título */}

						{/* Precio del Producto */}
						{/* Asegúrate de manejar si price es null o undefined si tu API lo permite */}
						<p className="product-price">{product.price ? `${product.price} €` : 'Consultar precio'}</p> {/* Clase para el precio */}

						{/* Puedes añadir aquí otros detalles como una descripción corta, botón "Añadir al carrito" (si lo implementas) */}
						{/* {product.short_description && <div dangerouslySetInnerHTML={{ __html: product.short_description }} />} */}

					</div> {/* Cierre de product-item */}
				</Link> // Cierre del Link
			))}
		</div> // Cierre de products-grid
	);
}

export default ProductGrid;