
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';

interface EnhancedRepairFormProps {
  onClose: () => void;
}

const phoneCompanies = [
  'Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Vivo', 'Oppo', 'Realme', 
  'Motorola', 'Nokia', 'Huawei', 'Honor', 'Nothing', 'Infinix', 'Tecno'
];

const orderStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In-progress' },
  { value: 'repaired', label: 'Repaired' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

const EnhancedRepairForm: React.FC<EnhancedRepairFormProps> = ({ onClose }) => {
  const { addRepair, customers, stores, findCustomerByPhone } = useData();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    customerPhone: '',
    customerName: '',
    customerEmail: '',
    phoneCompany: '',
    phoneModel: '',
    imei: '',
    billAmount: '',
    estimatedDays: '3',
    orderStatus: 'pending'
  });

  const [issues, setIssues] = useState<string[]>(['']);
  const [currentIssue, setCurrentIssue] = useState('');
  const [customerFound, setCustomerFound] = useState(false);

  const userStores = user?.role === 'owner' ? stores : stores.filter(s => s.id === user?.store_id);

  // Auto-fill customer details when phone number changes
  useEffect(() => {
    if (formData.customerPhone.length >= 10) {
      const customer = findCustomerByPhone(formData.customerPhone);
      if (customer) {
        setFormData(prev => ({
          ...prev,
          customerName: customer.name,
          customerEmail: customer.email || ''
        }));
        setCustomerFound(true);
      } else {
        setCustomerFound(false);
        setFormData(prev => ({
          ...prev,
          customerName: '',
          customerEmail: ''
        }));
      }
    }
  }, [formData.customerPhone, findCustomerByPhone]);

  const addIssue = () => {
    if (currentIssue.trim()) {
      setIssues(prev => [...prev.filter(issue => issue.trim()), currentIssue.trim()]);
      setCurrentIssue('');
    }
  };

  const removeIssue = (index: number) => {
    setIssues(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerPhone || !formData.customerName || !formData.phoneCompany || 
        !formData.phoneModel || !formData.billAmount || issues.filter(i => i.trim()).length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and add at least one issue",
        variant: "destructive"
      });
      return;
    }

    const storeId = user?.role === 'staff' ? user.store_id! : userStores[0]?.id;
    const estimatedCompletion = new Date();
    estimatedCompletion.setDate(estimatedCompletion.getDate() + parseInt(formData.estimatedDays));

    const filteredIssues = issues.filter(issue => issue.trim());

    addRepair({
      store_id: storeId,
      customer_phone: formData.customerPhone,
      phone_company: formData.phoneCompany,
      phone_model: formData.phoneModel,
      issues: filteredIssues,
      imei: formData.imei || undefined,
      status: 'pending',
      order_status: formData.orderStatus as any,
      received_date: new Date(),
      assigned_staff_id: user!.id,
      bill_amount: parseFloat(formData.billAmount),
      estimated_completion: estimatedCompletion
    });

    toast({
      title: "Success",
      description: "Repair added successfully"
    });

    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Repair</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Customer Information</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerPhone">Mobile Number *</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="Enter mobile number"
                  required
                />
                {customerFound && (
                  <p className="text-sm text-green-600 mt-1">Customer found in system</p>
                )}
              </div>
              
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
              
              <div className="md:col-span-2">
                <Label htmlFor="customerEmail">Email (Optional)</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </div>

          {/* Device Information */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Device Information</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phoneCompany">Phone Company *</Label>
                <Select value={formData.phoneCompany} onValueChange={(value) => setFormData(prev => ({ ...prev, phoneCompany: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select phone company" />
                  </SelectTrigger>
                  <SelectContent>
                    {phoneCompanies.map(company => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="phoneModel">Phone Model *</Label>
                <Input
                  id="phoneModel"
                  value={formData.phoneModel}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneModel: e.target.value }))}
                  placeholder="e.g., iPhone 14 Pro, Galaxy S23"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="imei">IMEI Number (Optional)</Label>
                <Input
                  id="imei"
                  value={formData.imei}
                  onChange={(e) => setFormData(prev => ({ ...prev, imei: e.target.value }))}
                  placeholder="Enter IMEI number"
                />
              </div>
            </div>
          </div>

          {/* Issues Section */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Issues *</Label>
            
            <div className="space-y-2">
              {issues.filter(issue => issue.trim()).map((issue, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="flex-1">{issue}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeIssue(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex gap-2">
                <Input
                  value={currentIssue}
                  onChange={(e) => setCurrentIssue(e.target.value)}
                  placeholder="Describe the issue"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIssue())}
                />
                <Button type="button" onClick={addIssue} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Repair Details */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Repair Details</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="billAmount">Repair Cost (₹) *</Label>
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
                <Label htmlFor="orderStatus">Order Status</Label>
                <Select value={formData.orderStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, orderStatus: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2">
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

export default EnhancedRepairForm;
