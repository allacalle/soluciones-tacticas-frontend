// src/pages/ProductListPage.tsx (o src/pages/ProductListPage.jsx)
import  { useEffect, useState } from 'react'; // Necesitamos useEffect y useState

// *** Importa la función para obtener productos y la interfaz Product ***
import { getProducts } from '../api/wooApi'; // Asegúrate de que la ruta sea correcta (../api/wooApi)
import { Product } from '../types'; // Asegúrate de que la ruta sea correcta (../types)

// *** No necesitas importar useLocation o useParams AÚN, lo haremos en el siguiente paso para filtrar ***
// import { useLocation, useParams } from 'react-router-dom';


function ProductListPage() {
  // *** Estados existentes para los productos, carga y error ***
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // *** NUEVOS ESTADOS PARA LA PAGINACIÓN (Añade estas líneas) ***
  // currentPage: Para saber en qué página estamos. Empezamos en la página 1.
  const [currentPage, setCurrentPage] = useState<number>(1);
  // totalProducts: Para guardar el número total de productos que devuelve la API.
  const [totalProducts, setTotalProducts] = useState<number>(0);
  // totalPages: Para guardar el número total de páginas que devuelve la API. ¡Esto es clave para saber cuántas páginas hay!
  const [totalPages, setTotalPages] = useState<number>(0);

  // Aquí puedes definir cuántos productos quieres por página en este componente.
  // Es buena práctica enviárselo a getProducts explícitamente.
  const productsPerPage = 10; // Usa 100 temporalmente para ver más productos


  // *** Modificamos este useEffect para usar el estado currentPage y guardar los totales ***
  // (Reemplaza el useEffect existente con este código)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // *** LLAMA a getProducts pasándole la página actual y cuántos quieres por página ***
        // getProducts ahora devuelve un OBJETO { products, total, totalPages }
        const result = await getProducts(currentPage, productsPerPage); // Pasa los parámetros

        // *** Actualiza los estados con la información que devuelve la función API ***
        setProducts(result.products); // Guarda el array de productos de la página actual
        setTotalProducts(result.total); // Guarda el total global de productos
        setTotalPages(result.totalPages); // Guarda el total de páginas calculado por la API

        setLoading(false); // La carga terminó
      } catch (caughtError: unknown) {
        // Maneja cualquier error que haya re-lanzado getProducts
        const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
        console.error("Error al cargar productos en ProductListPage:", error);
        setError(error); // Guarda el error en el estado
        setLoading(false); // Indica que la carga ha terminado (con error)
      }
    };

    fetchProducts(); // Ejecuta la función de carga

    // *** IMPORTANTE: Array de dependencias ***
    // Ahora, este efecto DEBE ejecutarse CADA VEZ que cambie la 'currentPage'.
    // Si no pones 'currentPage' aquí, el efecto solo se ejecutaría una vez al montar el componente,
    // y al cambiar la página, no se volverían a cargar los productos de la nueva página.
  }, [currentPage, productsPerPage]); // Añadimos currentPage (y productsPerPage si fuera variable) como dependencia


  // *** Lógica de renderizado: Mostrar estado de carga, error o la lista de productos ***
  if (loading) {
    return <div>Cargando productos de la página {currentPage}...</div>;
  }

  if (error) {
    return <div>Error al cargar productos: {error.message}</div>;
  }

  // Si no está cargando y no hay error, mostramos la lista de productos
  return (
    <div>
      <h2>Listado de Productos</h2>
      {/* *** Añade la información de paginación visible aquí *** */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <p>Total de productos encontrados: {totalProducts}</p>
        <p>Mostrando página {currentPage} de {totalPages}</p>
        {/* Aquí es donde pondremos los CONTROLES de paginación (botones, etc.) en el siguiente paso */}
      </div>

      {/* Aquí es donde renderizaremos la lista de productos */}
      {products.length > 0 ? (
        <ul>
          {products.map((product) => (
            <li key={product.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
              {product.name} - {product.price} €
               {/* Opcional: muestra la primera imagen si existe */}
              {product.images && product.images.length > 0 && (
                  <img
                      src={product.images[0].src}
                      alt={product.images[0].alt || product.name}
                      style={{ width: '80px', height: 'auto', marginRight: '10px' }}
                  />
              )}
            </li>
          ))}
        </ul>
      ) : (
        // Si no hay productos para la página actual y no hay error ni carga
        !loading && !error && totalProducts > 0 && currentPage > totalPages ? (
            <p>No hay productos en esta página. (Quizás excediste el número total de páginas)</p>
        ) : (
             !loading && !error && totalProducts === 0 && <p>No se encontraron productos.</p> // Mensaje si totalProducts es 0
        )
      )}

      {/* *** Aquí irán los BOTONES de paginación interactivos en el siguiente paso *** */}
      <div style={{ marginTop: '20px' }}>
           {/* Botón para ir a la página anterior */}
           <button
               onClick={() => setCurrentPage(currentPage - 1)} // Al clic, decrementa la página actual
               disabled={currentPage === 1 || loading} // Deshabilita si estás en la primera página o cargando
               style={{ marginRight: '10px', padding: '5px 10px' }}
           >
               Página Anterior
           </button>

           {/* Botón para ir a la página siguiente */}
           <button
               onClick={() => setCurrentPage(currentPage + 1)} // Al clic, incrementa la página actual
               // Deshabilita si estás en la última página (currentPage es igual a totalPages) o cargando
               disabled={currentPage === totalPages || loading}
               style={{ padding: '5px 10px' }}
           >
               Página Siguiente
           </button>
       </div>

    </div>
  );
}

export default ProductListPage;