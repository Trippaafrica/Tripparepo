export type DeliveryType = 'bike' | 'truck' | 'van' | 'fuel';

export interface DeliveryRequest {
  id: string;
  user_id: string;
  delivery_type: DeliveryType;
  pickup_location: string;
  dropoff_location: string;
  item_description: string;
  weight?: number;
  dimensions?: string;
  created_at: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
}

export interface Bid {
  id: string;
  delivery_request_id: string;
  rider_id: string;
  amount: number;
  estimated_time: string;
  created_at: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  created_at: string;
} 