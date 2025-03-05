
interface ProductPriceProps {
  price: number;
  sale: boolean;
  salePercentage?: number | null;
  forTesting: boolean;
  testingPrice?: number | null;
}

export function ProductPrice({ price, sale, salePercentage, forTesting, testingPrice }: ProductPriceProps) {
  const calculateSalePrice = (originalPrice: number, salePercentage: number) => {
    return originalPrice - (originalPrice * (salePercentage / 100));
  };
  
  const formattedPrice = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(price);
  
  const formattedSalePrice = sale && salePercentage ? 
    new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(calculateSalePrice(price, salePercentage)) : null;
    
  const formattedTestingPrice = forTesting && testingPrice ? 
    new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(testingPrice) : null;

  return (
    <div className="mt-2 flex items-center justify-between">
      <div>
        {sale && salePercentage ? (
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-primary">{formattedSalePrice}</span>
            <span className="text-sm text-muted-foreground line-through">{formattedPrice}</span>
          </div>
        ) : (
          <span className="text-lg font-bold text-primary">{formattedPrice}</span>
        )}
      </div>
      
      {forTesting && testingPrice && (
        <div className="text-sm text-muted-foreground">
          Test: {formattedTestingPrice}
        </div>
      )}
    </div>
  );
}
