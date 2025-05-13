/* eslint-disable @typescript-eslint/no-explicit-any */
 // ** ============================================================== **
  // ** CONFIGURACIÓN DE CONEXIÓN - ¡MODIFICA ESTO!         **
  // ** ============================================================== **
  const SITEURL = 'https://soluciones-tacticas-backend.local/'; // <<< REEMPLAZA
  const CONSUMER_KEY = 'ck_9d43f2c0384942479d830cfcd97c439228229f3b'; // <<< REEMPLAZA
  const CONSUMER_SECRET = 'cs_f86184898df714bba66059e17218348dd732e2e5'; // <<< REEMPLAZA


// Base64 de las credenciales para la cabecera de autorizaci\u00F3n (si usas Basic Auth)
// *** COMENTADO porque no se usa con la autenticaci\u00F3n por par\u00Eaacute;metros en la URL ***
// const base64Credentials = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`); // Ejemplo si usaras Basic Auth


// Validaci\u00F3n b\u00Eaacute;sica de configuraci\u00F3n
if (!SITEURL || !CONSUMER_KEY || !CONSUMER_SECRET) {
	console.error("ERROR: Las variables de entorno SITEURL, CONSUMER_KEY, y CONSUMER_SECRET deben estar configuradas para wooApi.");
	// Considera lanzar un error fatal aqu\u00ED en un entorno real si la configuraci\u00F3n es cr\u00EDtica.
}


// Importa las interfaces necesarias
import { Product, Category, Brand } from '../types'; // Aseg\u00FArate de que Product, Category y Brand est\u00Eaacute;n definidas


// ======================================================================
// *** Funciones para obtener informaci\u00F3n de Categor\u00EDas ***
// ======================================================================

