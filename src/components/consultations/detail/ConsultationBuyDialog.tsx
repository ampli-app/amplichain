
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ConsultationBuyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  ownerName: string;
  price: number;
  onBuy: () => void;
}

export const ConsultationBuyDialog = ({
  open,
  onOpenChange,
  title,
  ownerName,
  price,
  onBuy
}: ConsultationBuyDialogProps) => {
  const serviceFee = price * 0.015;
  const totalPrice = price * 1.015;
  
  const handleBuy = () => {
    console.log("Kliknięto przycisk Kup w dialogu dla konsultacji", {
      title,
      ownerName,
      price
    });
    onBuy();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Potwierdzenie zakupu</DialogTitle>
          <DialogDescription>
            Potwierdź zakup konsultacji od {ownerName || 'eksperta'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-between">
            <span>Konsultacja:</span>
            <span className="font-medium">{title}</span>
          </div>
          <div className="flex justify-between">
            <span>Cena:</span>
            <span className="font-medium">{price},00 zł</span>
          </div>
          <div className="flex justify-between">
            <span>Opłata serwisowa (1,5%):</span>
            <span className="font-medium">{serviceFee.toFixed(2)} zł</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Razem:</span>
            <span>{totalPrice.toFixed(2)} zł</span>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={handleBuy}>
            Kup teraz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
