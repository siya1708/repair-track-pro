
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Plus, Calendar, User } from 'lucide-react';
import RepairForm from './RepairForm';

const RepairsList: React.FC = () => {
  const { repairs, customers, updateRepairStatus } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Filter repairs based on user role
  const userRepairs = user?.role === 'owner' 
    ? repairs 
    : repairs.filter(r => r.storeId === user?.storeId);

  // Filter repairs based on search and status
  const filteredRepairs = userRepairs.filter(repair => {
    const customer = customers.find(c => c.id === repair.customerId);
    const matchesSearch = repair.phoneModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repair.issue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || repair.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
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

  const statusOptions = ['all', 'pending', 'in-progress', 'completed', 'delivered'];

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
            const customer = customers.find(c => c.id === repair.customerId);
            return (
              <Card key={repair.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{repair.phoneModel}</h3>
                          <p className="text-gray-600 flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {customer?.name} • {customer?.phone}
                          </p>
                        </div>
                        <Badge className={getStatusColor(repair.status)}>
                          {repair.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm"><strong>Issue:</strong> {repair.issue}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Received: {formatDate(repair.receivedDate)}
                          </span>
                          {repair.estimatedCompletion && (
                            <span>Est. Completion: {formatDate(repair.estimatedCompletion)}</span>
                          )}
                        </div>
                        <p className="text-lg font-semibold text-green-600">
                          ${repair.billAmount.toFixed(2)}
                        </p>
                        {repair.notes && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Notes:</strong> {repair.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:w-48">
                      {repair.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusUpdate(repair.id, 'in-progress')}
                          className="w-full"
                        >
                          Start Repair
                        </Button>
                      )}
                      {repair.status === 'in-progress' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusUpdate(repair.id, 'completed')}
                          className="w-full"
                        >
                          Mark Complete
                        </Button>
                      )}
                      {repair.status === 'completed' && (
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
        <RepairForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default RepairsList;
