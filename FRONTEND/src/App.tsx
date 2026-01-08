import { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { HeroStats } from './components/HeroStats';
import { TabNavigation } from './components/TabNavigation';
import { EquipmentTab } from './components/EquipmentTab';
import { SoftwareTab } from './components/SoftwareTab';
import { POCTab } from './components/POCTab';
import { TabType, Equipment, Software, POC } from './types';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { BackToTop } from './components/BackToTop';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('equipment');
  const { user, isLoading } = useAuth();

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [software, setSoftware] = useState<Software[]>([]);
  const [pocs, setPocs] = useState<POC[]>([]);
  const [globalSearch, setGlobalSearch] = useState('');

  const fetchData = async () => {
    if (!user?.token) return;

    try {
      const headers = { 'Authorization': `Bearer ${user.token}` };

      const [eqRes, swRes, pocRes] = await Promise.all([
        fetch('/api/equipment', { headers }),
        fetch('/api/software', { headers }),
        fetch('/api/pocs', { headers })
      ]);

      if (eqRes.ok) setEquipment(await eqRes.json());
      if (swRes.ok) setSoftware(await swRes.json());
      if (pocRes.ok) setPocs(await pocRes.json());
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRefresh = () => {
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgb(10,10,10)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={() => { }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 transition-colors duration-500">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNiIgc3Ryb2tlPSJyZ2JhKDYsIDE4MiwgMjEyLCAwLjEpIi8+PC9nPjwvc3ZnPg==')] opacity-30 dark:opacity-10" />

      <div className="relative z-10">
        <TopBar onRefresh={handleRefresh} searchQuery={globalSearch} onSearchChange={setGlobalSearch} />
        <HeroStats activeTab={activeTab} equipment={equipment} software={software} pocs={pocs} />
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
          {activeTab === 'equipment' && (
            <EquipmentTab
              equipment={equipment}
              onUpdate={fetchData}
              globalSearch={globalSearch}
            />
          )}
          {activeTab === 'software' && (
            <SoftwareTab
              software={software}
              onUpdate={fetchData}
              globalSearch={globalSearch}
            />
          )}
          {activeTab === 'pocs' && (
            <POCTab
              pocs={pocs}
              onUpdate={fetchData}
              globalSearch={globalSearch}
            />
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              IT Asset Management Dashboard • Powered by Asset Hub
            </p>
          </div>
        </div>
      </div>
      <BackToTop />
    </div>
  );
}

export default App;
