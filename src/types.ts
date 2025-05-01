export interface Product {
    id: number;
    name: string;
    price: string;
    short_description: string;
    images: Array<{
        src: string;
        alt: string;
    }>;
    // Añade otros campos que te interesen de la API de WooCommerce
}