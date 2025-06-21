import React, { createContext, useContext, useState, useEffect } from 'react';
import { Store, InventoryItem, Repair, Customer, InventoryUpdateRequest, Supplier } from '../types';

interface DataContextType {
  stores: Store[];
  inventory: InventoryItem[];
  repairs: Repair[];
  customers: Customer[];
  suppliers: Supplier[];
  addRepair: (repair: Omit<Repair, 'id'>) => void;
  updateRepairStatus: (repairId: string, status: string, notes?: string) => void;
  addInventoryUpdateRequest: (itemId: string, request: Omit<InventoryUpdateRequest, 'id'>) => void;
  approveInventoryRequest: (itemId: string, requestId: string) => void;
  denyInventoryRequest: (itemId: string, requestId: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'repair_history' | 'created_at'>) => Customer;
  findCustomerByPhone: (phone: string) => Customer | undefined;
  updateInventoryQuantity: (itemId: string, newQuantity: number) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'created_at'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data with updated structure
const mockStores: Store[] = [
  {
    id: 'store-1',
    name: 'Downtown Mobile Repair',
    location: '123 Main St, Downtown',
    owner_id: '1',
    phone: '(555) 123-4567',
    created_at: new Date('2024-01-15')
  },
  {
    id: 'store-2',
    name: 'Mall Mobile Center',
    location: '456 Shopping Mall, Suite 12',
    owner_id: '1',
    phone: '(555) 987-6543',
    created_at: new Date('2024-02-20')
  }
];

const mockSuppliers: Supplier[] = [
  {
    id: 'supplier-1',
    name: 'TechParts India',
    phone: '+91-9876543210',
    address: 'Mumbai, Maharashtra',
    created_at: new Date('2024-01-10')
  },
  {
    id: 'supplier-2',
    name: 'Mobile Components Ltd',
    phone: '+91-8765432109',
    address: 'Delhi, India',
    created_at: new Date('2024-02-15')
  }
];

const mockInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    store_id: 'store-1',
    name: 'iPhone 14 Pro Display',
    mobile_company: 'Apple',
    spare_part_type: 'Display',
    spare_part_model: 'iPhone 14 Pro',
    supplier_id: 'supplier-1',
    supplier_phone: '+91-9876543210',
    purchase_date: new Date('2024-06-01'),
    quantity: 15,
    reorder_level: 5,
    buy_price: 8999,
    wholesale_price: 10999,
    retail_price: 12999,
    category: 'Display',
    requested_updates: []
  },
  {
    id: 'inv-2',
    store_id: 'store-1',
    name: 'Samsung Galaxy S23 Battery',
    mobile_company: 'Samsung',
    spare_part_type: 'Battery',
    spare_part_model: 'Galaxy S23',
    supplier_id: 'supplier-2',
    supplier_phone: '+91-8765432109',
    purchase_date: new Date('2024-06-05'),
    quantity: 8,
    reorder_level: 10,
    buy_price: 2999,
    wholesale_price: 3499,
    retail_price: 3999,
    category: 'Battery',
    requested_updates: [
      {
        id: 'req-1',
        requested_by: '2',
        quantity_change: -2,
        reason: 'Used for repair #R001',
        status: 'pending',
        requested_at: new Date()
      }
    ]
  }
];

const mockCustomers: Customer[] = [
  {
    phone: '+91-9876543210',
    id: 'cust-1',
    name: 'Alice Brown',
    email: 'alice@email.com',
    address: '789 Oak Street',
    repair_history: ['repair-1'],
    created_at: new Date('2024-06-01')
  },
  {
    phone: '+91-8765432109',
    id: 'cust-2', 
    name: 'Bob Johnson',
    repair_history: ['repair-2'],
    created_at: new Date('2024-06-10')
  }
];

