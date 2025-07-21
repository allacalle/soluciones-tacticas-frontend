// src/components/SloganSection.tsx

import SloganCard from '../SloganCard/SloganCard';
import './SloganSection.css'; // Asegúrate de que este archivo existe y tiene estilos para la sección



// Define el componente funcional para la sección contenedora
// *** MODIFICA ESTA LÍNEA ***
function SloganSection() { // <-- ¡Elimina 'props: SloganSectionProps' de aquí!
    // Ahora la función SloganSection no espera recibir props

    // Datos hardcodeados para las tarjetas
    const sloganCardData = [
        {
            icon: '📦',
            title: 'Variedad de Productos',
            slogan: 'Sumérgete en un mundo de posibilidades con nuestro extenso y cuidadosamente seleccionado catálogo. Encontrarás desde el equipamiento táctico esencial y vestuario especializado para profesionales, hasta los artículos de aventura más innovadores y la equipación militar de alta calidad. Trabajamos con las mejores marcas del sector para asegurar que tengas acceso a herramientas confiables y duraderas para cualquier desafío o actividad que emprendas.'
        },
        {
            icon: '🛡️',
            title: 'Calidad y Confianza',
            slogan: 'Nuestra prioridad es ofrecerte productos en los que puedas confiar plenamente, incluso en las situaciones más exigentes. Seleccionamos cada artículo rigurosamente, evaluando su durabilidad, rendimiento y fiabilidad bajo estándares estrictos. Queremos que tu compra sea una inversión segura en equipamiento que te acompañará durante mucho tiempo y que cumplirá con tus expectativas de calidad superior.'
        },
        {
            icon: '🤝',
            title: 'Servicio al Cliente Excepcional',
            slogan: 'No eres solo un cliente, eres parte de nuestra comunidad. Nuestro equipo de expertos está siempre disponible para ofrecerte asesoramiento personalizado, resolver tus dudas y ayudarte a encontrar exactamente el producto que mejor se adapta a tus necesidades específicas. Desde la selección inicial hasta el soporte post-venta, estamos aquí para acompañarte en cada paso y garantizar tu completa satisfacción. Tu confianza es nuestro mayor compromiso.'
        },
    ];

    return (
        <section className="slogan-section" >
            {/* Si tuvieras un título principal para la sección (y lo pasaras como prop mainTitle) */}
            {/* {props.mainTitle && <h2>{props.mainTitle}</h2>} <-- Ya no podrías usar 'props' */}
            {/* Si añades mainTitle a SloganSectionProps, tendrías que desestructurarlo:
                function SloganSection({ mainTitle }: SloganSectionProps) { ... }
            */}


            <div className="slogan-cards-container">
                {sloganCardData.map((card, index) => (
                    <SloganCard
                        key={index}
                        icon={card.icon}
                        title={card.title}
                        slogan={card.slogan}
                    />
                ))}
            </div>
        </section>
    );
}

export default SloganSection;