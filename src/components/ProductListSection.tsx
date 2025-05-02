// src/components/ProductListSection.tsx (o src/components/ProductListSection.jsx)

import './ProductListSection.css'
import  { useEffect, useState } from 'react'; // *** Asegúrate de importar useEffect y useState ***

// Importa la función para obtener productos y la interfaz Product
// *** Asegúrate de importar getProducts desde la ruta correcta (debe ser '../api/wooApi') ***
import { getProducts } from '../api/wooApi';
// *** Asegúrate de importar Product desde la ruta correcta (debe ser '../types') ***
import { Product } from '../types';

// Define las propiedades que aceptará el componente (mantén esta parte)
interface ProductListSectionProps {
    title: string;
    subtitle?: string;
    type: 'latest' | 'popular' | 'sale' | 'featured' | 'category' | 'ids';
    categoryId?: number;
    productIds?: number[];
    productsPerPage?: number; // Tiene valor por defecto en la firma de la función abajo
}

// Define el componente funcional, aceptando las propiedades
function ProductListSection({ title, subtitle, type, categoryId, productIds, productsPerPage = 10 }: ProductListSectionProps) {

    // Estados locales (mantén esto - son para ESTA sección)
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true); // Empezamos cargando por defecto
    const [error, setError] = useState<Error | null>(null);


    // *** ESTE ES EL BLOQUE useEffect ACTUALIZADO CON LA LÓGICA DE LLAMADA A LA API ***
    useEffect(() => {
        const fetchProducts = async () => {
            // Reinicia estados de carga/error al iniciar una nueva carga
            setLoading(true);
            setError(null);

            try {
                let productsData: Product[] = []; // Array donde guardaremos los productos del resultado

                // *** Lógica para LLAMAR a getProducts basándose en el 'type' de la prop ***
                // Aquí es donde usamos las props type, categoryId, productIds, productsPerPage
                switch (type) {
                    case 'latest':{
                        // Cargar los últimos productos: ordenar por fecha descendente
                        // getProducts(page, per_page, categoryId, orderby, order, on_sale, featured, includeIds)
                        const latestResult = await getProducts(1, productsPerPage, undefined, 'date', 'desc');
                        productsData = latestResult.products; // Tomamos solo el array de productos
                        break;
                    }

                    case 'popular': {
                         // Cargar los productos más populares: ordenar por popularidad descendente
                         const popularResult = await getProducts(1, productsPerPage, undefined, 'popularity', 'desc');
                         productsData = popularResult.products;
                        break;
                    }

                    case 'sale':{
                         // Cargar productos en oferta: usar el filtro on_sale=true
                         // getProducts(page, per_page, categoryId, orderby, order, on_sale, featured, includeIds)
                         const saleResult = await getProducts(1, productsPerPage, undefined, undefined, undefined, true); // el 6º argumento es on_sale
                         productsData = saleResult.products;
                         break;
                        }

                    case 'featured': {
                         // Cargar productos destacados: usar el filtro featured=true
                         // getProducts(page, per_page, categoryId, orderby, order, on_sale, featured, includeIds)
                         const featuredResult = await getProducts(1, productsPerPage, undefined, undefined, undefined, undefined, true); // el 7º argumento es featured
                         productsData = featuredResult.products;
                         break;
                        }

                    case 'category':
                        if (categoryId !== undefined) { // Validamos que se haya pasado un categoryId si type es 'category'
                           // Cargar productos de una categoría específica
                           const categoryResult = await getProducts(1, productsPerPage, categoryId); // el 3er argumento es categoryId
                           productsData = categoryResult.products;
                        } else {
                           // Lanzamos un error si no se cumple la condición
                           throw new Error(`El componente ProductListSection con type='category' requiere la prop 'categoryId'. Título: ${title}`);
                        }
                        break;

                    case 'ids':
                         if (productIds && productIds.length > 0) { // Validamos que se haya pasado un array con IDs
                             // Cargar productos por IDs específicos: usar el parámetro includeIds
                             // getProducts(page, per_page, categoryId, orderby, order, on_sale, featured, includeIds)
                             const idsResult = await getProducts(1, undefined, undefined, undefined, undefined, undefined, undefined, productIds); // el 8º argumento es includeIds
                             productsData = idsResult.products;
                         } else {
                            // Lanzamos un error si no se cumple la condición
                             // Podrías manejar esto sin lanzar error, solo mostrando 0 productos, tú decides la convención
                            throw new Error(`El componente ProductListSection con type='ids' requiere la prop 'productIds' con IDs válidos. Título: ${title}`);
                         }
                         break;

                    default:
                         // Lanzamos un error si el 'type' de la prop no es reconocido
                         throw new Error(`Tipo de lista de productos desconocido en ProductListSection: '${type}'. Título: ${title}`);
                }

                // *** Después del switch, actualiza el estado 'products' con los datos que obtuvimos ***
                setProducts(productsData);

            } catch (caughtError: unknown) {
                // Captura errores de getProducts o de las validaciones/lógica dentro del try
                const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
                console.error(`[ProductListSection] Error al cargar productos para tipo '${type}' (Título: ${title}):`, error);
                setError(error); // Guarda el error en el estado local
                setProducts([]); // Limpia la lista de productos en caso de error
            } finally {
                 // Marca el final de la carga, ocurra un éxito o un error
                 setLoading(false);
            }
        };

        // Llama a la función de carga cuando el componente se monta o las dependencias cambian
        fetchProducts();

        // *** DEPENDENCIAS DEL useEffect: ESTO ES CLAVE ***
        // El efecto DEBE re-ejecutarse cada vez que alguna de estas props cambie,
        // porque un cambio en ellas significa que hay que cargar una *lista diferente* de productos.
    }, [type, categoryId, productIds, productsPerPage, title]); // <--- ¡Añade estas dependencias!

    // *** Aquí modificaremos el return en el PRÓXIMO PASO para mostrar la carga, error o la lista real de productos ***
    // Por ahora, mantenemos la estructura básica y los mensajes de estado temporales
    
     // ======================================================================
    // Bloque 7: Renderizado (Return JSX) - AHORA MOSTRANDO DATOS REALES O ESTADOS
    // ======================================================================
