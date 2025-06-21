
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'staff';
  store_id?: string; // Changed from storeId to store_id to match database
  is_active: boolean;
  avatar?: string;
}

export interface Store {
  id: string;
  name: string;
  location: string;
  owner_id: string; // Changed from ownerId to owner_id
  phone?: string;
  created_at: Date; // Changed from createdAt
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address?: string;
  created_at: Date;
}

export interface InventoryItem {
  id: string;
  store_id: string; // Changed from storeId
  name: string;
  quantity: number;
  reorder_level: number; // Changed from reorderLevel
  mobile_company?: string;
  spare_part_type?: string;
  spare_part_model?: string;
  supplier_id?: string;
  supplier_phone?: string;
  purchase_date?: Date;
  buy_price: number;
  wholesale_price: number;
  retail_price: number;
  category: string;
  requested_updates: InventoryUpdateRequest[]; // Changed from requestedUpdates
}

export interface InventoryUpdateRequest {
  id: string;
  requested_by: string; // Changed from requestedBy
  quantity_change: number; // Changed from quantityChange
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  requested_at: Date; // Changed from requestedAt
  reviewed_at?: Date; // Changed from reviewedAt
  reviewed_by?: string; // Changed from reviewedBy
}

export interface Repair {
  id: string;
  store_id: string; // Changed from storeId
  customer_phone: string; // Changed from customerId to customer_phone
  phone_company?: string;
  phone_model?: string;
  issues?: string[]; // New field for multiple issues
  imei?: string; // New field
  status: 'pending' | 'in-progress' | 'completed' | 'delivered';
  order_status: 'pending' | 'in-progress' | 'repaired' | 'delivered' | 'cancelled'; // New field
  received_date: Date; // Changed from receivedDate
  completed_date?: Date; // Changed from completedDate
  delivery_date?: Date; // Changed from deliveryDate
  assigned_staff_id?: string; // Changed from assignedStaffId
  bill_amount: number; // Changed from billAmount
  estimated_completion?: Date; // Changed from estimatedCompletion
  notes?: string;
}

export interface Customer {
  phone: string; // Now primary key
  id?: string; // Optional now
  name: string;
  email?: string;
  address?: string;
  repair_history?: string[]; // Changed from repairHistory
  created_at: Date; // Changed from createdAt
}

export type RepairStatus = 'pending' | 'in-progress' | 'completed' | 'delivered';
export type OrderStatus = 'pending' | 'in-progress' | 'repaired' | 'delivered' | 'cancelled';
export type UserRole = 'owner' | 'staff';
