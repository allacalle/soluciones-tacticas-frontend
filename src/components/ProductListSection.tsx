// src/components/ProductListSection.tsx (o src/components/ProductListSection.jsx)

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
    return (
        // Contenedor principal de la sección
        <section className="product-list-section" style={{ margin: '20px 0' }}> {/* Añadimos un poco de margen para separarlo del hero */}
            {/* Banner superior de la sección */}
            <div className="section-banner" style={{ backgroundColor: '#4b5320', color: '#fff', padding: '15px 20px', textAlign: 'center' }}> {/* Estilos del banner */}
                <h2>{title}</h2> {/* Muestra el título de la prop */}
                {subtitle && <p style={{ fontSize: '0.9em', opacity: 0.8, margin: 0 }}>{subtitle}</p>} {/* Muestra el subtítulo si existe */}
            </div>

            {/* Área donde irán los productos o mensajes de estado */}
            <div className="products-display-area" style={{ padding: '20px', display: 'flex', overflowX: 'auto', gap: '20px' }}> {/* Flexbox para fila horizontal, scroll si muchos, gap para espacio entre productos */}

                 {/* *** Renderizado Condicional Basado en el Estado *** */}

                 {/* 1. Si está cargando, muestra el mensaje de carga */}
                 {loading && (
                     <div style={{ textAlign: 'center', width: '100%' }}>{`Cargando ${title.toLowerCase()}...`}</div>
                 )}

                 {/* 2. Si hay un error, muestra el mensaje de error */}
                 {error && (
                     <div style={{ color: 'red', textAlign: 'center', width: '100%' }}>Error al cargar productos: {error.message}</div>
                 )}

                 {/* 3. Si NO está cargando, NO hay error Y HAY productos, muestra la lista de productos */}
                 {!loading && !error && products.length > 0 && (
                     // Itera sobre el array 'products' y crea un elemento por cada producto
                     products.map((product) => (
                         // *** Esto es la "tarjeta" de cada producto individual ***
                         // Puedes refinar mucho más este estilo después
                         <div key={product.id} className="product-item" style={{ flexShrink: 0, width: '180px', textAlign: 'center', border: '1px solid #eee', padding: '10px', borderRadius: '4px', backgroundColor: '#fff' }}> {/* Estilos de la tarjeta individual */}
                            {/* Imagen del Producto */}
                             {product.images && product.images.length > 0 ? (
                                 <img
                                     src={product.images[0].src} // Muestra la primera imagen del producto
                                     alt={product.images[0].alt || product.name} // Texto alternativo
                                     style={{ width: '100%', height: '150px', objectFit: 'cover', marginBottom: '10px', borderRadius: '4px' }} // Estilos de la imagen
                                 />
                             ) : (
                                 // Placeholder si el producto no tiene imágenes
                                  <div style={{ width: '100%', height: '150px', backgroundColor: '#ccc', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>Sin Imagen</div>
                             )}

                             {/* Nombre del Producto */}
                             <h3 style={{ fontSize: '1em', margin: '0 0 5px 0', fontWeight: 'normal' }}>{product.name}</h3> {/* Estilos del nombre */}

                             {/* Precio del Producto */}
                             <p style={{ fontSize: '0.9em', color: '#555', margin: 0 }}>{product.price} €</p> {/* Estilos del precio */}

                             {/* Opcional: Botón/Enlace "Ver Producto" (usando <Link> de react-router-dom) */}
                             {/* Asegúrate de importar Link si lo añades aquí */}
                             {/* import { Link } from 'react-router-dom'; */}
                             {/* <Link to={`/producto/${product.id}`} style={{ textDecoration: 'none', fontSize: '0.9em', color: '#007bff', marginTop: '10px', display: 'inline-block' }}>Ver más</Link> */}
                         </div>
                     ))
                 )}

                 {/* 4. Si NO está cargando, NO hay error Y la lista de productos está VACÍA, muestra "No encontrados" */}
                 {!loading && !error && products.length === 0 && (
                      <div style={{ textAlign: 'center', width: '100%' }}>No se encontraron productos.</div>
                 )}

            </div>
        </section>
    );
    // NOTA: Los estilos inline en este return son básicos. Lo ideal es moverlos a un archivo CSS después.
}

// Asegúrate de exportar el componente al final del archivo
export default ProductListSection;