const mockRepairs: Repair[] = [
  {
    id: 'repair-1',
    store_id: 'store-1',
    customer_phone: '+91-9876543210',
    phone_company: 'Apple',
    phone_model: 'iPhone 14 Pro',
    issues: ['Cracked screen', 'Touch not working'],
    imei: '123456789012345',
    status: 'in-progress',
    order_status: 'in-progress',
    received_date: new Date('2024-06-15'),
    assigned_staff_id: '2',
    bill_amount: 12999,
    estimated_completion: new Date('2024-06-18'),
    notes: 'Waiting for customer approval on additional frame repair'
  },
  {
    id: 'repair-2',
    store_id: 'store-2',
    customer_phone: '+91-8765432109',
    phone_company: 'Samsung',
    phone_model: 'Galaxy S23',
    issues: ['Battery not charging'],
    status: 'completed',
    order_status: 'repaired',
    received_date: new Date('2024-06-12'),
    completed_date: new Date('2024-06-14'),
    assigned_staff_id: '3',
    bill_amount: 3999
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stores] = useState<Store[]>(mockStores);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [repairs, setRepairs] = useState<Repair[]>(mockRepairs);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);

  const addRepair = (repairData: Omit<Repair, 'id'>) => {
    const newRepair: Repair = {
      ...repairData,
      id: `repair-${Date.now()}`
    };
    setRepairs(prev => [newRepair, ...prev]);

    // Add customer if not exists
    const existingCustomer = customers.find(c => c.phone === repairData.customer_phone);
    if (!existingCustomer) {
      // This should not happen with the new form, but keeping as fallback
      console.log('Customer should exist before adding repair');
    }
  };

  const updateRepairStatus = (repairId: string, status: string, notes?: string) => {
    setRepairs(prev => prev.map(repair => {
      if (repair.id === repairId) {
        const updates: Partial<Repair> = { status: status as any };
        if (status === 'completed') {
          updates.completed_date = new Date();
          updates.order_status = 'repaired';
        } else if (status === 'delivered') {
          updates.delivery_date = new Date();
          updates.order_status = 'delivered';
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
          requested_updates: [...item.requested_updates, newRequest]
        };
      }
      return item;
    }));
  };

  const approveInventoryRequest = (itemId: string, requestId: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedRequests = item.requested_updates.map(req => {
          if (req.id === requestId) {
            return {
              ...req,
              status: 'approved' as const,
              reviewed_at: new Date(),
              reviewed_by: '1'
            };
          }
          return req;
        });
        
        const approvedRequest = updatedRequests.find(req => req.id === requestId);
        const newQuantity = approvedRequest 
          ? Math.max(0, item.quantity + approvedRequest.quantity_change)
          : item.quantity;

        return {
          ...item,
          quantity: newQuantity,
          requested_updates: updatedRequests
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
          requested_updates: item.requested_updates.map(req => 
            req.id === requestId 
              ? { ...req, status: 'denied' as const, reviewed_at: new Date(), reviewed_by: '1' }
              : req
          )
        };
      }
      return item;
    }));
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'repair_history' | 'created_at'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      repair_history: [],
      created_at: new Date()
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const findCustomerByPhone = (phone: string) => {
    return customers.find(customer => customer.phone === phone);
  };

  const updateInventoryQuantity = (itemId: string, newQuantity: number) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity: Math.max(0, newQuantity) } : item
    ));
  };

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`
    };
    setInventory(prev => [newItem, ...prev]);
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'created_at'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `supplier-${Date.now()}`,
      created_at: new Date()
    };
    setSuppliers(prev => [newSupplier, ...prev]);
  };

  return (
    <DataContext.Provider value={{
      stores,
      suppliers,
      inventory,
      repairs,
      customers,
      addRepair,
      updateRepairStatus,
      addInventoryUpdateRequest,
      approveInventoryRequest,
      denyInventoryRequest,
      addCustomer,
      findCustomerByPhone,
      updateInventoryQuantity,
      addInventoryItem,
      addSupplier
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
