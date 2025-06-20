
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import Layout from '../components/Layout';
import LoginForm from '../components/LoginForm';
import BottomNavigation from '../components/BottomNavigation';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentActivity from '../components/dashboard/RecentActivity';
import RepairsList from '../components/repairs/RepairsList';
import InventoryList from '../components/inventory/InventoryList';
import CustomersList from '../components/customers/CustomersList';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <DashboardStats />
            <RecentActivity />
          </div>
        );
      case 'repairs':
        return <RepairsList />;
      case 'inventory':
        return <InventoryList />;
      case 'customers':
        return <CustomersList />;
      default:
        return <div>Page not found</div>;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'repairs': return 'Repairs';
      case 'inventory': return 'Inventory';
      case 'customers': return 'Customers';
      default: return '';
    }
  };

  return (
    <DataProvider>
      <Layout title={getPageTitle()}>
        <div className="pb-20">
          {renderContent()}
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </Layout>
    </DataProvider>
  );
};

export default Index;
