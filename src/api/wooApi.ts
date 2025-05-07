 import { Product, Brand, Category } from "../types";

 // ** ============================================================== **
  // ** CONFIGURACIÓN DE CONEXIÓN - ¡MODIFICA ESTO!         **
  // ** ============================================================== **
  const SITEURL = 'https://soluciones-tacticas-backend.local/'; // <<< REEMPLAZA
  const CONSUMER_KEY = 'ck_9d43f2c0384942479d830cfcd97c439228229f3b'; // <<< REEMPLAZA
  const CONSUMER_SECRET = 'cs_f86184898df714bba66059e17218348dd732e2e5'; // <<< REEMPLAZA
  // ** ============================================================== **
  const base64Credentials = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);


// Función para obtener el ID de una categoría dado su slug
export const getCategoryIdBySlug = async (slug: string): Promise<number | null> => {
	const apiUrl = `${SITEURL}/wp-json/wc/v3/products/categories?slug=${encodeURIComponent(slug)}&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
  
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
		console.error("API Error Response Body (Category by Slug):", errorBody);
		throw new Error(errorMessage);
	  }
  
	  const categoriesData: Category[] = await response.json();
	  if (categoriesData.length > 0) {
		return categoriesData[0].id;
	  } else {
		return null;
	  }
	} catch (caughtError: unknown) {
	  const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
	  console.error("Error al obtener ID de categoría desde wooApi:", error);
	  throw error;
	}
  };

// Función para obtener productos, ahora acepta parámetros de paginación y retorna un objeto con totales
// Función getProducts: Acepta paginación, categoría, orden, filtros y lista de IDs
// *** FUNCIÓN getProducts CON 9 PARÁMETROS Y CONSTRUCCIÓN DE URL CORREGIDA ***
export const getProducts = async (
	page: number = 1,
	per_page: number = 10,
	category?: string | number, // Ahora puede ser string (slug o lista de IDs) o number (ID)
	search?: string,
	orderby: string = 'date',
	order: 'asc' | 'desc' = 'desc',
	on_sale?: boolean,
	featured?: boolean,
	includeIds?: number[]
): Promise<{ products: Product[], total: number, totalPages: number }> => {

	let categoryQueryParam = ''; // Variable para almacenar el parámetro '&category=' que añadiremos a la URL

	if (category !== undefined && category !== null) { // Asegurarse de que category tiene un valor
		if (typeof category === 'string') {
			// Si es un string, verificamos si es una lista de IDs separada por comas
			if (category.includes(',')) {
				// Si contiene comas, asumimos que es una lista de IDs y la usamos directamente
				categoryQueryParam = `&category=${encodeURIComponent(category)}`;
			} else {
				// Si es un string sin comas, asumimos que es un slug y obtenemos su ID primero
				const fetchedCategoryId = await getCategoryIdBySlug(category);
				if (fetchedCategoryId !== null) {
					categoryQueryParam = `&category=${fetchedCategoryId}`;
				} else {
					console.warn(`Categoría con slug "${category}" no encontrada. No se aplicará filtro por categoría.`);
					// Si el slug no se encuentra, no añadimos el filtro de categoría
				}
			}
		} else if (typeof category === 'number') {
			// Si es un número, asumimos que es un ID y lo usamos directamente
			categoryQueryParam = `&category=${category}`;
		}
		// Si 'category' es de otro tipo, simplemente no añadimos el parámetro de categoría.
	}


	let apiUrl = `${SITEURL}/wp-json/wc/v3/products?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
	apiUrl += `&page=${page}&per_page=${per_page}`;

	// Añadimos el parámetro de categoría solo si se generó categoryQueryParam
	if (categoryQueryParam) {
		apiUrl += categoryQueryParam;
	}

	// ... (Resto de parámetros como search, orderby, order, on_sale, featured, includeIds - MANTENLOS IGUAL) ...

	if (search) {
		apiUrl += `&search=${encodeURIComponent(search)}`;
	}

	if (on_sale !== undefined) {
		apiUrl += `&on_sale=${on_sale}`;
	}

	if (featured !== undefined) {
		apiUrl += `&featured=${featured}`;
	}

	if (includeIds && includeIds.length > 0) {
		apiUrl += `&include=${includeIds.join(',')}`;
	}

	if (orderby) {
		apiUrl += `&orderby=${encodeURIComponent(orderby)}`;
		apiUrl += `&order=${encodeURIComponent(order)}`;
	}


	console.log("Calling API for Products with URL:", apiUrl);

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
			console.error("API Error Response Body (Products):", errorBody);
			throw new Error(errorMessage);
		}

		const totalProductsHeader = response.headers.get('X-WP-Total');
		const totalPagesHeader = response.headers.get('X-WP-TotalPages');

		const totalProducts = totalProductsHeader ? parseInt(totalProductsHeader, 10) : 0;
		const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 0;

		const productsData: Product[] = await response.json();

		return {
			products: productsData,
			total: totalProducts,
			totalPages: totalPages,
		};

	} catch (caughtError: unknown) {
		const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
		console.error("Error al obtener productos desde wooApi (fetch fallido o error inesperado):", error);
		throw error;
	}
};