// Funci\u00F3n para obtener el ID de una categor\u00EDa dado su slug
export const getCategoryIdBySlug = async (slug: string): Promise<number | null> => {
	// Url construida usando par\u00Eaacute;metros en la URL (consumer_key/secret)
	const apiUrl = `${SITEURL}/wp-json/wc/v3/products/categories?slug=${encodeURIComponent(slug)}&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

	try {
		const response = await fetch(apiUrl, {
			method: 'GET',
			headers: {
				// 'Authorization': `Basic ${base64Credentials}`, // Ejemplo de Basic Auth (si no usas par\u00Eaacute;metros en URL)
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
					errorMessage += ` - C\u00F3digo: ${errorJson.code}`;
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
		console.error("Error al obtener ID de categor\u00EDa desde wooApi:", error);
		throw error;
	}
};

// Funci\u00F3n para obtener una lista de categor\u00EDas.
export const getCategories = async (
	page: number = 1,
	per_page: number = 100, // Aumenta si tienes muchas categor\u00EDas para no paginar el men\u00FA
	search?: string, // Opcional: buscar categor\u00EDas por nombre
	parent?: number // Opcional: filtrar por categor\u00EDa padre (ej: 0 para solo categor\u00EDas de nivel superior)
	// Otros par\u00Eaacute;metros que la API de categor\u00EDas acepte y que necesites (orderby, order, include, exclude, slug, hide_empty, product)
): Promise<{ categories: Category[], total: number, totalPages: number }> => {

	// *** URL del endpoint de CATEGOR\u00CDAS v3 ***
	let apiUrl = `${SITEURL}/wp-json/wc/v3/products/categories?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}&page=${page}&per_page=${per_page}`;

	// A\u00F1adir par\u00Eaacute;metros de filtrado/orden si se proporcionan
	if (search) {
		apiUrl += `&search=${encodeURIComponent(search)}`;
	}
	if (parent !== undefined) { // Aseg\u00FArate de que 0 tambi\u00E9n se env\u00EDe si quieres categor\u00EDas padre
		apiUrl += `&parent=${parent}`;
	}
	// Si quieres ocultar categor\u00EDas vac\u00EDas (que tienen count = 0), podr\u00EDas a\u00F1adir &hide_empty=true
	// Esto podr\u00EDa ser \u00FAtil para no mostrar categor\u00EDas del men\u00FA que no tienen productos
	// apiUrl += `&hide_empty=true`; // <-- Opcional, descomenta si quieres


	console.log("Calling API for Categories with URL:", apiUrl); // Log para depuraci\u00F3n

	try {
		const response = await fetch(apiUrl, {
			method: 'GET',
			headers: {
				// 'Authorization': `Basic ${base64Credentials}`, // Autenticaci\u00F3n
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
					errorMessage += ` - C\u00F3digo: ${errorJson.code}`;
				}
			} catch (errorParsingJson) {
				console.error("Error al parsear cuerpo del error como JSON:", errorParsingJson);
				errorMessage += ` - Respuesta: ${errorBody.substring(0, 150)}...`;
			}
			console.error("API Error Response Body (Categories):", errorBody);
			throw new Error(errorMessage); // Lanza un error si la respuesta HTTP no es OK
		}


		// *** LEER LAS CABECERAS PARA LA PAGINACI\u00D3N DE CATEGOR\u00CDAS ***
		const totalCategoriesHeader = response.headers.get('X-WP-Total');
		const totalPagesHeader = response.headers.get('X-WP-TotalPages');

		const totalCategories = totalCategoriesHeader ? parseInt(totalCategoriesHeader, 10) : 0;
		const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 0;


		// La respuesta exitosa es un array de objetos de Categor\u00EDa
		const categoriesData: Category[] = await response.json();

		console.log("[WooApi] Categories fetched successfully:", categoriesData.length, "categories"); // Log de categor\u00EDas cargadas
		// console.log("API Response Data (Categories - Partial):", categoriesData.slice(0, 2)); // Log de las primeras 2 categor\u00EDas
		// console.log("API Response Totals (Categories):", { totalCategories, totalPages }); // Log de los totales


		// *** RETURN FINAL ***
		return {
			categories: categoriesData, // Devolvemos el array de categor\u00EDas
			total: totalCategories,
			totalPages: totalPages,
		};

	} catch (caughtError: unknown) {
		const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
		console.error("Error al obtener categor\u00EDas desde wooApi (fetch fallido o error inesperado):", error);
		throw error; // Re-lanzamos el error para que el componente lo maneje
	}
};


// ======================================================================
// *** Funciones para obtener informaci\u00F3n de Productos ***
// ======================================================================

// Funci\u00F3n para obtener productos, ahora acepta par\u00Eaacute;metros de paginaci\u00F3n y retorna un objeto con totales
// Funci\u00F3n getProducts: Acepta paginaci\u00F3n, categor\u00EDa, orden, filtros y lista de IDs
export const getProducts = async (
	page: number = 1,
	per_page: number = 10,
	// 'category' siempre ser\u00Eaacute; una cadena de IDs (ej: "47" o "47,52") o undefined,
	// proveniente de categoryIdsString en ProductListPage.tsx
	categoryIdsString?: string,
	search?: string,
	orderby: string = 'date',
	order: 'asc' | 'desc' = 'desc',
	on_sale?: boolean,
	featured?: boolean,
	includeIds?: number[],
	brandId?: number // Nuevo par\u00Eaacute;metro para filtrar por ID de marca

): Promise<{ products: Product[], total: number, totalPages: number }> => {

	let categoryQueryParam = '';

	// Si se proporciona una cadena de IDs de categor\u00EDa y no est\u00Eaacute; vac\u00EDa, la usamos directamente.
	// ProductListPage.tsx ya ha resuelto los slugs a IDs y los ha agrupado.
	if (categoryIdsString && categoryIdsString.trim().length > 0) {
		// No importa si es "47" o "47,52", la API de WooCommerce lo maneja.
		categoryQueryParam = `&category=${encodeURIComponent(categoryIdsString.trim())}`;
	} else {
		// Opcional: log si no se aplica filtro de categor\u00EDa
		console.log('[WooApi getProducts] No se proporcion\u00F3 categoryIdsString o est\u00Eaacute; vac\u00EDo. No se aplicar\u00Eaacute; filtro de categor\u00EDa por esta v\u00EDa.');
	}

	let apiUrl = `${SITEURL}/wp-json/wc/v3/products?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
	apiUrl += `&page=${page}&per_page=${per_page}`;

	// A\u00F1adimos el par\u00Eaacute;metro de categor\u00EDa solo si se gener\u00F3 categoryQueryParam
	if (categoryQueryParam) {
		apiUrl += categoryQueryParam;
	}

	// El resto de tu l\u00F3gica para a\u00F1adir search, on_sale, featured, includeIds, orderby, order est\u00Eaacute; bien
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
		apiUrl += `&include=${includeIds.join(',')}`; // La API espera una lista de IDs separada por comas
	}
	// Es importante que orderby y order se a\u00F1adan despu\u00E9s de otros filtros
	// si as\u00ED lo requiere tu l\u00F3gica, o si orderby tiene un valor por defecto
	// que quieres que siempre se aplique.
	if (orderby) { // Aseg\u00FArate que orderby y order se aplican siempre si tienen valor
		apiUrl += `&orderby=${encodeURIComponent(orderby)}`;
		apiUrl += `&order=${encodeURIComponent(order)}`;
	}

	// *** A\u00F1adir el filtro por ID de marca si se proporciona ***
	if (brandId) {
		apiUrl += `&brand=${brandId}`; // <-- Este formato es el que est\u00Eaacute;s usando y parece funcionar con tu API
	}


	console.log("Calling API for Products with URL:", apiUrl); // Log para depuraci\u00F3n

	try {
		const response = await fetch(apiUrl, {
			method: 'GET',
			headers: {
				// 'Authorization': `Basic ${base64Credentials}`, // Autenticaci\u00F3n
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
					errorMessage += ` - C\u00F3digo: ${errorJson.code}`;
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

		// NOTA: La API de productos NO devuelve la imagen de la marca asociada.
		// Para obtener la imagen de la marca en el LISTADO, necesitar\u00EDas llamadas API adicionales por cada producto/marca,
		// lo cual no es eficiente. Esa l\u00F3gica se a\u00F1adir\u00Eaacute; SOLO en getProductByIdOrSlug para el detalle de un solo producto.

		return {
			products: productsData,
			total: totalProducts,
			totalPages: totalPages,
		};

	} catch (caughtError: unknown) {
		const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
		console.error("Error al obtener productos desde wooApi (fetch fallido o error inesperado):", error);
		throw error; // Re-lanza el error para que el componente que llama lo maneje
	}
};

// ======================================================================
// *** Funci\u00F3n para obtener un solo producto por ID o Slug ***
// *** MODIFICADA para obtener tambi\u00E9n la imagen de la marca asociada ***
// ======================================================================
// Usa el endpoint /products/<id> o /products?slug=<slug>
export const getProductByIdOrSlug = async (identifier: string | number): Promise<Product | null> => {
    let apiUrl = `${SITEURL}/wp-json/wc/v3/products`;
    let isSlugSearch = false; // Bandera para saber si buscamos por slug

    if (typeof identifier === 'number') {
        // Si el identificador es un n\u00FAmero, intentamos obtener por ID directo (/products/<id>)
        apiUrl += `/${identifier}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
    } else {
        // Si el identificador es una cadena (asumimos que es el slug), intentamos buscar por slug (/products?slug=<slug>)
        apiUrl += `?slug=${encodeURIComponent(identifier)}&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
        isSlugSearch = true; // Marcamos que es b\u00FAsqueda por slug
    }

    console.log(`[WooApi] Calling API for single product with identifier ${identifier}:`, apiUrl); // Log de la URL

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                // 'Authorization': `Basic ${base64Credentials}`, // Autenticaci\u00F3n
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
                    errorMessage += ` - C\u00F3digo: ${errorJson.code}`;
                }
            } catch (errorParsingJson) {
                console.error("[WooApi] Error al parsear cuerpo del error como JSON (Single Product):", errorParsingJson);
                errorMessage += ` - Respuesta: ${errorBody.substring(0, 150)}...`;
            }
            console.error("[WooApi] API Error Response Body (Single Product):", errorBody);
            // Si es un error 404 (No Encontrado) y est\u00Eaacute;bamos buscando por slug, probablemente el producto no existe con ese slug.
            if (response.status === 404 && isSlugSearch) {
                console.warn(`[WooApi] Product with slug "${identifier}" not found (404).`);
                return null; // Devolvemos null si no se encuentra por slug
            }
            // Para otros errores (400, 500, etc.), lanzamos una excepci\u00F3n
            throw new Error(errorMessage);
        }

        // *** CORRECCI\u00D3N DE TIPO: productData siempre ser\u00Eaacute; Product | null despu\u00E9s de este bloque ***
        // productData will hold the raw API response initially, then we'll process it
        let rawProductData: any;

        if (isSlugSearch) {
            // Cuando buscas por slug (/products?slug=...), la API devuelve un array
            const productsArray: any[] = await response.json(); // Use any[] initially
            rawProductData = productsArray.length > 0 ? productsArray[0] : null;
            if (rawProductData) {
                 console.log("[WooApi] Single product fetched successfully by slug (raw):", rawProductData);
             } else {
                 console.warn(`[WooApi] Product with slug "${identifier}" not found in API search results (array empty).`);
             }

        } else {
            // Cuando buscas por ID directo (/products/<id>), la API devuelve un solo objeto
            rawProductData = await response.json(); // Use any initially
             console.log("[WooApi] Single product fetched successfully by ID (raw):", rawProductData);
        }

        // Si el producto no se encontr\u00F3, devolvemos null tempranamente
        if (!rawProductData) {
            return null;
        }

        // --- EL CAMBIO M\u00c1S MENOR PARA ADAPTAR LA API AL TIPO LOCAL ---
        // La API devuelve 'brands' (plural). Nuestro tipo Product espera 'brand' (singular array).
        // Copiamos el contenido de 'brands' a una nueva propiedad 'brand' si existe.
        // Esto alinea la estructura de rawProductData con lo que espera el tipo Product y el resto del código.
        if (rawProductData.brands && Array.isArray(rawProductData.brands)) {
            rawProductData.brand = rawProductData.brands; // Copiamos 'brands' a 'brand'
             console.log(`[WooApi] Copied 'brands' (plural from API) to 'brand' (singular for internal type).`);
        } else {
             console.log(`[WooApi] Product data from API has no 'brands' property, or 'brands' array is empty. No brands to process.`);
             // Aseguramos que la propiedad 'brand' (singular) est\u00E9 ausente si no hab\u00EDa 'brands'
             // Esto coincide con la definici\u00F3n opcional 'brand?' en nuestro tipo Product.
             rawProductData.brand = undefined;
        }
        // --- Fin del cambio m\u00e1s menor ---


        // *** L\u00D3GICA ORIGINALMENTE A\u00D1ADIDA CON CUIDADO: Fetchear imagen de la marca si el producto tiene una marca asociada ***
        // Ahora que hemos asegurado que 'rawProductData.brand' existe (o es undefined)
        // podemos usar la l\u00f3gica original que esperaba 'productData.brand'.
        // TypeScript todav\u00EDa ve 'rawProductData' como 'any' aqu\u00ED, as\u00ED que las comprobaciones expl\u00EDcitas son buenas.
        if (rawProductData.brand && Array.isArray(rawProductData.brand) && rawProductData.brand.length > 0) {
             // Usamos el array 'brand' que hemos creado/copiado
             const firstBrandTerm = rawProductData.brand[0];
             // Nos aseguramos de que este t\u00E9rmino tiene un slug para poder usar getBrandBySlug
             if (firstBrandTerm.slug) {
                 try {
                     console.log(`[WooApi] Attempting to fetch brand details for slug: ${firstBrandTerm.slug}`);
                     // Llamamos a la funci\u00F3n existente getBrandBySlug
                     const fetchedBrandDetails = await getBrandBySlug(firstBrandTerm.slug);

                     // Si los detalles de la marca se obtuvieron Y tienen una propiedad 'image'
                     if (fetchedBrandDetails?.image) { // Usamos optional chaining para seguridad
                         // Si el array brand a\u00FAn existe en rawProductData y tiene al menos un elemento
                         if (rawProductData.brand && rawProductData.brand.length > 0) {
                              // Asignamos el objeto de imagen completo
                              rawProductData.brand[0].image = fetchedBrandDetails.image;
                              console.log("[WooApi] Successfully added brand image to product data.");
                         } else {
                             console.warn("[WooApi] Product data had brand initially, but array was empty or changed before adding image.");
                         }
                     } else {
                         console.log("[WooApi] Brand details fetched, but no image found for the brand.");
                     }
                 } catch (brandFetchError: unknown) {
                     const error = brandFetchError instanceof Error ? brandFetchError : new Error(String(brandFetchError));
                     console.error(`[WooApi] Error fetching brand details for product (slug: ${firstBrandTerm.slug}):`, error);
                 }
             } else {
                 console.warn("[WooApi] Product has brand data, but the first brand object is missing a slug.");
             }
        } else {
            // Este log ahora solo se ejecuta si la API no ten\u00eda 'brands' O si 'brands' estaba vac\u00EDo
            console.log("[WooApi] Product data (after checking 'brands') has no 'brand' property or it's empty. No brand image fetch attempted.");
        }
        // *** FIN L\u00D3GICA DE IMAGEN DE MARCA ***


        // Ahora, dado que hemos procesado rawProductData para que se parezca a nuestro tipo Product
        // (especialmente la propiedad 'brand'), podemos devolverlo con confianza como tipo Product.
        return rawProductData as Product; // Casteamos a Product

    } catch (caughtError: unknown) {
        const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
        console.error(`Error fetching single product with identifier ${identifier}:`, error);
        throw error; // Re-lanzamos el error
    }
};


