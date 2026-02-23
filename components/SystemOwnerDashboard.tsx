
import React from 'react';
import { HACCPPlan, Language } from '../types';
import { translations } from '../translations';
import { ICONS } from '../constants';

interface SystemOwnerDashboardProps {
  plans: HACCPPlan[];
  lang: Language;
}

const SystemOwnerDashboard: React.FC<SystemOwnerDashboardProps> = ({ plans, lang }) => {
  const t = translations[lang];

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 text-white p-12 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-4 tracking-tight">System Owner Console</h2>
          <p className="text-slate-400 max-w-2xl font-medium">Global overview of all HACCP systems, compliance metrics, and infrastructure health.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Total Active Nodes</h4>
          <div className="text-4xl font-black text-slate-900">1,284</div>
          <p className="text-xs text-emerald-600 font-bold mt-2">↑ 12% from last month</p>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Compliance Score</h4>
          <div className="text-4xl font-black text-slate-900">98.4%</div>
          <p className="text-xs text-indigo-600 font-bold mt-2">Global Average</p>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">System Uptime</h4>
          <div className="text-4xl font-black text-slate-900">99.99%</div>
          <p className="text-xs text-slate-400 font-bold mt-2">Last 30 days</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Global System Registry</h3>
          <button className="text-xs font-black text-indigo-600 uppercase tracking-widest">Export All Data</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Facility Name</th>
                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Industry</th>
                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Status</th>
                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-right">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: 'Central Bakery', industry: 'Food Processing', status: 'Active', health: '94%' },
                { name: 'North Meat Plant', industry: 'Slaughterhouse', status: 'Active', health: '88%' },
                { name: 'Oceanic Drinks', industry: 'Beverage', status: 'Warning', health: '72%' },
                { name: 'Green Valley Dairy', industry: 'Dairy Farm', status: 'Active', health: '99%' },
              ].map((sys, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{sys.name}</td>
                  <td className="px-6 py-4 text-slate-500">{sys.industry}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      sys.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {sys.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">{sys.health}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemOwnerDashboard;
