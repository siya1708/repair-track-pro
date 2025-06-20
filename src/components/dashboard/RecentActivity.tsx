
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../ui/badge';
import { Clock, User, Calendar } from 'lucide-react';

const RecentActivity: React.FC = () => {
  const { repairs, customers } = useData();
  const { user } = useAuth();

  // Filter repairs based on user role
  const userRepairs = user?.role === 'owner' 
    ? repairs 
    : repairs.filter(r => r.storeId === user?.storeId);

  // Get recent repairs (last 5)
  const recentRepairs = userRepairs
    .sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentRepairs.length > 0 ? (
            recentRepairs.map((repair) => {
              const customer = customers.find(c => c.id === repair.customerId);
              return (
                <div key={repair.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{repair.phoneModel}</p>
                      <p className="text-xs text-gray-600">
                        {customer?.name} • {repair.issue}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(repair.receivedDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(repair.status)}>
                      {repair.status.replace('-', ' ')}
                    </Badge>
                    <p className="text-xs text-gray-600 mt-1">
                      ${repair.billAmount}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No recent repairs</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
