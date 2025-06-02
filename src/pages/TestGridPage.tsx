// src/pages/TestGridPage.tsx
import ProductGrid from '../components/ProductGrid'; // Asegúrate de que la ruta sea correcta
import { Product } from '../types';           // Asegúrate de que la ruta sea correcta

const mockProducts: Product[] = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    name: `Producto de Prueba ${i + 1} con un nombre largo`,
    slug: `producto-${i + 1}`,
    images: [{
        id: 100 + i,
        src: `https://via.placeholder.com/300x300.png/00${i}0${i%10}B/FFFFFF?Text=Prod-${i+1}`,
        alt: `Producto ${i + 1}`,
        // Si tu tipo Image tiene más propiedades obligatorias, añádelas aquí
        // name: `prod-${i+1}.png`,
        // date_created: new Date().toISOString(),
        // date_modified: new Date().toISOString()
    }],
    price: `${(i + 1) * 10}`, // Asegúrate de que esto coincida con lo que espera ProductCard
    
    // --- PROPIEDADES AÑADIDAS PARA CUMPLIR CON EL TIPO Product ---
    price_html: `<span class="amount">${(i + 1) * 10}€</span>`, // Simula el HTML del precio
    purchasable: true,
    stock_quantity: i % 3 === 0 ? null : 10 + i, // Algunos con stock null, otros con cantidad
    // --- FIN PROPIEDADES AÑADIDAS ---

    // Propiedades que ya tenías (asegúrate de que sean suficientes)
    regular_price: `${(i + 1) * 10 + 5}`,
    on_sale: i % 2 === 0,
    sale_price: i % 2 === 0 ? `${(i + 1) * 10}` : undefined,
    description: 'Descripción completa de prueba para el producto.',
    short_description: 'Descripción corta de prueba.',
    categories: [{ id: 1, name: 'Categoría Test', slug: 'categoria-test', image: null, parent: 0, count: 1 }], // Añade image, parent, count si son obligatorios
    tags: [{ id: 1, name: 'Tag Test', slug: 'tag-test', count: 1 }], // Añade count si es obligatorio
    attributes: [{ id: 1, name: 'Color', slug: 'color', variation: true, visible: true, options: ['Rojo', 'Azul'] }],
    variations: [], // Array de IDs de variación
    stock_status: i % 3 === 0 ? 'outofstock' : 'instock',
    type: 'simple',
    // Si 'Product' tiene más propiedades obligatorias, añádelas aquí
    // ej: average_rating: "0", rating_count: 0, etc.
    average_rating: '4.5', // Ejemplo
    rating_count: 10 + i,    // Ejemplo
    meta_data: [],         // Ejemplo
    brand: [{ id: 1, name: 'Marca Test', slug: 'marca-test', image: null }], // Ejemplo, añade image si es obligatorio
}));

function TestGridPage() {
    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '20px auto', border: '3px solid dodgerblue' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Página de Prueba para ProductGrid</h1>
            <p style={{ textAlign: 'center', marginBottom: '30px' }}>
                Aquí abajo debería aparecer una grilla de productos multilínea y responsiva.
                Si solo ves una columna vertical, hay un problema con el CSS de ProductGrid.
            </p>
            <ProductGrid
                products={mockProducts}
            />
        </div>
    );
}

export default TestGridPage;