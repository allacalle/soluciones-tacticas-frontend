// src/pages/ProductPage.tsx

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Import useNavigate if you want to redirect on error
import './css/ProductPage.css'; // Importa los estilos CSS para esta p\u00E1gina

// *** Importa la interfaz Product ***
// Aseg\u00FArate de que la interfaz Product en tu archivo src/types.ts incluye regular_price, sale_price y images (array)
import { Product } from '../types'; // O puede ser de '../api/wooApi' si la tienes ah\u00ED

import { getProductByIdOrSlug } from '../api/wooApi'; // Verifica la ruta


// Componente de la p\u00E1gina de producto individual
function ProductPage() {
	/*
	 * Leemos el par\u00E1metro 'productSlug' de la URL.
	 * Asumimos que la ruta en tu router ser\u00E1 algo como '/productos/:productSlug'
	 */
	const { productSlug } = useParams<{ productSlug: string }>();
	// const navigate = useNavigate(); // Hook para redirigir si es necesario


	/*
	 * Estado para guardar los datos del producto cargado
	 */
	const [product, setProduct] = useState<Product | null>(null);
	/*
	 * Estado para el estado de carga
	 */
	const [loading, setLoading] = useState(true); // Empezamos cargando por defecto
	/*
	 * Estado para los errores
	 */
	const [error, setError] = useState<string | null>(null);

	/*
	 * Estado para la imagen principal mostrada en la galer\u00EDa
	 */
	const [mainImage, setMainImage] = useState<string | undefined>(undefined);


	/*
	 * useEffect para cargar el producto desde la API cuando el componente se monta o el slug cambia
	 */
	useEffect(() => {
		/*
		 * Si no hay productSlug en la URL, mostramos un error
		 */
		if (!productSlug) {
			setError("No se proporcion\u00F3 un identificador de producto en la URL.");
			setLoading(false);
			// Opcional: redirigir si no hay slug
			// navigate('/');
			return;
		}

		console.log(`[ProductPage] Iniciando carga para slug: ${productSlug}`); // Log

		/*
		 * Funci\u00F3n as\u00EDncrona para cargar el producto desde la API
		 */
		const fetchProduct = async () => {
			try {
				setLoading(true); // Indica que la carga empieza
				setError(null); // Limpia cualquier error anterior
				setProduct(null); // Limpia el producto anterior si el slug cambia
				setMainImage(undefined); // Limpia la imagen principal anterior


				/*
				 * Llamada a la funci\u00F3n API getProductByIdOrSlug
				 * getProductByIdOrSlug espera el slug (o ID) que leemos de useParams
				 */
				const fetchedProduct = await getProductByIdOrSlug(productSlug);

				if (fetchedProduct) {
					/*
					 * Si la API devolvi\u00F3 un producto v\u00E1lido (no null)
					 */
					setProduct(fetchedProduct); // Guarda el producto encontrado en el estado
					console.log(`[ProductPage] Producto cargado: ${fetchedProduct.name}`); // Log de \u00E9xito

					/*
					 * Establecer la primera imagen como imagen principal por defecto
					 */
					if (fetchedProduct.images && fetchedProduct.images.length > 0) {
						setMainImage(fetchedProduct.images[0].src);
					} else {
						// Si no hay im\u00E1genes, puedes establecer una imagen placeholder aqu\u00ED
						// setMainImage('/path/to/placeholder-image.jpg'); // TODO: Define un placeholder si es necesario
					}

				} else {
					/*
					 * Si la API devolvi\u00F3 null (esto ocurre en getProductByIdOrSlug si no encuentra el producto)
					 */
					setError("Producto no encontrado.");
					setProduct(null); // Asegura que el estado de producto es null
					setMainImage(undefined); // Asegura que la imagen principal es undefined
					console.warn(`[ProductPage] Producto con slug "${productSlug}" no encontrado por API.`); // Log de no encontrado
				}
			} catch (caughtError: unknown) {
				/*
				 * Manejo de error m\u00E1s robusto usando unknown
				 */
				const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));

				console.error(`[ProductPage] Error al cargar el producto ${productSlug}:`, error); // Log el error manejado

				// Mensaje amigable para el usuario:
				setError("Error al cargar la informaci\u00F3n del producto.");

				setProduct(null); // Asegura que product es null en caso de error
				setMainImage(undefined); // Asegura que la imagen principal es undefined
			} finally {
				setLoading(false); // La carga ha terminado
				console.log(`[ProductPage] Proceso de carga finalizado para slug: ${productSlug}`); // Log
			}
		};

		fetchProduct(); // Ejecuta la funci\u00F3n de carga al montar el componente o cambiar el slug

		/*
		 * Funci\u00F3n de limpieza: Si la petici\u00F3n fetch() es larga y el componente se desmonta,
		 * podr\u00EDas necesitar cancelar la petici\u00F3n para evitar errores de estado.
		 * Para eso se usa AbortController, pero por ahora no es cr\u00EDtico.
		 * return () => { /* l\u00F3gica de cancelaci\u00F3n si la implementas *\/ };
		 */


	}, [productSlug]); // Dependencia: Re-ejecutar este efecto cada vez que el 'productSlug' en la URL cambie



	/*
	 * Handler para cuando se hace clic en una imagen en miniatura
	 */
	const handleThumbnailClick = (imageUrl: string) => {
		setMainImage(imageUrl);
	};


	/*
	 * ==============================================================
	 * Renderizado Condicional (Return JSX)
	 * ==============================================================
	 */

	/*
	 * Mostramos mensajes de estado (carga, error, no encontrado)
	 */
	if (loading) {
		return (
			<div className="page-container"> {/* Usar el contenedor general de p\u00E1gina */}
				<div className="product-page-loading">Cargando producto...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="page-container"> {/* Usar el contenedor general de p\u00E1gina */}
				<div className="product-page-error">Error: {error}</div>
			</div>
		);
	}

	/*
	 * Si no est\u00E1 cargando, no hay error, pero product es null (simulando "no encontrado")
	 */
	if (!product) {
		return (
			<div className="page-container"> {/* Usar el contenedor general de p\u00E1gina */}
				<div className="product-page-not-found">Producto no encontrado.</div>
			</div>
		);
	}


	/*
	 * *** Si no est\u00E1 cargando, no hay error y tenemos un producto, mostramos los detalles ***
	 * Usaremos las clases CSS que definiremos en ProductPage.css
	 */
	return (
		<div className="page-container product-page-container"> {/* Usar el contenedor general de p\u00E1gina y una clase espec\u00EDfica */}

			{/* NOTA: El Header y Footer normalmente se a\u00F1aden en el Layout general (App.tsx o Layout.tsx) */}

			{/*
			 * Contenedor principal para la imagen e informaci\u00F3n del producto (layout principal de 2 columnas)
			 */}
			<div className="product-details-main">

				{/*
				 * Secci\u00F3n de im\u00E1genes del producto (Galer\u00EDa b\u00E1sica)
				 */}
				<div className="product-images-gallery">
					{/* Imagen principal */}
					{mainImage ? (
						<img src={mainImage} alt={product.name} className="product-main-image" />
					) : product.images && product.images.length > 0 ? (
						/* Fallback por si mainImage no se estableci\u00F3 correctamente, aunque useEffect deber\u00EDa manejarlo */
						<img src={product.images[0].src} alt={product.images[0].alt || product.name} className="product-main-image" />
					) : (
						<div className="no-product-image">Imagen no disponible</div> /* Mensaje si no hay im\u00E1genes */
					)}

					{/* Miniaturas de las im\u00E1genes (si hay m\u00E1s de una) */}
					{product.images && product.images.length > 1 && (
						<div className="product-thumbnails">
							{product.images.map((image) => (
								<img
									key={image.id} // Usar el ID de la imagen como key
									src={image.src}
									alt={image.alt || `Thumbnail de ${product.name}`}
									className={`product-thumbnail ${mainImage === image.src ? 'active' : ''}`} // Clase 'active' si es la imagen principal
									onClick={() => handleThumbnailClick(image.src)} // Manejador de clic para cambiar la imagen principal
								/>
							))}
						</div>
					)}
				</div> {/* Cierre product-images-gallery */}


				{/*
				 * Secci\u00F3n de informaci\u00F3n del producto (precio, variaciones, a\u00F1adir carrito, etc.)
				 */}
				<div className="product-info">
					<h1>{product.name}</h1> {/* Nombre del producto (repetido aqu\u00ED para mejor layout, el h1 de arriba podr\u00EDa moverse o usarse para breadcrumbs) */}

					{/* *** VISUALIZACI\u00D3N DE PRECIOS (Original vs Oferta) *** */}
					<div className="product-price-container">
						{product.on_sale ? (
							/* Si est\u00E1 en oferta, muestra el precio regular tachado y el precio de oferta */
							<> {/* Fragmento para agrupar elementos */}
								<span className="regular-price">{product.regular_price}€</span> {/* Precio normal (tachado) */}
								<span className="sale-price">{product.sale_price}€</span> {/* Precio de oferta */}
							</>
						) : (
							/* Si no est\u00E1 en oferta, muestra solo el precio regular (que ser\u00E1 igual al price en este caso) */
							<span className="regular-price">{product.regular_price}€</span>
							// O podr\u00EDas usar product.price si est\u00E1s seguro de que siempre tiene el valor correcto
							// <span className="current-price">{product.price}€</span>
						)}
					</div> {/* Cierre product-price-container */}


					{/*
					 * Secci\u00F3n de variaciones (Tallas, Colores, etc.) - TODO
					 * Esto requiere l\u00F3gica adicional para manejar productos de tipo 'variable'
					 */}
					{/* {product.type === 'variable' && (
						<div className="product-variations">
							<h3>Variaciones:</h3>
							// L\u00F3gica para mostrar selectores de atributos y opciones
							// Basado en product.attributes y product.variations
							// ...
						</div>
					)} */}


					{/*
					 * Selector de cantidad - TODO
					 */}
					{/* <div className="product-quantity-selector">
						<label htmlFor="quantity">Cantidad:</label>
						<input type="number" id="quantity" name="quantity" min="1" defaultValue="1" />
					</div> */}


					{/*
					 * Bot\u00F3n de a\u00F1adir al carrito - TODO (Conectar a la l\u00F3gica del carrito)
					 */}
					<button className="add-to-cart-button">A\u00F1adir al carrito</button>


					{/*
					 * Informaci\u00F3n adicional b\u00E1sica
					 */}
					<div className="product-meta">
						{/* Estado de Stock */}
						{product.stock_status && (
							<p className={`stock-status ${product.stock_status}`}>
								Estado: {product.stock_status === 'instock' ? 'En Stock' : 'Agotado'} {/* Traducir estados si es necesario */}
							</p>
						)}
						
					</div>


					{/*
					 * Descripci\u00F3n breve
					 */}
					<div className="product-short-description">
						<h3>Descripci\u00F3n Breve</h3>
						{product.short_description ? (
							<div dangerouslySetInnerHTML={{ __html: product.short_description }} />
						) : (
							<p>No hay descripci\u00F3n breve disponible.</p>
						)}
					</div>


				</div> {/* Cierre product-info */}

			</div> {/* Cierre product-details-main */}


			{/*
			 * Descripci\u00F3n completa
			 */}
			<div className="product-full-description">
				<h3>Descripci\u00F3n Completa</h3>
				{product.description ? (
					<div dangerouslySetInnerHTML={{ __html: product.description }} />
				) : (
					<p>No hay descripci\u00F3n completa disponible.</p>
				)}
			</div>


			{/*
			 * Secciones futuras: Productos Relacionados, Rese\u00F1as, etc. - TODO
			 * <div className="related-products"> ... </div>
			 * <div className="product-reviews"> ... </div>
			 */}


		</div> // Cierre product-page-container
	);
}

export default ProductPage;