
import { ConsultationOrder } from '@/types/consultations';

export type TabType = 'pending' | 'active' | 'completed' | 'cancelled';

export interface ConsultationOrderCardProps {
  order: ConsultationOrder;
  onCancelOrder?: (orderId: string) => Promise<void>;
  onConfirmConsultation?: (orderId: string) => Promise<void>;
  showActions?: boolean;
}

export interface EmptyStateProps {
  type: TabType;
}

export interface ConsultationTabContentProps {
  orders: ConsultationOrder[];
  type: TabType;
  onCancelOrder: (orderId: string) => Promise<void>;
  onConfirmConsultation: (orderId: string) => Promise<void>;
}

export interface TabCountProps {
  count: number;
}
