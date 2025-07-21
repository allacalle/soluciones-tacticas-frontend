// src/pages/CategoriesPage.tsx

import './CategoriesPage.css';
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../api/wooApi';
import { Category } from '../../types';

// --- IMPORTACIÓN DE ICONOS DE REACT-ICONS (AJUSTADA SEGÚN USO) ---
import {
    FaShoppingBag, FaFirstAid, FaUserShield, FaTools, FaCog, FaFolder,
    FaSprayCan, // FaKey para grilletes/seguridad
    FaTshirt, FaFire, FaGift, FaPlusCircle, FaMinusCircle, FaGraduationCap, // Para acceso academia
    FaBookOpen, 
    FaHandPaper,
    FaShieldAlt,
    FaBell // Usando FaBell como reemplazo de FaBelt
} from 'react-icons/fa';
import { GiKitchenKnives } from 'react-icons/gi';

import {
    GiPoliceOfficerHead, GiMilitaryFort, GiLeatherBoot,
        GiFlashlight, GiCape, GiShirt, 
        GiHandcuffs, // Para Grilletes
        GiTargetShot,
        GiStaticWaves, // Para "Pouches" (usando GiStaticWaves como reemplazo)
        GiCampingTent // Para "Utensilios" (Outdoor)
    } from 'react-icons/gi';

import {
    MdCleaningServices, MdOutlineOutdoorGrill} from "react-icons/md";
// --- FIN IMPORTACIÓN DE ICONOS ---

interface HierarchicalCategory extends Category {
    children: HierarchicalCategory[];
}

const buildCategoryTree = (categories: Category[]): HierarchicalCategory[] => {
    const categoryMap: { [id: number]: HierarchicalCategory } = {};
    const topLevelCategories: HierarchicalCategory[] = [];

    categories.forEach(cat => {
        if (cat.slug === 'uncategorized' || cat.name.toLowerCase() === 'sin categorizar') {
            return;
        }
        categoryMap[cat.id] = { ...cat, children: [] };
    });

    Object.values(categoryMap).forEach(cat => {
        if (cat.parent === 0) {
            topLevelCategories.push(cat);
        } else {
            const parentId = typeof cat.parent === 'number' ? cat.parent : undefined;
            if (parentId !== undefined) {
                const parent = categoryMap[parentId];
                if (parent) {
                    parent.children.push(cat);
                }
            }
        }
    });

    const sortByName = (a: HierarchicalCategory, b: HierarchicalCategory) => a.name.localeCompare(b.name);
    topLevelCategories.sort(sortByName);
    topLevelCategories.forEach(cat => {
        cat.children.sort(sortByName);
    });

    return topLevelCategories;
};

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

// --- MAPEO DE CATEGORÍAS A ICONOS (ACTUALIZADO CON TUS SLUGS) ---
const categoryIconMap: Record<string, IconComponent> = {
    // Categorías Padre Principales
    'armeria': FaShieldAlt,
    'equipacion': FaShoppingBag,
    'gala_y_regalos': FaGift,
    'militar': GiMilitaryFort,
    'outdoor_bushcraft': MdOutlineOutdoorGrill,
    'policial_vigilante': GiPoliceOfficerHead,
    'vestuario': FaTshirt,

    // Subcategorías (slugs en minúsculas como en tu log)
    'acceso_academia': FaGraduationCap, // o MdSchool
    'acceso_cefot': FaBookOpen, // o GiMilitaryFort si es más específico del Cefot
    'armas': GiTargetShot, // o un icono de arma más directo si lo encuentras
    'botas': GiLeatherBoot,
    'cabeza': GiCape,
    'cargadores': FaFolder, // GiBulletCase no existe, usando FaFolder como placeholder
    'chaquetas': GiShirt,
    'cinturones_hebillas': FaBell, // Usando FaBell como reemplazo de FaBelt
    'complementos': FaCog, // Para "Complementos" (Militar)
    'complementos_armas': FaTools,
    'defensas_armeria': FaUserShield,
    'defensas_policial': FaUserShield, // Mismo icono para ambas "Defensas"
    'entrenamiento': GiTargetShot, // Reutilizando o buscar algo como FaDumbbell
    'equipo_proteccion': FaUserShield,
    'equipo_sanitario': FaFirstAid, // o GiMedicalPack
    'fundas_arma': FaFolder, // Placeholder, busca icono de pistolera
    'fundas_complementos': FaFolder,
    'grilletes_armeria': GiHandcuffs,
    'grilletes_policial': GiHandcuffs, // Mismo icono
    'guantes': FaHandPaper,
    'iluminacion_equipacion': GiFlashlight,
    'iluminacion_outdoor': GiFlashlight, // Mismo icono
    'limpieza_armas': MdCleaningServices,
    'navajas_cuchillos_outdoor': GiKitchenKnives, // Usando GiKitchenKnives porque GiKnife no existe
    'navajas_cuchillos_equipacion': GiKitchenKnives, // Mismo icono
    // 'navajas_cuchillos_equipacion': FaKnife, // FaKnife no existe, línea comentada
    'pantalones': FaTshirt, // Placeholder, necesitas un icono de pantalones
    'pedernales': FaFire,
    'pouches': GiStaticWaves, // Para "Pouches" (Militar)
    'pouches_chaleco_cinturon': GiStaticWaves, // Para "Pouches chaleco/cinturón" (Equipación)
    'primera_linea': FaShoppingBag, // Placeholder, muy genérico
    'proteccion_anticorte': FaUserShield, // O un icono de guante con escudo
    'spray_de_defensa': FaSprayCan,
    'utensilios': GiCampingTent, // Para "Utensilios" (Outdoor)
    'varios': FaFolder, // Para "Varios" (Outdoor)

    // Fallback por si algún slug no se encuentra
    'default': FaFolder,
};
// Asegúrate de importar FaBelt si lo usas: import { FaBelt } from 'react-icons/fa';

