// src/components/ProductInfo.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Product, Variation, Category as CategoryType, Brand as BrandType } from '../../types'; // Ajusta rutas
import VariableAttributeSelector from '../VariableAttributeSelector/VariableAttributeSelector'; // Asumiendo que está en la misma carpeta o ajusta ruta

interface ProductInfoProps {
    product: Product;
    displayedPrice: string | undefined;
    isSpecificVariationSelected: boolean;
    activeVariation: Variation | null;
    selectedAttributes: { [key: string]: string | null };
    onAttributeSelect: (attributeName: string, option: string) => void;
    variationsData: Variation[];
    variationsLoading: boolean;
    variationsError: string | null;
    colorMap: { [key: string]: string };
}

const ProductInfo: React.FC<ProductInfoProps> = ({
    product,
    displayedPrice,
    isSpecificVariationSelected,
    activeVariation,
    selectedAttributes,
    onAttributeSelect,
    variationsData,
    variationsLoading,
    variationsError,
    colorMap,
}) => {
    const skuToShow = (isSpecificVariationSelected && activeVariation?.sku) ? activeVariation.sku : product.sku;
    const stockStatusToShow = (isSpecificVariationSelected && activeVariation?.stock_status) ? activeVariation.stock_status : product.stock_status;

    const getStockStatusText = (status: string | undefined) => {
        switch (status) {
            case 'instock': return 'En Stock';
            case 'outofstock': return 'Agotado';
            case 'onbackorder': return 'En espera';
            default: return status;
        }
    };

    return (
        <div className="product-info">
            <div className="product-price-container">
                {((product.type === 'simple' && product.on_sale && product.regular_price && product.regular_price !== displayedPrice) ||
                  (isSpecificVariationSelected && activeVariation?.on_sale && activeVariation?.regular_price && activeVariation.regular_price !== displayedPrice)) && (
                    <span className="regular-price">
                        {(product.type === 'simple' ? product.regular_price : activeVariation?.regular_price)}€
                    </span>
                )}
                {displayedPrice !== undefined ? (
                    <span className={`current-price ${
                        (product.type === 'simple' && product.on_sale) ||
                        (isSpecificVariationSelected && activeVariation?.on_sale)
                        ? 'sale' : ''
                    }`}>
                        {displayedPrice}€
                    </span>
                ) : (
                    product.type === 'variable' && (
                        <span 
                            className="price-select-prompt"
                            dangerouslySetInnerHTML={{ __html: product.price_html || "Selecciona opciones para ver el precio." }} 
                        />
                    )
                )}
            </div>

            {product.type === 'variable' && product.attributes?.filter(attr => attr.variation).length > 0 && (
                <VariableAttributeSelector
                    attributes={product.attributes.filter(attr => attr.variation)}
                    selectedAttributes={selectedAttributes}
                    onAttributeSelect={onAttributeSelect}
                    variationsData={variationsData}
                    variationsLoading={variationsLoading}
                    variationsError={variationsError}
                    productType={product.type}
                    colorMap={colorMap}
                />
            )}

            <div className="product-meta">
                {skuToShow && (<p className="product-sku"><strong>SKU:</strong> {skuToShow}</p>)}
                {stockStatusToShow && (
                    <p className={`stock-status ${stockStatusToShow}`}>
                        <strong>Estado:</strong> {getStockStatusText(stockStatusToShow)}
                    </p>
                )}
                {product.categories && product.categories.length > 0 && (
                    <p className="product-categories">
                        <strong>Categoría{product.categories.length > 1 ? 's' : ''}:</strong> {
                            product.categories.map((cat: CategoryType, index: number) => (
                                <React.Fragment key={cat.id || index}>
                                    <Link to={`/productos/${cat.slug}`}>{cat.name}</Link>
                                    {index < product.categories.length - 1 && ', '}
                                </React.Fragment>
                            ))
                        }
                    </p>
                )}
                {product.brand && product.brand.length > 0 && (
                    <p className="product-brands">
                        <strong>Marca{product.brand.length > 1 ? 's' : ''}:</strong> {
                            product.brand.map((b: BrandType, index: number) => (
                                <React.Fragment key={b.id || index}>
                                    {b.image?.src && (
                                        <img src={b.image.src} alt={b.image.alt || `Logo de ${b.name}`} className="brand-logo-product-page" />
                                    )}
                                    <Link to={`/marca/${b.slug}`}>{b.name}</Link>
                                    {index < (product.brand?.length || 0) - 1 && ', '}
                                </React.Fragment>
                            ))
                        }
                    </p>
                )}
            </div>

            <div className="product-short-description">
                {product.short_description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.short_description }} />
                ) : (
                    <p></p>
                )}
            </div>
        </div>
    );
};
export default ProductInfo;