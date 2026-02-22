
import React, { useState, useEffect, useCallback } from 'react';
import { HACCPPlan, Language, Company } from './types';
import { INITIAL_PLANS, ICONS } from './constants';
import { INDUSTRY_TEMPLATES } from './templates';
import { translations } from './translations';
import Dashboard from './components/Dashboard';
import PlanEditor from './components/PlanEditor';
import MonitoringDashboard from './components/MonitoringDashboard';
import Sidebar from './components/Sidebar';
import TeamManagement from './components/TeamManagement';
import MaterialsManagement from './components/MaterialsManagement';
import FlowchartEditor from './components/FlowchartEditor';
import HACCPWorksheet from './components/HACCPWorksheet';
import LandingPage from './components/LandingPage';
import UserManual from './components/UserManual';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('app_lang') as Language) || 'en';
  });

  const [company, setCompany] = useState<Company | null>(() => {
    try {
      const saved = localStorage.getItem('company_auth');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Auth parse error", e);
      return null;
    }
  });

  const [plans, setPlans] = useState<HACCPPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  const [isPendingCreate, setIsPendingCreate] = useState(false);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'team' | 'materials' | 'flowchart' | 'analysis' | 'monitoring' | 'worksheet' | 'alerts' | 'manual'>('dashboard');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  useEffect(() => {
    if (company) {
      localStorage.setItem('company_auth', JSON.stringify(company));
      fetchPlans(company.id);
    } else {
      localStorage.removeItem('company_auth');
      setPlans([]);
      setSelectedPlanId(null);
    }
  }, [company]);

  const fetchPlans = async (companyId: string) => {
    setIsLoadingPlans(true);
    try {
      const response = await fetch(`/api/plans?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setPlans(data.length > 0 ? data : INITIAL_PLANS);
        if (data.length > 0 && !selectedPlanId) {
          setSelectedPlanId(data[0].id);
        } else if (data.length === 0 && INITIAL_PLANS.length > 0) {
          setSelectedPlanId(INITIAL_PLANS[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch plans", error);
      setPlans(INITIAL_PLANS);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const savePlanToServer = async (plan: HACCPPlan) => {
    if (!company) return;
    try {
      await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id, plan }),
      });
    } catch (error) {
      console.error("Failed to save plan", error);
    }
  };

  const handleCreatePlan = useCallback(async (templateKey?: string) => {
    let defaultName = t.newPlanName;
    let templateData: Partial<HACCPPlan> = {};

    if (templateKey && INDUSTRY_TEMPLATES[templateKey]) {
      templateData = INDUSTRY_TEMPLATES[templateKey];
      defaultName = (t.industries as any)[templateKey] || templateData.name || t.newPlanName;
    }

    const name = window.prompt(t.enterPlanName, defaultName);
    if (!name || name.trim() === '') return null;

    const newPlan: HACCPPlan = {
      id: `plan-${Date.now()}`,
      name: name.trim(),
      status: 'Draft',
      createdAt: new Date().toISOString(),
      team: templateData.team || [],
      materials: templateData.materials || [],
      products: templateData.products || [],
      flowSteps: templateData.flowSteps || [],
      hazards: templateData.hazards || [],
      ccps: templateData.ccps || []
    };
    
    setPlans(prev => [...prev, newPlan]);
    setSelectedPlanId(newPlan.id);
    setActiveTab('analysis'); 
    await savePlanToServer(newPlan);
    return newPlan.id;
  }, [t, company]);

  useEffect(() => {
    if (company && isPendingCreate) {
      setIsPendingCreate(false);
      handleCreatePlan();
    }
  }, [company, isPendingCreate, handleCreatePlan]);

  const handleLogin = useCallback((newCompany: Company, shouldCreate: boolean = false) => {
    setCompany(newCompany);
    if (shouldCreate) {
      setIsPendingCreate(true);
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { company: newCompany } = event.data;
        handleLogin(newCompany);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleLogin]);

  const handleDeletePlan = async (id: string | null) => {
    if (!id || !company) return;
    if (window.confirm(t.confirmDelete)) {
      try {
        await fetch(`/api/plans/${id}?companyId=${company.id}`, { method: 'DELETE' });
        setPlans(prev => {
          const updated = prev.filter(p => p.id !== id);
          if (selectedPlanId === id) {
            const nextPlan = updated.length > 0 ? updated[0].id : null;
            setSelectedPlanId(nextPlan);
            if (!nextPlan) setActiveTab('dashboard');
          }
          return updated;
        });
      } catch (error) {
        console.error("Failed to delete plan", error);
      }
    }
  };

  const handleSelectPlan = (id: string) => {
    setSelectedPlanId(id);
    setActiveTab('analysis');
  };

  const handleRenamePlan = () => {
    if (!selectedPlanId) return;
    const current = plans.find(p => p.id === selectedPlanId);
    const newName = window.prompt(t.enterPlanName, current?.name);
    if (newName && current) {
      updatePlan({ ...current, name: newName });
    }
  };

  const updatePlan = (updatedPlan: HACCPPlan) => {
    setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    savePlanToServer(updatedPlan);
  };

  if (!company) {
    return <LandingPage lang={lang} setLang={setLang} onLogin={handleLogin} />;
  }

  const currentPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} lang={lang} />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {currentPlan && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  currentPlan.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {currentPlan.status}
                </span>
              )}
              <h1 className="text-2xl font-bold text-slate-900 capitalize">
                {t[activeTab as keyof typeof t] as string}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                value={selectedPlanId || ''} 
                onChange={(e) => {
                  setSelectedPlanId(e.target.value);
                  if (activeTab === 'dashboard') setActiveTab('analysis');
                }}
                className="text-sm border-none bg-transparent font-medium text-slate-500 focus:ring-0 cursor-pointer p-0 hover:text-indigo-600 transition-colors"
              >
                <option value="" disabled>Select a HACCP Plan...</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {selectedPlanId && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">|</span>
                  <button onClick={handleRenamePlan} className="text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase transition-colors">{t.rename}</button>
                  <button onClick={() => handleDeletePlan(selectedPlanId)} className="text-xs font-bold text-slate-400 hover:text-red-600 uppercase transition-colors">{t.delete}</button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-200 p-1 rounded-lg">
              {(['az', 'ru', 'en'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-0.5 rounded text-[10px] font-black transition-all uppercase ${lang === l ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <button 
              onClick={() => handleCreatePlan()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95 font-bold text-sm"
            >
              <ICONS.Plus />
              {t.getStarted}
            </button>
            <button 
              onClick={() => setCompany(null)}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title={t.logout}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto pb-12">
          {activeTab === 'dashboard' ? (
            <Dashboard 
              plans={plans} 
              onSelectPlan={handleSelectPlan} 
              onDeletePlan={handleDeletePlan}
              onCreatePlan={(key) => handleCreatePlan(key)}
              lang={lang}
            />
          ) : activeTab === 'manual' ? (
            <UserManual lang={lang} />
          ) : !currentPlan ? (
            <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-slate-200 shadow-sm">
              <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                 <ICONS.Clipboard />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">No Plan Selected</h2>
              <p className="text-slate-500 max-w-md mx-auto mb-8">Please select an existing HACCP plan from the dropdown above or create a new one to begin your safety analysis.</p>
              <button 
                onClick={() => handleCreatePlan()}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
              >
                <ICONS.Plus />
                {t.newPlanName}
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'team' && <TeamManagement plan={currentPlan} onUpdatePlan={updatePlan} />}
              {activeTab === 'materials' && <MaterialsManagement plan={currentPlan} onUpdatePlan={updatePlan} />}
              {activeTab === 'flowchart' && <FlowchartEditor plan={currentPlan} onUpdatePlan={updatePlan} />}
              {activeTab === 'analysis' && (
                <PlanEditor 
                  plans={plans}
                  selectedPlanId={selectedPlanId}
                  onSelectPlan={setSelectedPlanId}
                  onUpdatePlan={updatePlan}
                />
              )}
              {activeTab === 'worksheet' && <HACCPWorksheet plan={currentPlan} />}
              {activeTab === 'monitoring' && <MonitoringDashboard plans={plans} />}
              {activeTab === 'alerts' && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="bg-green-100 text-green-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ICONS.Alert />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">System Healthy</h2>
                  <p className="text-slate-500 max-w-md mx-auto">No critical limit violations or maintenance alerts detected in the last 24 hours.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
