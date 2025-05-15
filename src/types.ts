// src/types.ts

// Interfaz para la estructura de una imagen
export interface Image {
    id: number;
    src: string;
    alt: string;
    name?: string; // Opcional, si la API lo da
    position?: number; // Opcional, si la API lo da
}

// Define la estructura de un atributo de producto (ej: Color, Talla) para el producto padre
export interface Attribute {
    id: number; // ID del t\u00E9rmino de atributo global (si lo es), o 0 para personalizado
    name: string; // Nombre del atributo (ej: "Color", "Talla")
    options: string[]; // Array de strings con las opciones/t\u00E9rminos del atributo para ESTE producto
    position: number;
    visible: boolean;
    variation: boolean; // Indica si este atributo se usa para crear variaciones
    // taxonomy?: string; // Opcional
}

// Define la estructura de un atributo DENTRO de una variaci\u00F3n hija
export interface VariationAttribute {
    id: number; // ID del atributo (puede ser 0 para atributos personalizados o t\u00E9rmino global)
    name: string; // El nombre del atributo (ej: "Color", "Talla")
    option: string; // El valor seleccionado para esta variaci\u00F3n espec\u00EDfica (ej: "Negro", "M").
}

// Define la estructura de una variaci\u00F3n de producto (el "hijo" del producto variable)
export interface Variation {
    id: number;
    sku?: string;
    price: string; // El precio de esta variaci\u00F3n espec\u00EDfica (viene como string de la API)
    regular_price: string;
    sale_price: string;
    on_sale: boolean;
    stock_status: 'instock' | 'outofstock' | 'onbackorder' | string; // Usa string por flexibilidad si hay otros valores
    stock_quantity: number | null;
    image?: Image | null; // La imagen espec\u00EDfica para esta variaci\u00F3n (puede ser null)
    attributes: VariationAttribute[]; // Los atributos que definen esta variaci\u00F3n (usando la interfaz definida arriba)
    // Puedes a\u00F1adir aqu\u00ED otras propiedades de la API para variaciones si las usas (ej: dimensiones, peso, meta_data)
    // dimensions?: { length: string; width: string; height: string; };
    // weight?: string;
    // meta_data?: Array<{ id: number; key: string; value: any }>; // Usa 'any' si la estructura es muy variable
}

// Interfaz para la estructura principal de un producto (padre)
export interface Product {
    id: number; // ID \u00FAnico del producto
    name: string; // Nombre del producto
    slug: string; // Slug para la URL amigable
    type: 'simple' | 'variable' | 'grouped' | 'external' | string; // Tipo de producto (usa string por flexibilidad)
    description: string; // Descripci\u00F3n completa en HTML
    short_description: string; // Descripci\u00F3n breve en HTML
    price: string; // Precio actual del producto (string). Para variables, es el precio m\u00EDnimo (o rango)
    regular_price: string;
    sale_price: string;
    price_html: string; // HTML con el precio o rango de precio (para variables)
    on_sale: boolean;
    purchasable: boolean; // Indica si el producto se puede a\u00F1adir al carrito
    stock_status: 'instock' | 'outofstock' | 'onbackorder' | string; // Estado del stock
    stock_quantity: number | null; // Cantidad en stock (null si no se gestiona por cantidad)
    // manage_stock?: boolean; // Opcional
    sku?: string; // SKU (opcional)

    images: Image[]; // Galeria de im\u00E1genes (usando la interfaz Image)

    categories: Array<{ // Array de objetos de categor\u00EDa a las que pertenece el producto
        id: number; // ID de la categor\u00EDa
        name: string; // Nombre de la categor\u00EDa
        slug: string; // Slug de la categoia
        // parent?: number; // Opcional
        // description?: string; // Opcional
        // image?: Image | null; // Opcional
        // menu_order?: number; // Opcional
        // count?: number; // Opcional
    }>; // Nota: En la API de WC, las categor\u00EDas vienen en un array 'categories'.

    // *** PROPIEDAD BRAND (Manteniendo tu estructura Array<{...}>) ***
    // Ajusta si es necesario si tu API la devuelve diferente.
    brand?: Array<{ // Definici\u00F3n para la marca como un array de t\u00E9rminos de taxonom\u00EDa
        id: number;
        name: string;
        slug: string;
        image?: Image; // Propiedad opcional para la imagen de la marca
        // description?: string; // Opcional
        // count?: number; // Opcional
    }>; // Hacemos la propiedad 'brand' en el producto opcional (?)

    attributes: Attribute[]; // Atributos del producto padre (usando la interfaz Attribute)

    variations: number[]; // Array de IDs de las variaciones hijas (para productos variables). Opcional.

    // === Otras propiedades que podr\u00EDas tener ===
    // tags?: Array<{ id: number; name: string; slug: string; }>;
    // related_ids?: number[];
    // meta_data?: Array<{ id: number; key: string; value: any }>; // Usa 'any' si la estructura es muy variable
    // parent_id?: number; // Si es una variaci\u00F3n, tendr\u00Eiacute;a el id del padre
    // permalink?: string; // URL del producto
    // status?: string; // 'publish', 'draft', etc.
    // catalog_visibility?: string;
    // featured?: boolean;
    average_rating?: string; // Viene como string
    rating_count?: number;
}

// Interfaz para la estructura de un objeto de reseña en el archivo JSON (reviews.json) - Mantenida
export interface ReviewData {
    id?: number; // Opcional
    name: string; // Nombre del cliente
    text: string; // Texto de la reseña
    // rating?: number; // Si añades 'rating' al JSON
    // date?: string; // Si incluyes la fecha
    // source?: string; // Ej: "Google", "Facebook"
    // Posiblemente otras propiedades
}


// Exporta todas las interfaces necesarias
// (Las interfaces ya están exportadas individualmente arriba)