// src/components/ProductListSection.tsx (Bloque Return - Elimina los estilos inline de imagen y placeholder)

// ... (código antes del return se queda igual) ...

return (
    <section className="product-list-section" style={{ margin: '30px 0' }}>
        {/* Banner ... */}
        <div className="section-banner"> {/* ... */} 
            <h2>{title}</h2> {/* <-- ¡Asegúrate de que esta línea está aquí! */}
            {subtitle && <p>{subtitle}</p>} {/* <-- ¡Asegúrate de que esta línea está aquí! */}
        </div>


        {/* Área de visualización de productos ... */}
        <div className="products-display-area">

             {/* Renderizado Condicional ... */}
             {/* ... (mensajes de carga, error, no encontrados se quedan igual) ... */}

             {/* Renderizado de la lista de productos (map) */}
             {!loading && !error && products.length > 0 && (
                 products.map((product) => (
                     <div key={product.id} className="product-item"> {/* Tarjeta */}
                        {/* Imagen del Producto o Placeholder */}
                         {product.images && product.images.length > 0 ? (
                             <img
                                 src={product.images[0].src}
                                 alt={product.images[0].alt || product.name}
                                 // *** ELIMINA ESTA PROP style={...} ***
                                 // style={{ width: '100%', height: '180px', objectFit: 'cover', marginBottom: '10px', borderRadius: '4px' }}
                             />
                         ) : (
                             // Placeholder
                              <div className="no-image-placeholder"> {/* *** ELIMINA ESTA PROP style={...} *** */}
                                  Sin Imagen
                              </div>
                         )}

                         {/* Nombre ... */}
                         <h3>{product.name}</h3>

                         {/* Precio ... */}
                         <p>{product.price} €</p>

                     </div>
                 ))
             )}

        </div> {/* Cierre de products-display-area */}
    </section> // Cierre de product-list-section
);
}

// ... (export default ProductListSection) ...

// Asegúrate de exportar el componente al final del archivo
export default ProductListSection;