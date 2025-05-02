// src/types.ts

// Interfaz para la estructura de un producto obtenida de la API de WooCommerce
export interface Product {
    id: number;
    name: string;
    price: string; // O number, dependiendo de cómo la API la devuelva y cómo la uses
    short_description: string; // O descripción completa si la usas
    images: Array<{
        src: string;
        alt: string; // Opcional, puede que no siempre venga
    }>;
    // Añade otros campos que te interesen de la API de WooCommerce (stock, categories, etc.)
    stock_status?: string; // Ejemplo: 'instock', 'outofstock'
    on_sale?: boolean; // Ejemplo: true si está en oferta
    featured?: boolean; // Ejemplo: true si es un producto destacado
    // Puedes añadir más según necesites
}

// Interfaz para la estructura de una categoría obtenida de la API de WooCommerce
export interface Category {
    id: number;
    name: string;
    slug: string; // Identificador amigable para URLs
    count: number; // Número de productos en la categoría
    image?: { // La imagen de la categoría es opcional
        src: string;
        alt: string; // Opcional
    };
    parent: number; // ID de la categoría padre (0 para categorías principales)
    // Puedes añadir más campos de categoría si los usas (description, display, menu_order, etc.)
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