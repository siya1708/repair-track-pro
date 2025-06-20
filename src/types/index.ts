
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'staff';
  storeId?: string;
  isActive: boolean;
  avatar?: string;
}

export interface Store {
  id: string;
  name: string;
  location: string;
  ownerId: string;
  phone?: string;
  createdAt: Date;
}

export interface InventoryItem {
  id: string;
  storeId: string;
  name: string;
  quantity: number;
  reorderLevel: number;
  price: number;
  category: string;
  requestedUpdates: InventoryUpdateRequest[];
}

export interface InventoryUpdateRequest {
  id: string;
  requestedBy: string;
  quantityChange: number;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface Repair {
  id: string;
  storeId: string;
  customerId: string;
  phoneModel: string;
  issue: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delivered';
  receivedDate: Date;
  completedDate?: Date;
  deliveryDate?: Date;
  assignedStaffId: string;
  billAmount: number;
  estimatedCompletion?: Date;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  repairHistory: string[];
  createdAt: Date;
}

export type RepairStatus = 'pending' | 'in-progress' | 'completed' | 'delivered';
export type UserRole = 'owner' | 'staff';
