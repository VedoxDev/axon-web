import React from 'react';
import { LayoutProvider } from '../contexts/LayoutContext';
import AppLayout from '../components/layout/AppLayout';
import Titlebar from '../components/layout/Titlebar';
import CollapsibleSidebar from '../components/CollapsibleSidebar';
import MainContent from '../components/MainContent';

const DashboardPage: React.FC = () => {
  return (
    <LayoutProvider>
      <AppLayout
        titlebarContent={<Titlebar />}
        sidebarContent={<CollapsibleSidebar />}
      >
        <MainContent />
      </AppLayout>
    </LayoutProvider>
  );
};

export default DashboardPage; 