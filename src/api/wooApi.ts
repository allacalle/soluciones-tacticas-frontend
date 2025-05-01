 import { Product } from "../types";

 // ** ============================================================== **
  // ** CONFIGURACIÓN DE CONEXIÓN - ¡MODIFICA ESTO!         **
  // ** ============================================================== **
  const SITEURL = 'https://soluciones-tacticas-backend.local/'; // <<< REEMPLAZA
  const CONSUMER_KEY = 'ck_9d43f2c0384942479d830cfcd97c439228229f3b'; // <<< REEMPLAZA
  const CONSUMER_SECRET = 'cs_f86184898df714bba66059e17218348dd732e2e5'; // <<< REEMPLAZA
  // ** ============================================================== **
  const base64Credentials = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);

// Función para obtener productos, ahora acepta parámetros de paginación y retorna un objeto con totales
export const getProducts = async (page: number = 1, per_page: number = 100): Promise<{ products: Product[], total: number, totalPages: number }> =>
    {
        // Construye la URL, añadiendo los parámetros de paginación
        const apiUrl = `${SITEURL}/wp-json/wc/v3/products?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}&page=${page}&per_page=${per_page}`;
    
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${base64Credentials}`,
                    'User-Agent': 'ArmeriaFrontend/1.0'
                }
            });
    
            if (!response.ok) {
                 const errorBody = await response.text();
                 let errorMessage = `Error HTTP! Estado: ${response.status}`;
                 try {
                     const errorJson = JSON.parse(errorBody);
                     if (errorJson.message) {
                         errorMessage += ` - Mensaje: ${errorJson.message}`;
                     } else if (errorJson.code) {
                         errorMessage += ` - Código: ${errorJson.code}`;
                     }
                 } catch (errorParsingJson) {
                     console.error("Error al parsear cuerpo del error como JSON:", errorParsingJson);
                     errorMessage += ` - Respuesta: ${errorBody.substring(0, 150)}...`;
                 }
                 throw new Error(errorMessage);
             }
    
            // *** IMPORTANTE: Leer los encabezados que contienen la información de paginación ***
            // response.headers.get() devuelve un string o null, por eso usamos parseInt y el operador || 0
            const totalProductsHeader = response.headers.get('X-WP-Total');
            const totalPagesHeader = response.headers.get('X-WP-TotalPages');
    
            // Convertir los encabezados a números (si existen)
            const totalProducts = totalProductsHeader ? parseInt(totalProductsHeader, 10) : 0;
            const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 0;
    
    
            const productsData: Product[] = await response.json();
    
            // *** RETORNAR EL OBJETO COMPLETO con los productos y los totales ***
            return {
                products: productsData, // El array de productos
                total: totalProducts, // El total de productos que leímos del encabezado
                totalPages: totalPages, // El total de páginas que leímos del encabezado
            };
    
        } catch (caughtError: unknown) {
            const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
            console.error("Error al obtener productos desde wooApi (paginación):", error);
            throw error; // Re-lanzamos el error
        }
        // El bloque 'finally' NO va en la función API, se queda en el componente que gestiona el estado.
    };
    
    // *** Quita esta línea, ya exportamos la función con 'export const' arriba ***
    // export default getProducts;