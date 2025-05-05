 import { Product } from "../types";
 import { Brand } from "../types"; // Asegúrate de que la ruta es correcta según tu estructura de carpetas

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

// ======================================================================
// *** Función COMPLETA y CORREGIDA para obtener la lista de Marcas ***
// ======================================================================
// Usa el endpoint de marcas v2 de la documentación.
// Si este endpoint no funciona para tu instalación, necesitarás el endpoint correcto.

export const getBrands = async (
    page: number = 1,
    per_page: number = 100, // Puedes ajustar cuántas marcas obtener por página
    search?: string // Opcional: Buscar marcas por nombre
    // Otros parámetros que la API de marcas acepte y que necesites
): Promise<{ brands: Brand[], total: number, totalPages: number }> => {

    // *** URL del endpoint de marcas v2 (de la documentación) ***
    // Si tus marcas están en otro endpoint, CAMBIA SOLO ESTA LÍNEA.
    let apiUrl = `${SITEURL}/wp-json/wc/v2/products/brands?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}&page=${page}&per_page=${per_page}`;


    // Añadir parámetros de filtrado/orden si se proporcionan
     if (search) {
         apiUrl += `&search=${search}`;
     }

    // console.log("Calling API for Brands with URL:", apiUrl); // Log para depuración

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${base64Credentials}`,
                'User-Agent': 'ArmeriaFrontend/1.0' // Usa un User-Agent descriptivo
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
             console.error("API Error Response Body (Brands):", errorBody); // Log del cuerpo del error
             throw new Error(errorMessage); // Lanza un error si la respuesta HTTP no es OK
         }


        // *** ESTAS LÍNEAS LEEN LAS CABECERAS Y DEFINEN totalBrands y totalPages ***
        const totalBrandsHeader = response.headers.get('X-WP-Total');
        const totalPagesHeader = response.headers.get('X-WP-TotalPages');

        const totalBrands = totalBrandsHeader ? parseInt(totalBrandsHeader, 10) : 0;
        const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 0;


        // La respuesta exitosa es un array de objetos de Marca
        const brandsData: Brand[] = await response.json();

        // console.log("API Response Data (Brands - Partial):", brandsData.slice(0, 2)); // Log de las primeras 2 marcas
        // console.log("API Response Totals (Brands):", { totalBrands, totalPages }); // Log de los totales


        // *** ESTE ES EL RETURN FINAL QUE FALTABA O ESTABA ROTO ***
        return {
            brands: brandsData, // Devolvemos el array de marcas
            total: totalBrands,
            totalPages: totalPages,
        };

    } catch (caughtError: unknown) {
         // Este catch ya estaba bien con el manejo de unknown
         const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
         console.error("Error al obtener marcas desde wooApi (fetch fallido o error inesperado):", error);
         throw error; // Re-lanzamos el error para que el componente lo maneje
     }
};