// ======================================================================
// *** Función para obtener un solo producto por ID o Slug ***
// ======================================================================
// Usa el endpoint /products/<id> o /products?slug=<slug>
export const getProductByIdOrSlug = async (identifier: string | number): Promise<Product | null> => {
	let apiUrl = `${SITEURL}/wp-json/wc/v3/products`;
	let isSlugSearch = false; // Bandera para saber si buscamos por slug

	if (typeof identifier === 'number') {
		// Si el identificador es un número, intentamos obtener por ID directo (/products/<id>)
		apiUrl += `/${identifier}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
	} else {
		// Si el identificador es una cadena (asumimos que es el slug), intentamos buscar por slug (/products?slug=<slug>)
		apiUrl += `?slug=${encodeURIComponent(identifier)}&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
		isSlugSearch = true; // Marcamos que es búsqueda por slug
	}

	console.log(`[WooApi] Calling API for single product with identifier ${identifier}:`, apiUrl); // Log de la URL

	try {
		const response = await fetch(apiUrl, {
			method: 'GET',
			headers: {
				'Authorization': `Basic ${base64Credentials}`, // Autenticación
				'User-Agent': 'ArmeriaFrontend/1.0' // User-Agent
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
				console.error("[WooApi] Error al parsear cuerpo del error como JSON (Single Product):", errorParsingJson);
				errorMessage += ` - Respuesta: ${errorBody.substring(0, 150)}...`;
			}
			console.error("[WooApi] API Error Response Body (Single Product):", errorBody);
			// Si es un error 404 (No Encontrado) y estábamos buscando por slug, probablemente el producto no existe con ese slug.
			if (response.status === 404 && isSlugSearch) {
				console.warn(`[WooApi] Product with slug "${identifier}" not found (404).`);
				return null; // Devolvemos null si no se encuentra por slug
			}
			// Para otros errores (400, 500, etc.), lanzamos una excepción
			throw new Error(errorMessage);
		}

		const productData: Product | Product[] = await response.json();

		if (isSlugSearch) {
			// Cuando buscas por slug (/products?slug=...), la API devuelve un array, incluso si solo hay un resultado
			if (Array.isArray(productData) && productData.length > 0) {
				console.log("[WooApi] Single product fetched successfully by slug:", productData[0]);
				return productData[0]; // Devolvemos el primer (y único) producto del array
			} else {
				// Si el array está vacío, significa que no se encontró el producto con ese slug
				console.warn(`[WooApi] Product with slug "${identifier}" not found in API search results (array empty).`);
				return null;
			}
		} else {
			// Cuando buscas por ID directo (/products/<id>), la API devuelve un solo objeto de producto
			console.log("[WooApi] Single product fetched successfully by ID:", productData);
			return productData as Product; // Casteamos a Product
		}


	} catch (caughtError: unknown) {
		const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
		console.error(`[WooApi] Error fetching single product with identifier ${identifier}:`, error);
		throw error; // Re-lanzamos el error para que el componente que llama (ProductPage) lo maneje
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


// ======================================================================
export const getCategories = async (
	page: number = 1,
	per_page: number = 100, // Aumenta si tienes muchas categorías para no paginar el menú
	search?: string, // Opcional: buscar categorías por nombre
	parent?: number // Opcional: filtrar por categoría padre (ej: 0 para solo categorías de nivel superior)
	// Otros parámetros que la API de categorías acepte y que necesites (orderby, order, include, exclude, slug, hide_empty, product)
): Promise<{ categories: Category[], total: number, totalPages: number }> => {

	// *** URL del endpoint de CATEGORÍAS v3 ***
	let apiUrl = `${SITEURL}/wp-json/wc/v3/products/categories?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}&page=${page}&per_page=${per_page}`;

	// Añadir parámetros de filtrado/orden si se proporcionan
	if (search) {
		apiUrl += `&search=${encodeURIComponent(search)}`;
	}
	if (parent !== undefined) { // Asegúrate de que 0 también se envíe si quieres categorías padre
		apiUrl += `&parent=${parent}`;
	}
	// Si quieres ocultar categorías vacías (que tienen count = 0), podrías añadir &hide_empty=true
	// Esto podría ser útil para no mostrar categorías del menú que no tienen productos
	// apiUrl += `&hide_empty=true`; // <-- Opcional, descomenta si quieres


	console.log("Calling API for Categories with URL:", apiUrl); // Log para depuración

	try {
		const response = await fetch(apiUrl, {
			method: 'GET',
			headers: {
				'Authorization': `Basic ${base64Credentials}`, // Autenticación
				'User-Agent': 'ArmeriaFrontend/1.0' // User-Agent
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
				console.error("[WooApi] Error al parsear cuerpo del error como JSON (Categories):", errorParsingJson);
				errorMessage += ` - Respuesta: ${errorBody.substring(0, 150)}...`;
			}
			console.error("API Error Response Body (Categories):", errorBody);
			throw new Error(errorMessage); // Lanza un error si la respuesta HTTP no es OK
		}

		// *** LEER LAS CABECERAS PARA LA PAGINACIÓN DE CATEGORÍAS ***
		const totalCategoriesHeader = response.headers.get('X-WP-Total');
		const totalPagesHeader = response.headers.get('X-WP-TotalPages');

		const totalCategories = totalCategoriesHeader ? parseInt(totalCategoriesHeader, 10) : 0;
		const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 0;


		// La respuesta exitosa es un array de objetos de Categoría
		const categoriesData: Category[] = await response.json();

		console.log("[WooApi] Categories fetched successfully:", categoriesData.length, "categories"); // Log de categorías cargadas
		// console.log("API Response Data (Categories - Partial):", categoriesData.slice(0, 2)); // Log de las primeras 2 categorías
		// console.log("API Response Totals (Categories):", { totalCategories, totalPages }); // Log de los totales


		// *** RETURN FINAL ***
		return {
			categories: categoriesData, // Devolvemos el array de categorías
			total: totalCategories,
			totalPages: totalPages,
		};

	} catch (caughtError: unknown) {
		const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
		console.error("Error al obtener categorías desde wooApi (fetch fallido o error inesperado):", error);
		throw error; // Re-lanzamos el error para que el componente lo maneje
	}
};

