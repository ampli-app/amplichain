
import { ConsultationOrder } from '@/types/consultations';

export type TabType = 'pending' | 'active' | 'completed' | 'rejected';

export interface ConsultationOrderCardProps {
  order: ConsultationOrder;
  onAcceptOrder?: (orderId: string) => Promise<void>;
  onRejectOrder?: (orderId: string) => Promise<void>;
  onCompleteOrder?: (orderId: string) => Promise<void>;
  processingOrderId: string | null;
}

export interface EmptyStateProps {
  type: TabType;
}

export interface ConsultationTabContentProps {
  orders: ConsultationOrder[];
  type: TabType;
  onAcceptOrder?: (orderId: string) => Promise<void>;
  onRejectOrder?: (orderId: string) => Promise<void>;
  onCompleteOrder?: (orderId: string) => Promise<void>;
  processingOrderId: string | null;
}

export interface TabCountProps {
  count: number;
}

export interface UseExpertConsultationsResult {
  orders: ConsultationOrder[];
  loading: boolean;
  processingOrderId: string | null;
  handleAcceptOrder: (orderId: string) => Promise<void>;
  handleRejectOrder: (orderId: string) => Promise<void>;
  handleCompleteOrder: (orderId: string) => Promise<void>;
  filterOrdersByStatus: (status: TabType) => ConsultationOrder[];
}
