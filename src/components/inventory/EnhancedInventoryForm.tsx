
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface EnhancedInventoryFormProps {
  onClose: () => void;
}

const mobileCompanies = [
  'Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Vivo', 'Oppo', 'Realme',
  'Motorola', 'Nokia', 'Huawei', 'Honor', 'Nothing', 'Infinix', 'Tecno'
];

const sparePartTypes = [
  'Display', 'Battery', 'Motherboard', 'Speaker', 'Camera', 'Charging Port',
  'Earpiece', 'Microphone', 'Volume Button', 'Power Button', 'Back Cover',
  'Frame', 'Flex Cable', 'Antenna', 'Vibrator'
];

const EnhancedInventoryForm: React.FC<EnhancedInventoryFormProps> = ({ onClose }) => {
  const { addInventoryItem, suppliers, stores } = useData();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    mobileCompany: '',
    sparePartType: '',
    sparePartModel: '',
    supplierId: '',
    quantity: '',
    reorderLevel: '10',
    buyPrice: '',
    wholesalePrice: '',
    retailPrice: '',
    category: ''
  });

  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  const userStores = user?.role === 'owner' ? stores : stores.filter(s => s.id === user?.store_id);

  useEffect(() => {
    if (formData.supplierId) {
      const supplier = suppliers.find(s => s.id === formData.supplierId);
      setSelectedSupplier(supplier);
    }
  }, [formData.supplierId, suppliers]);

  useEffect(() => {
    // Auto-generate name based on other fields
    if (formData.mobileCompany && formData.sparePartType && formData.sparePartModel) {
      const name = `${formData.mobileCompany} ${formData.sparePartModel} ${formData.sparePartType}`;
      setFormData(prev => ({ ...prev, name }));
    }
  }, [formData.mobileCompany, formData.sparePartType, formData.sparePartModel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.mobileCompany || !formData.sparePartType || 
        !formData.quantity || !formData.buyPrice || !formData.retailPrice) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const storeId = user?.role === 'staff' ? user.store_id! : userStores[0]?.id;

    addInventoryItem({
      store_id: storeId,
      name: formData.name,
      mobile_company: formData.mobileCompany,
      spare_part_type: formData.sparePartType,
      spare_part_model: formData.sparePartModel,
      supplier_id: formData.supplierId || undefined,
      supplier_phone: selectedSupplier?.phone,
      purchase_date: new Date(),
      quantity: parseInt(formData.quantity),
      reorder_level: parseInt(formData.reorderLevel),
      buy_price: parseFloat(formData.buyPrice),
      wholesale_price: parseFloat(formData.wholesalePrice || '0'),
      retail_price: parseFloat(formData.retailPrice),
      category: formData.sparePartType,
      requested_updates: []
    });

    toast({
      title: "Success",
      description: "Inventory item added successfully"
    });

    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Inventory Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Item Information</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mobileCompany">Mobile Company *</Label>
                <Select value={formData.mobileCompany} onValueChange={(value) => setFormData(prev => ({ ...prev, mobileCompany: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {mobileCompanies.map(company => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sparePartType">Spare Part Type *</Label>
                <Select value={formData.sparePartType} onValueChange={(value) => setFormData(prev => ({ ...prev, sparePartType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select part type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sparePartTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sparePartModel">Spare Part Model *</Label>
                <Input
                  id="sparePartModel"
                  value={formData.sparePartModel}
                  onChange={(e) => setFormData(prev => ({ ...prev, sparePartModel: e.target.value }))}
                  placeholder="e.g., iPhone 14 Pro, Galaxy S23"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Auto-generated or custom name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Supplier Information */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Supplier Information</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Select value={formData.supplierId} onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedSupplier && (
                <div>
                  <Label>Supplier Phone</Label>
                  <Input value={selectedSupplier.phone} disabled />
                </div>
              )}
            </div>
          </div>

          {/* Stock & Pricing */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Stock & Pricing</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="0"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, reorderLevel: e.target.value }))}
                  placeholder="10"
                />
              </div>
              
              <div>
                <Label htmlFor="buyPrice">Buy Price (₹) *</Label>
                <Input
                  id="buyPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.buyPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyPrice: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              
              {user?.role === 'owner' && (
                <div>
                  <Label htmlFor="wholesalePrice">Wholesale Price (₹)</Label>
                  <Input
                    id="wholesalePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.wholesalePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, wholesalePrice: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="retailPrice">Retail Price (₹) *</Label>
                <Input
                  id="retailPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.retailPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, retailPrice: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedInventoryForm;