// ======================================================================
// *** Funciones para obtener informaci\u00F3n de Marcas ***
// ======================================================================

// Funci\u00F3n COMPLETA y CORREGIDA para obtener la lista de Marcas
// Usa el endpoint de marcas v2 de la documentaci\u00F3n.
// Si este endpoint no funciona para tu instalaci\u00F3n, necesitar\u00Eaacute;s el endpoint correcto.
export const getBrands = async (
	page: number = 1,
	per_page: number = 100, // Puedes ajustar cu\u00Eaacute;ntas marcas obtener por p\u00Eaacute;gina
	search?: string // Opcional: Buscar marcas por nombre
	// Otros par\u00Eaacute;metros que la API de marcas acepte y que necesites
): Promise<{ brands: Brand[], total: number, totalPages: number }> => {

	// *** URL del endpoint de marcas v2 (de la documentaci\u00F3n) ***
	// Si tus marcas est\u00Eaacute;n en otro endpoint, CAMBIA SOLO ESTA L\u00CDNEA.
	let apiUrl = `${SITEURL}/wp-json/wc/v2/products/brands?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}&page=${page}&per_page=${per_page}`; // CAMBIADO a let

	// A\u00F1adir par\u00Eaacute;metros de filtrado/orden si se proporcionan
	 if (search) {
		 apiUrl += `&search=${search}`;
	 }

	// console.log("Calling API for Brands with URL:", apiUrl); // Log para depuraci\u00F3n

	try {
		const response = await fetch(apiUrl, {
			method: 'GET',
			headers: {
				// 'Authorization': `Basic ${base64Credentials}`,
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
					errorMessage += ` - C\u00F3digo: ${errorJson.code}`;
				}
			} catch (errorParsingJson) {
				console.error("Error al parsear cuerpo del error como JSON:", errorParsingJson);
				errorMessage += ` - Respuesta: ${errorBody.substring(0, 150)}...`;
			}
			console.error("API Error Response Body (Brands):", errorBody); // Log del cuerpo del error
			throw new Error(errorMessage); // Lanza un error si la respuesta HTTP no es OK
		 }


		// *** ESTAS L\u00CDNEAS LEEN LAS CABECERAS Y DEFINEN totalBrands y totalPages ***
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

// Funci\u00F3n para obtener los detalles de una marca por su Slug.
export const getBrandBySlug = async (slug: string): Promise<Brand | null> => {
	// La URL exacta y c\u00F3mo filtrar por slug depende de tu implementaci\u00F3n de marcas en WooCommerce
	// Ejemplo asumiendo un par\u00Eaacute;metro 'slug' en el endpoint /brands:
	const apiUrl = `${SITEURL}/wp-json/wc/v2/products/brands?slug=${slug}&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

	try {
		const response = await fetch(apiUrl, {
			method: 'GET',
			headers: {
				// 'Authorization': `Basic ${base64Credentials}`, // Aseg\u00FArate de que base64Credentials est\u00Eaacute; definido y es correcto
				'User-Agent': 'YourAppName/1.0' // Usa un User-Agent descriptivo
			}
		});

		if (!response.ok) {
			const errorBody = await response.text();
			console.error(`API Error Response Body (getBrandBySlug ${slug}):`, errorBody);
			if (response.status === 404) {
				return null; // Marca no encontrada
			}
			throw new Error(`Error HTTP! Estado: ${response.status} - ${response.statusText}`);
		}

		const data: Brand[] = await response.json();

		if (data.length > 0) {
			return data[0]; // Devuelve el primer (y deber\u00EDa ser \u00FAnico) resultado
		} else {
			return null; // No se encontr\u00F3 la marca con ese slug
		}

	} catch (caughtError: unknown) {
		const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
		console.error(`Error fetching brand by slug (${slug}) from wooApi:`, error);
		throw error; // Re-lanzamos el error para que el componente lo maneje (ej: mostrar mensaje de error)
	}
};