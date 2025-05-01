export type DeliveryType = 'bike' | 'truck' | 'van' | 'fuel';

export interface DeliveryRequest {
  id: string;
  user_id: string;
  delivery_type: DeliveryType;
  pickup_address: string;
  dropoff_address: string;
  item_description: string;
  weight?: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Bid {
  id: string;
  request_id: string;
  user_id: string;
  amount: number;
  delivery_time: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
} 