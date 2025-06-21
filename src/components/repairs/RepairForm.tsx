
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface RepairFormProps {
  onClose: () => void;
}

const RepairForm: React.FC<RepairFormProps> = ({ onClose }) => {
  const { addRepair, stores } = useData();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    customerPhone: '',
    phoneModel: '',
    issue: '',
    billAmount: ''
  });

  const userStores = user?.role === 'owner' ? stores : stores.filter(s => s.id === user?.store_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerPhone || !formData.phoneModel || !formData.issue || !formData.billAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const storeId = user?.role === 'staff' ? user.store_id! : userStores[0]?.id;

    addRepair({
      store_id: storeId,
      customer_phone: formData.customerPhone,
      phone_model: formData.phoneModel,
      issues: [formData.issue],
      status: 'pending',
      order_status: 'pending',
      received_date: new Date(),
      assigned_staff_id: user!.id,
      bill_amount: parseFloat(formData.billAmount)
    });

    toast({
      title: "Success",
      description: "Repair added successfully"
    });

    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Repair</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customerPhone">Customer Phone</Label>
            <Input
              id="customerPhone"
              value={formData.customerPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
              placeholder="Enter customer phone number"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phoneModel">Phone Model</Label>
            <Input
              id="phoneModel"
              value={formData.phoneModel}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneModel: e.target.value }))}
              placeholder="e.g., iPhone 14 Pro"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="issue">Issue Description</Label>
            <Textarea
              id="issue"
              value={formData.issue}
              onChange={(e) => setFormData(prev => ({ ...prev, issue: e.target.value }))}
              placeholder="Describe the issue"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="billAmount">Bill Amount (₹)</Label>
            <Input
              id="billAmount"
              type="number"
              step="0.01"
              value={formData.billAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, billAmount: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Repair
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RepairForm;
