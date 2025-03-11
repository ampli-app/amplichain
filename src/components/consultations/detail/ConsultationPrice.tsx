
interface ConsultationPriceProps {
  price: number;
}

export const ConsultationPrice = ({ price }: ConsultationPriceProps) => {
  return (
    <div className="mt-4">
      <div className="text-3xl font-bold">{price},00 zł</div>
      <div className="text-sm text-muted-foreground">
        + opłata serwisowa 1,5%
      </div>
    </div>
  );
};
