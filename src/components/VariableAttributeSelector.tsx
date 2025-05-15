// src/components/VariableAttributeSelector.tsx

// Importa las interfaces necesarias desde tu archivo types.ts
import { Attribute, Variation } from '../types';
import './css/VariableAttributeSelector.css'; 


// Importa el mapeo de colores si lo pasas como prop (como vamos a hacer ahora)
// Ya no necesitas definir colorMap dentro de este archivo si lo recibes como prop.

// Define la interfaz para las props que este componente aceptar\u00Eaacute;
interface VariableAttributeSelectorProps {
    // Datos que recibe de ProductPage
    attributes: Attribute[]; // El array de atributos de variaci\u00F3n (filtrados)
    selectedAttributes: { [key: string]: string | null }; // El estado de selecci\u00F3n actual
    variationsData: Variation[]; // Los datos completos de las variaciones (para l\u00F3gica avanzada y mensajes)
    variationsLoading: boolean; // Estado de carga de variaciones (para mensajes)
    variationsError: string | null; // Estado de error de variaciones (para mensajes)
    productType: string; // El tipo de producto ('variable') (para mensajes condicionales internos si los hay)
    colorMap: { [key: string]: string }; // El mapeo de colores (pasado desde ProductPage)

    // Funciones que recibe de ProductPage para actualizar el estado
    onAttributeSelect: (attributeName: string, option: string) => void; // Funci\u00F3n para actualizar la selecci\u00F3n en el padre
}

// Define el componente funcional que recibe esas props
// <<< SINTAXIS DE DESESTRUCTURACI\u00D3N CORREGIDA >>>
function VariableAttributeSelector({
    attributes,
    selectedAttributes,
    variationsData,
    variationsLoading,
    variationsError,
    colorMap, // Ahora colorMap viene como prop
    onAttributeSelect,
}: VariableAttributeSelectorProps) { // <<< La sintaxis aqu\u00ED debe ser correcta ahora

    // No necesitamos usar 'props.variablename' porque desestructuramos directamente.
    // Si hubieras puesto 'props: VariableAttributeSelectorProps' sin desestructurar,
    // tendr\u00EDas que usar 'props.attributes', 'props.selectedAttributes', etc.

    return (
       
        <div className="product-variations-attributes">
            {/* Itera sobre atributos usados para variaciones */}
            {/* Tipamos 'attribute' expl\u00EDcitamente en el map */}
            {attributes.map((attribute: Attribute, index: number) => (
                <div key={attribute.id || attribute.name || index} className="product-attribute-item">
                    {/* Nombre del atributo (ej: Talla, Color) */}
                    <strong className="attribute-name">{attribute.name}:</strong>
                    {/* Contenedor para los botones de opciones de este atributo */}
                    <div className="attribute-options-list">
                        {/* Itera sobre las opciones de este atributo (string[]) */}
                         {/* Tipamos 'option' expl\u00EDcitamente en el map */}
                        {attribute.options.map((option: string, optionIndex: number) => (
                            // Bot\u00F3n para cada opci\u00F3n del atributo
                            <button
                                key={optionIndex}
                                className={`attribute-option-button ${selectedAttributes[attribute.name] === option ? 'selected' : ''}`}
                                // <<< USA onAttributeSelect (la prop) en lugar de setSelectedAttributes >>>
                                onClick={() => onAttributeSelect(attribute.name, option)}
                                // Puedes a\u00Fñadir l\u00F3gica `disabled` aqu\u00ED basada en si esta combinaci\u00F3n est\u00Eaacute; en variationsData y tiene stock > 0
                                // Esto requiere m\u00Eaacute;s l\u00F3gica aqu\u00ED.
                            >
                                {/* Contenido del bot\u00F3n (texto o swatch de color) */}
                                {/* Verificar si es el atributo Color Y si la opci\u00F3n no est\u00Eaacute; vac\u00EDa */}
                                {attribute.name.toLowerCase() === 'color' && option.toLowerCase() !== '' ? (
                                    // Para colores, mostrar un swatch (el span).
                                    // Usamos el color del mapeo si existe, de lo contrario usamos la opci\u00F3n tal cual (lowercase)
                                        <>
                                        <span
                                            className="color-swatch"
                                            style={{ backgroundColor: colorMap[option] || option.toLowerCase() }}
                                            title={option}
                                        ></span>
                                        {/* A\u00Fñadimos otro span para el texto del color y le damos una clase */}
                                        <span className="color-name">{option}</span>
                                    </>
                                    // <<< FIN DEL NUEVO C\u00D3DIGO >>>
                                ) : (
                                      option
                                 )}
                            </button>
                        ))}
                    </div> {/* Cierre attribute-options-list */}
                </div> // Cierre product-attribute-item
            ))} {/* Cierre map attributes */}
            {/* Mensajes de carga o error para las variaciones */}
            {variationsLoading && <p style={{fontStyle: 'italic'}}>Cargando opciones...</p>}
            {variationsError && <p style={{color: 'red'}}>Error al cargar opciones: {variationsError}</p>}
             {/* Mensaje si no hay variaciones disponibles */}
             {/* <<< REMOVE product.type CHECK, YA QUE ESTE COMPONENTE SOLO SE RENDERIZA PARA VARIABLES >>> */}
             {!variationsLoading && variationsData.length === 0 && !variationsError && (
                   <p style={{fontStyle: 'italic'}}>No hay combinaciones de opciones disponibles para este producto.</p>
             )}
        </div>
    );
}

export default VariableAttributeSelector;