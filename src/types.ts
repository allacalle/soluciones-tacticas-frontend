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

// NUEVO: Define y exporta Category
export interface Category {
    id: number;
    name: string;
    slug: string;
    parent?: number;
    description?: string;
    image?: Image | null; // Usa la interfaz Image
    menu_order?: number;
    count?: number;
}

// NUEVO: Define y exporta Brand
export interface Brand {
    id: number;
    name: string;
    slug: string;
    image?: Image; // Usa la interfaz Image
    description?: string;
    count?: number;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    type: 'simple' | 'variable' | 'grouped' | 'external' | string;
    description: string;
    short_description: string;
    price: string;
    regular_price: string;
    sale_price: string;
    price_html: string;
    on_sale: boolean;
    purchasable: boolean;
    stock_status: 'instock' | 'outofstock' | 'onbackorder' | string;
    stock_quantity: number | null;
    sku?: string;

    images: Image[];

    // MODIFICADO: Ahora usa las interfaces exportadas
    categories: Category[]; // <--- USA LA INTERFAZ Category
    brand?: Brand[];      // <--- USA LA INTERFAZ Brand

    attributes: Attribute[];
    variations: number[];
    average_rating?: string;
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