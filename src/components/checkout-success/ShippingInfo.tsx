
import { Package, MapPin, Clock } from 'lucide-react';

interface ShippingInfoProps {
  product: any;
  sellerInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  formatDate: (date: Date) => string;
  estimatedDeliveryDate: Date;
}

export const ShippingInfo = ({ 
  product, 
  sellerInfo, 
  formatDate, 
  estimatedDeliveryDate 
}: ShippingInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-medium mb-2 flex items-center gap-1">
          {product.location ? (
            <>
              <MapPin className="h-4 w-4 text-primary" />
              Dane sprzedawcy
            </>
          ) : (
            <>
              <Package className="h-4 w-4 text-primary" />
              Dostawa
            </>
          )}
        </h3>
        {product.location ? (
          <div className="text-sm space-y-1">
            <p>{sellerInfo.name}</p>
            <p>Lokalizacja: {product.location}</p>
            <p>Email: {sellerInfo.email}</p>
            <p>Telefon: {sellerInfo.phone}</p>
          </div>
        ) : (
          <div className="text-sm space-y-1">
            <p>Kurier</p>
            <p>Szacowany czas dostawy: 1-2 dni robocze</p>
            <p>Przewidywana data dostawy: {formatDate(estimatedDeliveryDate)}</p>
          </div>
        )}
      </div>
    </div>
  );
};
