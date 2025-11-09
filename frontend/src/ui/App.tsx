import { useState } from 'react';
import { Tabs } from './components/Tabs';
import { RoutesTab } from './pages/RoutesTab';
import { CompareTab } from './pages/CompareTab';
import { BankingTab } from './pages/BankingTab';
import { PoolingTab } from './pages/PoolingTab';

function App() {
  const [activeTab, setActiveTab] = useState('routes');

  const tabs = [
    { id: 'routes', label: 'Routes', content: <RoutesTab /> },
    { id: 'compare', label: 'Compare', content: <CompareTab /> },
    { id: 'banking', label: 'Banking', content: <BankingTab /> },
    { id: 'pooling', label: 'Pooling', content: <PoolingTab /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">FuelEU Maritime</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}

export default App;
