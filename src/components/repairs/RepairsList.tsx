
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Plus, Calendar, User } from 'lucide-react';
import EnhancedRepairForm from './EnhancedRepairForm';

const RepairsList: React.FC = () => {
  const { repairs, customers, updateRepairStatus } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Filter repairs based on user role
  const userRepairs = user?.role === 'owner' 
    ? repairs 
    : repairs.filter(r => r.store_id === user?.store_id);

  // Filter repairs based on search and status
  const filteredRepairs = userRepairs.filter(repair => {
    const customer = customers.find(c => c.phone === repair.customer_phone);
    const matchesSearch = repair.phone_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repair.issues?.some(issue => issue.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         repair.phone_company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || repair.order_status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'repaired': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = (repairId: string, newStatus: string) => {
    updateRepairStatus(repairId, newStatus);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const statusOptions = ['all', 'pending', 'in-progress', 'repaired', 'delivered', 'cancelled'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Repairs Management</h2>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Repair
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search repairs, customers, or issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedStatus === status
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repairs List */}
      <div className="grid gap-4">
        {filteredRepairs.length > 0 ? (
          filteredRepairs.map((repair) => {
            const customer = customers.find(c => c.phone === repair.customer_phone);
            return (
              <Card key={repair.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {repair.phone_company} {repair.phone_model}
                          </h3>
                          <p className="text-gray-600 flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {customer?.name} • {customer?.phone}
                          </p>
                          {repair.imei && (
                            <p className="text-sm text-gray-500">IMEI: {repair.imei}</p>
                          )}
                        </div>
                        <Badge className={getStatusColor(repair.order_status)}>
                          {repair.order_status.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <strong>Issues:</strong>
                          <ul className="list-disc list-inside ml-2">
                            {repair.issues?.map((issue, index) => (
                              <li key={index} className="text-sm">{issue}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Received: {formatDate(repair.received_date)}
                          </span>
                          {repair.estimated_completion && (
                            <span>Est. Completion: {formatDate(repair.estimated_completion)}</span>
                          )}
                        </div>
                        <p className="text-lg font-semibold text-green-600">
                          ₹{repair.bill_amount.toFixed(2)}
                        </p>
                        {repair.notes && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Notes:</strong> {repair.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:w-48">
                      {repair.order_status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusUpdate(repair.id, 'in-progress')}
                          className="w-full"
                        >
                          Start Repair
                        </Button>
                      )}
                      {repair.order_status === 'in-progress' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusUpdate(repair.id, 'completed')}
                          className="w-full"
                        >
                          Mark Repaired
                        </Button>
                      )}
                      {repair.order_status === 'repaired' && (
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleStatusUpdate(repair.id, 'delivered')}
                          className="w-full"
                        >
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No repairs found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first repair'
                }
              </p>
              {!searchTerm && selectedStatus === 'all' && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Repair
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Repair Form Modal */}
      {showForm && (
        <EnhancedRepairForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default RepairsList;
