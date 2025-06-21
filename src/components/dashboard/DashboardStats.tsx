
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Folder, User, Clock } from 'lucide-react';

const DashboardStats: React.FC = () => {
  const { repairs, inventory, customers } = useData();
  const { user } = useAuth();

  // Filter data based on user role and store access
  const userRepairs = user?.role === 'owner' 
    ? repairs 
    : repairs.filter(r => r.store_id === user?.store_id);

  const userInventory = user?.role === 'owner'
    ? inventory
    : inventory.filter(i => i.store_id === user?.store_id);

  const stats = [
    {
      title: 'Active Repairs',
      value: userRepairs.filter(r => r.status === 'in-progress').length,
      total: userRepairs.length,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Low Stock Items',
      value: userInventory.filter(i => i.quantity <= i.reorder_level).length,
      total: userInventory.length,
      icon: Folder,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Total Customers',
      value: customers.length,
      total: customers.length,
      icon: User,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Delivery',
      value: userRepairs.filter(r => r.status === 'completed').length,
      total: userRepairs.length,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="transition-all hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">
                    of {stat.total} total
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;