const getCategoryIcon = (slug: string, categoryName: string): IconComponent => {
    const normalizedSlug = slug.toLowerCase(); // Ya vienen en minúsculas de tu log, pero por si acaso
    const icon = categoryIconMap[normalizedSlug];
    if (!icon) {
        console.warn(`[CategoriesPage] ICON WARN: No se encontró icono para slug: '${normalizedSlug}' (Nombre: '${categoryName}'). Usando icono por defecto (FaFolder).`);
        return categoryIconMap['default'];
    }
    return icon;
};
// --- FIN MAPEO ---

export default function CategoriesPage() {
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

    // --- NUEVO ESTADO PARA CONTROLAR LA EXPANSIÓN INICIAL ---
    const [initialExpansionDone, setInitialExpansionDone] = useState<boolean>(false);
    // --- FIN NUEVO ESTADO ---

    const perPage = 100;

    const hierarchicalCategories = useMemo(() => {
        return buildCategoryTree(allCategories);
    }, [allCategories]);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            setError(null);
            setAllCategories([]);
            try {
                const result = await getCategories({
                    page: 1,
                    per_page: perPage,
                });
                setAllCategories(result.categories);
            } catch (caughtError: unknown) {
                const err = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
                console.error("[CategoriesPage] Error al cargar las categorías:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [perPage]);

    // --- useEffect CORREGIDO PARA EXPANSIÓN INICIAL ---
    useEffect(() => {
        // Solo ejecutar si las categorías jerárquicas están listas Y la expansión inicial no se ha hecho
        if (hierarchicalCategories.length > 0 && !initialExpansionDone) {
            const allIds = new Set<number>();
            const addIdsRecursively = (categories: HierarchicalCategory[]) => {
                for (const category of categories) {
                    allIds.add(category.id);
                    if (category.children.length > 0) {
                        addIdsRecursively(category.children);
                    }
                }
            };
            addIdsRecursively(hierarchicalCategories);
            setExpandedCategories(allIds);
            setInitialExpansionDone(true); // Marcar que la expansión inicial ya se hizo
            console.log("[CategoriesPage] DEBUG: Todas las categorías expandidas por defecto (expansión inicial).");
        }
    }, [hierarchicalCategories, initialExpansionDone]); // Depender solo de estas dos
    // --- FIN useEffect CORREGIDO ---

    const toggleCategoryExpansion = (categoryId: number) => {
        setExpandedCategories(prevExpanded => {
            const newExpanded = new Set(prevExpanded);
            if (newExpanded.has(categoryId)) {
                newExpanded.delete(categoryId);
            } else {
                newExpanded.add(categoryId);
            }
            return newExpanded;
        });
    };

    const renderCategoryItem = (category: HierarchicalCategory) => {
        // ... (tu función renderCategoryItem se mantiene igual)
        const isExpanded = expandedCategories.has(category.id);
        const hasChildren = category.children && category.children.length > 0;
        const IconToRender = getCategoryIcon(category.slug, category.name);

        return (
            <li key={category.id} className={`category-list-item ${hasChildren ? 'has-children' : ''} ${isExpanded ? 'expanded' : ''}`}>
                <div className="category-item-header">
                    {hasChildren && (
                        <button
                            className="expand-toggle"
                            onClick={(e) => { e.preventDefault(); toggleCategoryExpansion(category.id); }}
                            aria-expanded={isExpanded}
                            aria-controls={`subcategories-${category.id}`}
                            title={isExpanded ? "Colapsar" : "Expandir"}
                        >
                            {isExpanded ? <FaMinusCircle /> : <FaPlusCircle />}
                        </button>
                    )}
                    {!hasChildren && <span className="expand-toggle-placeholder"></span>}
                    <span className="category-icon-container"><IconToRender /></span>
                    <Link to={`/productos/${category.slug}`} className="category-name-link">{category.name}</Link>
                </div>
                {category.description && isExpanded && (
                    <div className="category-description" dangerouslySetInnerHTML={{ __html: category.description }} />
                )}
                {hasChildren && isExpanded && (
                    <ul className="subcategories-list" id={`subcategories-${category.id}`}>
                        {category.children.map(subcat => renderCategoryItem(subcat))}
                    </ul>
                )}
            </li>
        );
    };

    // ... (tu lógica de renderizado condicional para loading, error, not-found se mantiene igual) ...
    if (loading && allCategories.length === 0) { /* ... */ }
    if (error) { /* ... */ }
    if (hierarchicalCategories.length === 0 && !loading) { /* ... */ }


    return (
        // ... (tu JSX principal se mantiene igual) ...
        <div className="categories-page-container page-container">
            <div className="page-title-block">
              <h2>Nuestras Categorías</h2>
            </div>
            <ul className="categories-tree-list">
                {hierarchicalCategories.map(category => renderCategoryItem(category))}
            </ul>
        </div>
    );
}