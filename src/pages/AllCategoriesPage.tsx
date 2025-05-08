// src/pages/AllCategoriesPage.tsx

import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './css/AllCategoriesPage.css'; // Importa los estilos para esta página

import { getCategories } from '../api/wooApi'; // Importa la función para obtener categorías
import { Category } from '../types'; // Importa la interfaz Category

function AllCategoriesPage() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const fetchCategories = async () => {
			setLoading(true);
			setError(null);
			try {
				// Obtener todas las categorías. Usar una per_page alta si tienes muchas.
				// Podrías añadir parent=0 si solo quieres categorías de nivel superior.
				const result = await getCategories(1, 100); // Ajusta per_page si es necesario
				// Opcional: Filtrar aquí si solo quieres categorías de nivel superior (parent === 0)
				// const topLevelCategories = result.categories.filter(cat => cat.parent === 0);
				// setCategories(topLevelCategories);
				setCategories(result.categories); // Mostrar todas las categorías por ahora
			} catch (caughtError: unknown) {
				const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
				console.error("Error al cargar la lista completa de categorías:", error);
				setError(error);
			} finally {
				setLoading(false);
			}
		};

		fetchCategories();
	}, []); // Array de dependencias vacío: solo se ejecuta una vez al montar el componente


	// ==============================================================
	// Renderizado Condicional
	// ==============================================================

	if (loading) {
		return <div className="all-categories-loading">Cargando categorías...</div>;
	}

	if (error) {
		return <div className="all-categories-error">Error al cargar categorías: {error.message}</div>;
	}

	if (categories.length === 0) {
		return <div className="all-categories-empty">No se encontraron categorías.</div>;
	}


	// ==============================================================
	// Renderizado de la lista de categorías
	// ==============================================================

	return (
		<div className="all-categories-page-container">
			<h1>Todas las Categorías</h1>

			{/* Lista simple de categorías - Puedes mejorar el diseño con CSS */}
			<div className="categories-list">
				<ul>
					{categories.map(category => (
						<li key={category.id}>
							{/* Enlaza a la ProductListPage para esa categoría usando su slug */}
							<Link to={`/categorias/${category.slug}`}>
								{category.name} ({category.count} productos) {/* Muestra nombre y contador de productos */}
							</Link>
						</li>
					))}
				</ul>
			</div> {/* Cierre categories-list */}

			{/* Puedes añadir aquí información de paginación si getCategories la soporta y la usas */}
			{/* <div className="pagination-info">...</div> */}

		</div> /* Cierre all-categories-page-container */
	);
}

export default AllCategoriesPage;