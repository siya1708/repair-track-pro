
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Store, InventoryItem, Repair, Customer, InventoryUpdateRequest } from '../types';

interface DataContextType {
  stores: Store[];
  inventory: InventoryItem[];
  repairs: Repair[];
  customers: Customer[];
  addRepair: (repair: Omit<Repair, 'id'>) => void;
  updateRepairStatus: (repairId: string, status: string, notes?: string) => void;
  addInventoryUpdateRequest: (itemId: string, request: Omit<InventoryUpdateRequest, 'id'>) => void;
  approveInventoryRequest: (itemId: string, requestId: string) => void;
  denyInventoryRequest: (itemId: string, requestId: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'repairHistory' | 'createdAt'>) => Customer;
  updateInventoryQuantity: (itemId: string, newQuantity: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data
const mockStores: Store[] = [
  {
    id: 'store-1',
    name: 'Downtown Mobile Repair',
    location: '123 Main St, Downtown',
    ownerId: '1',
    phone: '(555) 123-4567',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'store-2',
    name: 'Mall Mobile Center',
    location: '456 Shopping Mall, Suite 12',
    ownerId: '1',
    phone: '(555) 987-6543',
    createdAt: new Date('2024-02-20')
  }
];

const mockInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    storeId: 'store-1',
    name: 'iPhone 14 Screen',
    quantity: 15,
    reorderLevel: 5,
    price: 89.99,
    category: 'Screens',
    requestedUpdates: []
  },
  {
    id: 'inv-2',
    storeId: 'store-1',
    name: 'Samsung Galaxy S23 Battery',
    quantity: 8,
    reorderLevel: 10,
    price: 45.99,
    category: 'Batteries',
    requestedUpdates: [
      {
        id: 'req-1',
        requestedBy: '2',
        quantityChange: -2,
        reason: 'Used for repair #R001',
        status: 'pending',
        requestedAt: new Date()
      }
    ]
  },
  {
    id: 'inv-3',
    storeId: 'store-2',
    name: 'iPhone 13 Camera Module',
    quantity: 3,
    reorderLevel: 5,
    price: 125.99,
    category: 'Cameras',
    requestedUpdates: []
  }
];

const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Alice Brown',
    phone: '(555) 111-2222',
    email: 'alice@email.com',
    address: '789 Oak Street',
    repairHistory: ['repair-1'],
    createdAt: new Date('2024-06-01')
  },
  {
    id: 'cust-2',
    name: 'Bob Johnson',
    phone: '(555) 333-4444',
    repairHistory: ['repair-2'],
    createdAt: new Date('2024-06-10')
  }
];

const mockRepairs: Repair[] = [
  {
    id: 'repair-1',
    storeId: 'store-1',
    customerId: 'cust-1',
    phoneModel: 'iPhone 14 Pro',
    issue: 'Cracked screen',
    status: 'in-progress',
    receivedDate: new Date('2024-06-15'),
    assignedStaffId: '2',
    billAmount: 299.99,
    estimatedCompletion: new Date('2024-06-18'),
    notes: 'Waiting for customer approval on additional frame repair'
  },
  {
    id: 'repair-2',
    storeId: 'store-2',
    customerId: 'cust-2',
    phoneModel: 'Samsung Galaxy S23',
    issue: 'Battery not charging',
    status: 'completed',
    receivedDate: new Date('2024-06-12'),
    completedDate: new Date('2024-06-14'),
    assignedStaffId: '3',
    billAmount: 89.99
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stores] = useState<Store[]>(mockStores);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [repairs, setRepairs] = useState<Repair[]>(mockRepairs);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);

  const addRepair = (repairData: Omit<Repair, 'id'>) => {
    const newRepair: Repair = {
      ...repairData,
      id: `repair-${Date.now()}`
    };
    setRepairs(prev => [newRepair, ...prev]);
  };

  const updateRepairStatus = (repairId: string, status: string, notes?: string) => {
    setRepairs(prev => prev.map(repair => {
      if (repair.id === repairId) {
        const updates: Partial<Repair> = { status: status as any };
        if (status === 'completed') {
          updates.completedDate = new Date();
        } else if (status === 'delivered') {
          updates.deliveryDate = new Date();
        }
        if (notes) {
          updates.notes = notes;
        }
        return { ...repair, ...updates };
      }
      return repair;
    }));
  };

  const addInventoryUpdateRequest = (itemId: string, request: Omit<InventoryUpdateRequest, 'id'>) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const newRequest: InventoryUpdateRequest = {
          ...request,
          id: `req-${Date.now()}`
        };
        return {
          ...item,
          requestedUpdates: [...item.requestedUpdates, newRequest]
        };
      }
      return item;
    }));
  };

  const approveInventoryRequest = (itemId: string, requestId: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedRequests = item.requestedUpdates.map(req => {
          if (req.id === requestId) {
            return {
              ...req,
              status: 'approved' as const,
              reviewedAt: new Date(),
              reviewedBy: '1'
            };
          }
          return req;
        });
        
        const approvedRequest = updatedRequests.find(req => req.id === requestId);
        const newQuantity = approvedRequest 
          ? Math.max(0, item.quantity + approvedRequest.quantityChange)
          : item.quantity;

        return {
          ...item,
          quantity: newQuantity,
          requestedUpdates: updatedRequests
        };
      }
      return item;
    }));
  };

  const denyInventoryRequest = (itemId: string, requestId: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          requestedUpdates: item.requestedUpdates.map(req => 
            req.id === requestId 
              ? { ...req, status: 'denied' as const, reviewedAt: new Date(), reviewedBy: '1' }
              : req
          )
        };
      }
      return item;
    }));
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'repairHistory' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      repairHistory: [],
      createdAt: new Date()
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateInventoryQuantity = (itemId: string, newQuantity: number) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity: Math.max(0, newQuantity) } : item
    ));
  };

  return (
    <DataContext.Provider value={{
      stores,
      inventory,
      repairs,
      customers,
      addRepair,
      updateRepairStatus,
      addInventoryUpdateRequest,
      approveInventoryRequest,
      denyInventoryRequest,
      addCustomer,
      updateInventoryQuantity
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
