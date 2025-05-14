// src/types.ts

// Interfaz para la estructura de un producto obtenida de la API de WooCommerce
export interface Product {
	id: number; // ID \u00FAnico del producto
	name: string; // Nombre del producto
	slug: string; // Slug para la URL amigable
	description: string; // Descripci\u00F3n completa en HTML
	short_description: string; // Descripci\u00F3n breve en HTML
	price: string; // Precio actual del producto (formateado como cadena)
	regular_price: string; // Precio normal del producto (formateado como cadena)
	sale_price: string; // Precio de oferta del producto (cadena vac\u00EDa si no hay oferta)
	on_sale: boolean; // Booleano que indica si el producto est\u00E1 en oferta
	images: Array<{ // Array de objetos de imagen asociados al producto
		id: number; // ID de la imagen
		src: string; // URL de la imagen
		name: string; // Nombre del archivo de imagen
		alt: string; // Texto alternativo de la imagen
		position: number; // Posici\u00F3n de la imagen (para ordenar)
	}>;

	// *** PROPIEDADES DE METADATOS A\u00D1ADIDAS PARA EL ESCAPARATE ***
	sku?: string; // SKU del producto (opcional, no todos los productos tienen SKU)
	stock_status?: 'instock' | 'outofstock' | 'onbackorder'; // Estado del stock (usamos string literal types si conocemos los posibles valores)
	// stock_quantity?: number | null; // Cantidad en stock (opcional, si se gestiona por cantidad)
	// manage_stock?: boolean; // Si el stock es gestionado (opcional)

	categories: Array<{ // Array de objetos de categor\u00EDa a las que pertenece el producto
		id: number; // ID de la categor\u00EDa
		name: string; // Nombre de la categor\u00EDa
		slug: string; // Slug de la categoia
	}>; // Nota: En la API de WC, las categor\u00EDas vienen en un array 'categories'.

	// *** CORRECCI\u00D3N CRUCIAL AQU\u00CD ***
	// La definici\u00F3n para la marca debe incluir la propiedad 'image' como opcional.
	brand?: Array<{ // Definici\u00F3n para la marca como un array de t\u00E9rminos de taxonom\u00EDa
		id: number;
		name: string;
		slug: string;
		// *** PROPIEDAD IMAGE A\u00D1ADIDA AQU\u00CD (opcional) ***
		image?: { // Propiedad opcional para la imagen del t\u00E9rmino de marca
			id: number;
			src: string;
			alt: string;
		};
	}>; // Hacemos la propiedad 'brand' en el producto opcional (?)

	// Eliminadas propiedades no usadas en ProductPage (type, status, etc., excepto las reci\u00E9n a\u00F1adidas y las esenciales)
}
// Interfaz para la estructura de una categoría obtenida de la API de WooCommerce
export interface Category {
	id: number;
	name: string; // Nombre de la categor\u00EDa
	slug: string; // Slug de la categoia para la URL
	parent: number; // ID de la categoria padre (0 para ra\u00EDz)
	description: string; // Descripcion de la categor\u00EDa
	image: { // Objeto de imagen de la categor\u00EDa
		id: number;
		src: string;
		alt: string;
	} | null; // La imagen puede ser null
	menu_order: number; // Orden en el men\u00FA
	count: number; // Numero de productos en la categorria
}



// *** INTERFAZ QUE NECESITAS AÑADIR (O ASEGURARTE QUE ESTÁ) ***
// Interfaz para la estructura de un objeto de reseña en el archivo JSON (reviews.json)
export interface ReviewData {
    id: number; // Opcional en tu JSON, pero útil. Podría ser string si no son solo números.
    name: string; // Nombre del cliente
    text: string; // Texto de la reseña
    // rating?: number; // Si añades 'rating' al JSON en el futuro, descomenta esto
    // date?: string; // Si incluyes la fecha de la reseña
    // source?: string; // Ej: "Google", "Facebook"
}

export interface Brand {
	id: number;
	name: string;
	slug: string;
	description?: string; // Descripci\u00F3n opcional de la marca
	image?: { // Objeto de imagen de la marca
		id: number;
		src: string;
		alt: string;
	};
	count?: number;
}
