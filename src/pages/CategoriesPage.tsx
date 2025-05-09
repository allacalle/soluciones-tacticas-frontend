// src/pages/CategoriesPage.tsx

// Importa los estilos CSS específicos de esta página
import	'./css/CategoriesPage.css';

import	{ useEffect, useState, useMemo } from 'react'; // Importa useMemo
import	{ Link } from 'react-router-dom';

// Importa las funciones y interfaces necesarias
import	{ getCategories } from '../api/wooApi';
import	{ Category } from '../types';

// Definir una interfaz para la estructura jerárquica de categorías
interface HierarchicalCategory extends Category {
	children: HierarchicalCategory[];
}

// Helper function to build the category tree
const	buildCategoryTree = (categories: Category[]): HierarchicalCategory[] => {
	const	categoryMap: { [id: number]: HierarchicalCategory } = {};
	const	topLevelCategories: HierarchicalCategory[] = [];

	// Primero, mapear todas las categorías y añadir la propiedad children
	categories.forEach(cat => {
		// Excluir la categoría "Sin categorizar" al construir el mapa inicial
		if (cat.slug === 'uncategorized') {
			return;
		}
		categoryMap[cat.id] = { ...cat, children: [] };
	});

	// Luego, construir la jerarquía
	Object.values(categoryMap).forEach(cat => {
		if (cat.parent === 0) {
			// Es una categoría de nivel superior
			topLevelCategories.push(cat);
		} else {
			// Es una subcategoría, encontrar a su padre y añadirla como hijo
			const	parent = categoryMap[cat.parent];
			if (parent) {
				parent.children.push(cat);
			}
			// Si el padre no se encuentra en el mapa (ej: padre filtrado/excluido), la subcategoría no se añade
		}
	});

	// Opcional: Ordenar categorías de nivel superior y sus hijos por nombre
	topLevelCategories.sort((a, b) => a.name.localeCompare(b.name));
	topLevelCategories.forEach(cat => {
		cat.children.sort((a, b) => a.name.localeCompare(b.name));
	});


	return	topLevelCategories;
};


