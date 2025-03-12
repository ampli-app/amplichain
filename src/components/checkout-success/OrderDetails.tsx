
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { OrderSummary } from './OrderSummary';
import { ShippingInfo } from './ShippingInfo';
import { PaymentOrTestInfo } from './PaymentOrTestInfo';
import { TestModeInfo } from './TestModeInfo';
import { Card, CardContent } from '@/components/ui/card';

interface OrderDetailsProps {
  product: any;
  productPrice: number;
  deliveryCost: number;
  totalCost: number;
  getProductImageUrl: () => string;
  formatCurrency: (amount: number) => string;
  sellerInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  formatDate: (date: Date) => string;
  estimatedDeliveryDate: Date;
  isTestMode: boolean;
  testEndDate: Date;
  id: string;
}

export const OrderDetails = ({
  product,
  productPrice,
  deliveryCost,
  totalCost,
  getProductImageUrl,
  formatCurrency,
  sellerInfo,
  formatDate,
  estimatedDeliveryDate,
  isTestMode,
  testEndDate,
  id
}: OrderDetailsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <OrderSummary
        product={product}
        productPrice={productPrice}
        deliveryCost={deliveryCost}
        totalCost={totalCost}
        getProductImageUrl={getProductImageUrl}
        formatCurrency={formatCurrency}
        isTestMode={isTestMode}
      />
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ShippingInfo
              product={product}
              sellerInfo={sellerInfo}
              formatDate={formatDate}
              estimatedDeliveryDate={estimatedDeliveryDate}
            />
            
            <PaymentOrTestInfo
              isTestMode={isTestMode}
              formatDate={formatDate}
              testEndDate={testEndDate}
            />
          </div>
        </CardContent>
      </Card>
      
      <TestModeInfo 
        isTestMode={isTestMode} 
        id={id}
      />
      
      <div className="text-center">
        <Button asChild size="lg">
          <Link to="/marketplace">
            Kontynuuj zakupy
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};
