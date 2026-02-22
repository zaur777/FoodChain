
import React, { useState } from 'react';
import { HACCPPlan, Language } from '../types';
import { ICONS } from '../constants';
import { INDUSTRY_TEMPLATES } from '../templates';
import { translations } from '../translations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  plans: HACCPPlan[];
  onSelectPlan: (id: string) => void;
  onDeletePlan: (id: string) => void;
  onCreatePlan: (templateKey?: string) => void;
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ plans, onSelectPlan, onDeletePlan, onCreatePlan, lang }) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const t = translations[lang];
  const activePlans = plans.filter(p => p.status === 'Active');
  const totalHazards = plans.reduce((acc, p) => acc + p.hazards.length, 0);
  const totalCCPs = plans.reduce((acc, p) => acc + p.ccps.length, 0);

  const chartData = plans.map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 12) + '...' : p.name,
    Hazards: p.hazards.length,
    CCPs: p.ccps.length
  }));

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Active Systems" value={activePlans.length} color="text-indigo-600" icon={<ICONS.Clipboard />} />
        <StatCard title="Safety Hazards" value={totalHazards} color="text-amber-600" icon={<ICONS.Search />} />
        <StatCard title="Critical Points" value={totalCCPs} color="text-red-600" icon={<ICONS.Activity />} />
        <StatCard title="Verified Logs" value={124} color="text-emerald-600" icon={<ICONS.Alert />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Profile Chart */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ICONS.Activity /> Risk Profile
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="Hazards" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="CCPs" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 text-center font-bold uppercase tracking-widest">Comparative Hazard/CCP distribution</p>
        </div>

        {/* Plan Management Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 text-lg">My HACCP Systems</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{plans.length} Total</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Create New Card */}
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => onCreatePlan()}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-indigo-400 hover:shadow-md transition-all group min-h-[140px] w-full"
              >
                <div className="bg-white p-3 rounded-full shadow-sm text-slate-400 group-hover:text-indigo-600 mb-3 transition-colors">
                  <ICONS.Plus />
                </div>
                <span className="font-bold text-slate-500 group-hover:text-slate-800 transition-colors">{t.newPlanName}</span>
              </button>
              
              <button 
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
              >
                <ICONS.Sparkles />
                {t.createFromTemplate}
              </button>
            </div>

            {showTemplates && (
              <div className="md:col-span-2 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-black text-indigo-900 uppercase tracking-widest text-xs">{t.selectTemplate}</h4>
                  <button onClick={() => setShowTemplates(false)} className="text-indigo-400 hover:text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.keys(INDUSTRY_TEMPLATES).map(key => (
                    <button
                      key={key}
                      onClick={() => {
                        onCreatePlan(key);
                        setShowTemplates(false);
                      }}
                      className="bg-white p-3 rounded-xl border border-indigo-100 text-left hover:border-indigo-400 hover:shadow-sm transition-all group"
                    >
                      <span className="block text-[10px] font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                        {(t.industries as any)[key] || key}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Plan Cards */}
            {plans.map(plan => (
              <div 
                key={plan.id}
                className="group relative bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                      plan.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {plan.status}
                    </span>
                    <h4 className="font-bold text-slate-800 mt-2 text-base line-clamp-1">{plan.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Updated: {new Date(plan.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => onDeletePlan(plan.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 rounded-lg hover:bg-red-50"
                    title={t.delete}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                   <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[65%]"></div>
                   </div>
                   <span className="text-[10px] font-bold text-slate-400">65% Complete</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <div className="flex flex-col items-center px-2 py-1 bg-slate-50 rounded border border-slate-100 min-w-[40px]">
                      <span className="text-[10px] font-black text-slate-900 leading-none">{plan.hazards.length}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Hazards</span>
                    </div>
                    <div className="flex flex-col items-center px-2 py-1 bg-slate-50 rounded border border-slate-100 min-w-[40px]">
                      <span className="text-[10px] font-black text-slate-900 leading-none">{plan.ccps.length}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">CCPs</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onSelectPlan(plan.id)}
                    className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all shadow-sm active:scale-95"
                  >
                    Select Plan
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color, icon }: { title: string; value: number | string; color: string; icon: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-slate-50 rounded-full transition-transform group-hover:scale-110 opacity-50`}></div>
    <div className="relative z-10">
      <div className={`p-2.5 rounded-xl bg-slate-50 ${color} w-fit mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</div>
    </div>
  </div>
);

export default Dashboard;