export default function CategoriesPage() {
	// HOOKS
	const	[allCategories, setAllCategories] = useState<Category[]>([]); // Estado para la lista plana de la API
	const	[loading, setLoading] = useState<boolean>(true);
	const	[error, setError] = useState<Error | null>(null);
	const	[expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set()); // Estado para saber qué IDs están expandidos

	const	perPage = 100; // Fetching a large number to get most/all categories


	// *** useMemo para construir la jerarquía cada vez que allCategories cambia ***
	const	hierarchicalCategories = useMemo(() => {
		return	buildCategoryTree(allCategories);
	}, [allCategories]);


	// *** useEffect para cargar TODAS las CATEGORÍAS planas ***
	useEffect(() => {
		const	fetchCategories = async () => {
			setLoading(true);
			setError(null);
			setAllCategories([]);

			try {
				// !!! Llamada a getCategories - Fetching ALL categories (parent=undefined) !!!
				// Usamos context='view' por si necesitamos la descripción completa
				const	result = await getCategories(1, perPage);


				// Nota: Aquí no filtramos por parent=0, obtenemos TODAS para construir la jerarquía
				setAllCategories(result.categories);
				console.log(`[CategoriesPage] Fetched ${result.categories.length} total categories.`);

			} catch (caughtError: unknown) {
				const	error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
				console.error("[CategoriesPage] Error al cargar las categorías:", error);
				setError(error);
				setAllCategories([]);
			} finally {
				setLoading(false);
				console.log("[CategoriesPage] Finished fetching all categories process.");
			}
		};

		fetchCategories();

	}, []); // Dependencias: array vacío


	// Lógica para expandir/colapsar una categoría
	const	toggleCategoryExpansion = (categoryId: number) => {
		setExpandedCategories(prevExpanded => {
			const	newExpanded = new Set(prevExpanded);
			if (newExpanded.has(categoryId)) {
				newExpanded.delete(categoryId);
			} else {
				newExpanded.add(categoryId);
			}
			return	newExpanded;
		});
	};


	// ======================================================================
	// Componente o Función de Ayuda para Renderizar un Ítem de Categoría y sus Hijos
	// Lo definimos dentro del componente principal para que tenga acceso a toggleCategoryExpansion y expandedCategories
	// ======================================================================
	const	renderCategoryItem = (category: HierarchicalCategory) => {
		const	isExpanded = expandedCategories.has(category.id);
		const	hasChildren = category.children && category.children.length > 0;

		return (
			// Usamos li para una estructura de lista semántica, pero puedes usar div si prefieres
			<li key={category.id} className={`category-list-item ${hasChildren ? 'has-children' : ''} ${isExpanded ? 'expanded' : ''}`}>

				{/* Contenedor del nombre de la categoría, expand/collapse y enlace */}
				<div className="category-item-header">
					{/* Botón para expandir/colapsar si tiene hijos */}
					{hasChildren && (
						<button
							className="expand-toggle"
							onClick={(e) => {
								e.preventDefault(); // Prevenir la navegación si el Link lo envuelve
								toggleCategoryExpansion(category.id);
							}}
							aria-expanded={isExpanded}
							aria-controls={`subcategories-${category.id}`} // Para accesibilidad
						>
							{isExpanded ? '-' : '+'} {/* Símbolo + o - */}
						</button>
					)}
					{/* Espacio para alinear ítems sin toggle */}
					{!hasChildren && <span className="expand-toggle-placeholder"></span>} {/* Espacio vacío si no hay hijos */}


					{/* Nombre de la Categoría como Link */}
					<Link to={`/productos/${category.slug}`} className="category-name-link">
						{category.name}
					</Link>
				</div>

				{/* Descripción de la categoría (si existe) */}
				{/* Usamos dangerouslySetInnerHTML si la descripción puede contener HTML */}
				{category.description && (
					<div className="category-description" dangerouslySetInnerHTML={{ __html: category.description }} />
				)}


				{/* Renderizar subcategorías si está expandido y tiene hijos */}
				{hasChildren && isExpanded && (
					<ul className="subcategories-list" id={`subcategories-${category.id}`}> {/* Usamos ul para la lista de hijos */}
						{category.children.map(subcat => (
							// Llamada recursiva para renderizar cada subcategoría
							renderCategoryItem(subcat) // Renderiza la subcategoría usando la misma función
						))}
					</ul>
				)}
			</li>
		);
	};

	// ======================================================================
	// Lógica de Renderizado Condicional del Componente Principal
	// ======================================================================

	if (loading) {
		return	<div className="categories-page-loading">Cargando categorías...</div>;
	}

	if (error) {
		return	<div className="categories-page-error">Error al cargar las categorías: {error.message}</div>;
	}

	// Si no se encontraron categorías (después de filtrar 'uncategorized' durante la construcción del árbol)
	// hierarchicalCategories contendrá solo categorías de nivel superior que no sean uncategorized.
	if (hierarchicalCategories.length === 0) {
		return	<div className="categories-page-not-found">No se encontraron categorías principales disponibles (o todas son subcategorías de otras).</div>;
	}


	// ======================================================================
	// Renderizado Final de la Página Principal
	// ======================================================================
	return (
		<div className="categories-page-container">

			{/* Título de la página */}
			<h2>Nuestras Categorías de Productos</h2>

			{/* Lista de categorías de nivel superior */}
			{/* Usamos ul como contenedor principal para la lista jerárquica */}
			<ul className="categories-tree-list">
				{hierarchicalCategories.map(category => (
					// Llama a la función de ayuda para renderizar cada categoría de nivel superior
					renderCategoryItem(category)
				))}
			</ul>

		</div>
	);
}