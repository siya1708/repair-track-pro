
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useData } from '../../contexts/DataContext';
import { Search, User, Calendar, Plus } from 'lucide-react';

const CustomersList: React.FC = () => {
  const { customers, repairs } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCustomerRepairs = (customerId: string) => {
    return repairs.filter(repair => repair.customerId === customerId);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTotalSpent = (customerId: string) => {
    return getCustomerRepairs(customerId)
      .reduce((total, repair) => total + repair.billAmount, 0);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
        <div className="text-sm text-gray-600">
          {filteredCustomers.length} total customers
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search customers by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="grid gap-4">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => {
            const customerRepairs = getCustomerRepairs(customer.id);
            const totalSpent = getTotalSpent(customer.id);
            const lastRepair = customerRepairs
              .sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime())[0];

            return (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-gray-400" />
                            {customer.name}
                          </h3>
                          <p className="text-gray-600">{customer.phone}</p>
                          {customer.email && (
                            <p className="text-gray-600 text-sm">{customer.email}</p>
                          )}
                          {customer.address && (
                            <p className="text-gray-500 text-sm">{customer.address}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Total Repairs</p>
                          <p className="font-semibold">{customerRepairs.length}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Spent</p>
                          <p className="font-semibold text-green-600">${totalSpent.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Customer Since</p>
                          <p className="font-semibold">{formatDate(customer.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Last Repair</p>
                          <p className="font-semibold">
                            {lastRepair ? formatDate(lastRepair.receivedDate) : 'Never'}
                          </p>
                        </div>
                      </div>

                      {/* Recent Repairs */}
                      {customerRepairs.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">Recent Repairs</h4>
                          <div className="space-y-2">
                            {customerRepairs
                              .sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime())
                              .slice(0, 3)
                              .map((repair) => (
                                <div key={repair.id} className="flex justify-between items-center text-sm">
                                  <div>
                                    <span className="font-medium">{repair.phoneModel}</span>
                                    <span className="text-gray-500 ml-2">{repair.issue}</span>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-green-600 font-medium">${repair.billAmount}</div>
                                    <div className="text-gray-500 text-xs">
                                      {formatDate(repair.receivedDate)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            {customerRepairs.length > 3 && (
                              <p className="text-xs text-gray-500 text-center">
                                +{customerRepairs.length - 3} more repairs
                              </p>
                            )}
                          </div>
                        </div>
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
              <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Customers will appear here when you add repairs'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomersList;
