
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface RepairFormProps {
  onClose: () => void;
}

const RepairForm: React.FC<RepairFormProps> = ({ onClose }) => {
  const { addRepair, addCustomer, customers, stores } = useData();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    phoneModel: '',
    issue: '',
    billAmount: '',
    estimatedDays: '3'
  });

  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const userStores = user?.role === 'owner' ? stores : stores.filter(s => s.id === user?.storeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phoneModel || !formData.issue || !formData.billAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    let customerId = selectedCustomerId;
    
    // Create new customer if needed
    if (isNewCustomer) {
      if (!formData.customerName || !formData.customerPhone) {
        toast({
          title: "Error",
          description: "Customer name and phone are required",
          variant: "destructive"
        });
        return;
      }
      
      const newCustomer = addCustomer({
        name: formData.customerName,
        phone: formData.customerPhone,
        email: formData.customerEmail || undefined
      });
      customerId = newCustomer.id;
    }

    const storeId = user?.role === 'staff' ? user.storeId! : userStores[0]?.id;
    const estimatedCompletion = new Date();
    estimatedCompletion.setDate(estimatedCompletion.getDate() + parseInt(formData.estimatedDays));

    addRepair({
      storeId,
      customerId,
      phoneModel: formData.phoneModel,
      issue: formData.issue,
      status: 'pending',
      receivedDate: new Date(),
      assignedStaffId: user!.id,
      billAmount: parseFloat(formData.billAmount),
      estimatedCompletion
    });

    toast({
      title: "Success",
      description: "Repair added successfully"
    });

    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Repair</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Customer Information</Label>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant={isNewCustomer ? "default" : "outline"}
                onClick={() => setIsNewCustomer(true)}
                className="flex-1"
              >
                New Customer
              </Button>
              <Button
                type="button"
                variant={!isNewCustomer ? "default" : "outline"}
                onClick={() => setIsNewCustomer(false)}
                className="flex-1"
              >
                Existing Customer
              </Button>
            </div>

            {isNewCustomer ? (
              <>
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email (Optional)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
              </>
            ) : (
              <div>
                <Label htmlFor="existingCustomer">Select Customer *</Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose existing customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Device Information */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Device Information</Label>
            
            <div>
              <Label htmlFor="phoneModel">Phone Model *</Label>
              <Input
                id="phoneModel"
                value={formData.phoneModel}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneModel: e.target.value }))}
                placeholder="e.g., iPhone 14 Pro, Samsung Galaxy S23"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="issue">Issue Description *</Label>
              <Textarea
                id="issue"
                value={formData.issue}
                onChange={(e) => setFormData(prev => ({ ...prev, issue: e.target.value }))}
                placeholder="Describe the problem with the device"
                required
                rows={3}
              />
            </div>
          </div>

          {/* Repair Details */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Repair Details</Label>
            
            <div>
              <Label htmlFor="billAmount">Repair Cost (USD) *</Label>
              <Input
                id="billAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.billAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, billAmount: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="estimatedDays">Estimated Completion (Days)</Label>
              <Select value={formData.estimatedDays} onValueChange={(value) => setFormData(prev => ({ ...prev, estimatedDays: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="2">2 Days</SelectItem>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="5">5 Days</SelectItem>
                  <SelectItem value="7">1 Week</SelectItem>
                  <SelectItem value="14">2 Weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
