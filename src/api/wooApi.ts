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
// Función getProducts: Acepta paginación, categoría, orden, filtros y lista de IDs
export const getProducts = async (
    page: number = 1,
    per_page: number = 100,
    categoryId?: number, // Opcional: Filtrar por ID de categoría
    orderby?: string, // Opcional: Campo para ordenar (ej: 'date', 'popularity')
    order?: 'asc' | 'desc', // Opcional: Orden (ascendente o descendente)
    on_sale?: boolean, // Opcional: Filtrar productos en oferta
    featured?: boolean, // Opcional: Filtrar productos destacados
    includeIds?: number[] // Opcional: Incluir solo productos con estos IDs
): Promise<{ products: Product[], total: number, totalPages: number }> => {
    // Construye la URL base con paginación
    let apiUrl = `${SITEURL}/wp-json/wc/v3/products?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}&page=${page}&per_page=${per_page}`;

    // *** Añadir parámetros de filtrado/orden SI se proporcionan ***

    if (categoryId !== undefined) { // Verificar si categoryId tiene un valor (puede ser 0 para 'Uncategorized')
         apiUrl += `&category=${categoryId}`;
    }

    if (orderby) {
        apiUrl += `&orderby=${orderby}`;
    }

    if (order) {
        apiUrl += `&order=${order}`;
    }

    if (on_sale !== undefined) { // Verificar si on_sale tiene un valor (true o false)
        apiUrl += `&on_sale=${on_sale}`;
    }

     if (featured !== undefined) { // Verificar si featured tiene un valor (true o false)
         apiUrl += `&featured=${featured}`;
    }

     if (includeIds && includeIds.length > 0) { // Verificar si includeIds es un array no vacío
         apiUrl += `&include=${includeIds.join(',')}`; // La API espera IDs separados por coma
         // Nota: La paginación puede comportarse diferente con 'include'
     }

    // console.log("Calling API with URL:", apiUrl); // Opcional: Log para depuración de la URL

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
             console.error("API Error Response Body:", errorBody); // Log del cuerpo del error
             throw new Error(errorMessage);
         }

        const totalProductsHeader = response.headers.get('X-WP-Total');
        const totalPagesHeader = response.headers.get('X-WP-TotalPages');

        const totalProducts = totalProductsHeader ? parseInt(totalProductsHeader, 10) : 0;
        const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 0;

        const productsData: Product[] = await response.json();

        // console.log("API Response Data (Partial):", productsData.slice(0, 2)); // Log de los primeros 2 productos
        // console.log("API Response Totals:", { totalProducts, totalPages }); // Log de los totales


        return {
            products: productsData,
            total: totalProducts,
            totalPages: totalPages,
        };

    } catch (caughtError: unknown) {
        const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
        console.error("Error al obtener productos desde wooApi (fetch fallido o error inesperado):", error);
        throw error; // Re-lanzamos el error para que el componente lo maneje
    }
};
