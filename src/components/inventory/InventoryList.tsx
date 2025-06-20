
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Plus, Folder, AlertTriangle, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const InventoryList: React.FC = () => {
  const { 
    inventory, 
    addInventoryUpdateRequest, 
    approveInventoryRequest, 
    denyInventoryRequest,
    updateInventoryQuantity 
  } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showRequestForm, setShowRequestForm] = useState<string | null>(null);
  const [requestData, setRequestData] = useState({ quantity: '', reason: '' });

  // Filter inventory based on user role
  const userInventory = user?.role === 'owner' 
    ? inventory 
    : inventory.filter(i => i.storeId === user?.storeId);

  // Filter inventory based on search
  const filteredInventory = userInventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateRequest = (itemId: string) => {
    if (!requestData.quantity || !requestData.reason) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const quantityChange = parseInt(requestData.quantity);
    if (isNaN(quantityChange)) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive"
      });
      return;
    }

    addInventoryUpdateRequest(itemId, {
      requestedBy: user!.id,
      quantityChange,
      reason: requestData.reason,
      status: 'pending',
      requestedAt: new Date()
    });

    toast({
      title: "Success",
      description: "Update request submitted for approval"
    });

    setShowRequestForm(null);
    setRequestData({ quantity: '', reason: '' });
  };

  const handleDirectUpdate = (itemId: string, change: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      const newQuantity = Math.max(0, item.quantity + change);
      updateInventoryQuantity(itemId, newQuantity);
      
      toast({
        title: "Success",
        description: `Inventory updated successfully`
      });
    }
  };

  const pendingRequests = userInventory.flatMap(item => 
    item.requestedUpdates
      .filter(req => req.status === 'pending')
      .map(req => ({ ...req, itemName: item.name, itemId: item.id }))
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        {user?.role === 'owner' && pendingRequests.length > 0 && (
          <Badge variant="destructive" className="text-sm">
            {pendingRequests.length} Pending Requests
          </Badge>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search inventory items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests (Owner Only) */}
      {user?.role === 'owner' && pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Pending Approval Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium">{request.itemName}</p>
                    <p className="text-sm text-gray-600">
                      {request.quantityChange > 0 ? 'Add' : 'Remove'} {Math.abs(request.quantityChange)} units
                    </p>
                    <p className="text-sm text-gray-500">Reason: {request.reason}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => approveInventoryRequest(request.itemId, request.id)}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => denyInventoryRequest(request.itemId, request.id)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Items */}
      <div className="grid gap-4">
        {filteredInventory.length > 0 ? (
          filteredInventory.map((item) => {
            const isLowStock = item.quantity <= item.reorderLevel;
            const hasPendingRequest = item.requestedUpdates.some(req => req.status === 'pending');
            
            return (
              <Card key={item.id} className={`hover:shadow-md transition-shadow ${isLowStock ? 'border-red-200' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-gray-600">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{item.quantity}</p>
                          <p className="text-sm text-gray-500">in stock</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600 font-medium">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          isLowStock 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {isLowStock ? 'Low Stock' : 'In Stock'}
                        </span>
                        {hasPendingRequest && (
                          <Badge variant="outline" className="text-orange-600">
                            Request Pending
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-2">
                        Reorder Level: {item.reorderLevel} units
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 lg:w-48">
                      {user?.role === 'owner' ? (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDirectUpdate(item.id, -1)}
                            disabled={item.quantity <= 0}
                            className="flex-1"
                          >
                            -1
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDirectUpdate(item.id, 1)}
                            className="flex-1"
                          >
                            +1
                          </Button>
                        </div>
                      ) : (
                        <>
                          {showRequestForm === item.id ? (
                            <div className="space-y-2">
                              <Input
                                type="number"
                                placeholder="Quantity change"
                                value={requestData.quantity}
                                onChange={(e) => setRequestData(prev => ({ ...prev, quantity: e.target.value }))}
                                className="text-sm"
                              />
                              <Input
                                placeholder="Reason"
                                value={requestData.reason}
                                onChange={(e) => setRequestData(prev => ({ ...prev, reason: e.target.value }))}
                                className="text-sm"
                              />
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateRequest(item.id)}
                                  className="flex-1 text-xs"
                                >
                                  Submit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowRequestForm(null)}
                                  className="flex-1 text-xs"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setShowRequestForm(item.id)}
                              disabled={hasPendingRequest}
                              className="w-full"
                            >
                              {hasPendingRequest ? 'Request Pending' : 'Request Update'}
                            </Button>
                          )}
                        </>
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
              <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Get started by adding your first inventory item'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InventoryList;
