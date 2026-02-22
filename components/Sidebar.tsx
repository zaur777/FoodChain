
import React from 'react';
import { ICONS } from '../constants';
import { translations } from '../translations';
import { Language } from '../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  lang: Language;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, lang }) => {
  const t = translations[lang];

  const sections = [
    {
      title: lang === 'en' ? 'Overview' : (lang === 'ru' ? 'Обзор' : 'İcmal'),
      items: [
        { id: 'dashboard', label: t.dashboard, icon: ICONS.Dashboard },
      ]
    },
    {
      title: lang === 'en' ? 'Preparation' : (lang === 'ru' ? 'Подготовка' : 'Hazırlıq'),
      items: [
        { id: 'team', label: t.team, icon: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
        { id: 'materials', label: t.materials, icon: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg> },
        { id: 'flowchart', label: t.flowchart, icon: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h6v6H3z"/><path d="M15 3h6v6h-6z"/><path d="M3 15h6v6H3z"/><path d="M15 15h6v6h-6z"/><path d="M9 6h6"/><path d="M9 18h6"/><path d="M6 9v6"/><path d="M18 9v6"/></svg> },
      ]
    },
    {
      title: lang === 'en' ? 'HACCP Core' : (lang === 'ru' ? 'Ядро HACCP' : 'HACCP Əsası'),
      items: [
        { id: 'analysis', label: t.analysis, icon: ICONS.Search },
        { id: 'worksheet', label: t.haccpPlan, icon: ICONS.Clipboard },
      ]
    },
    {
      title: lang === 'en' ? 'Operation' : (lang === 'ru' ? 'Операции' : 'Əməliyyatlar'),
      items: [
        { id: 'monitoring', label: t.monitoring, icon: ICONS.Activity },
        { id: 'alerts', label: t.alerts, icon: ICONS.Alert },
      ]
    },
    {
      title: lang === 'en' ? 'Support' : (lang === 'ru' ? 'Поддержка' : 'Dəstək'),
      items: [
        { id: 'manual', label: t.userGuide, icon: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M12 6v4"/><path d="M12 14h.01"/></svg> },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 hidden md:flex flex-col border-r border-slate-800">
      <div className="p-6 overflow-y-auto">
        <div className="flex items-center gap-3 text-white mb-8">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <ICONS.Clipboard />
          </div>
          <span className="text-xl font-bold tracking-tight">FoodSafe</span>
        </div>

        <nav className="space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                      activeTab === item.id 
                      ? 'bg-indigo-600 text-white shadow-lg font-black' 
                      : 'hover:bg-slate-800 hover:text-slate-100 font-medium'
                    }`}
                  >
                    <item.icon />
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Compliance Status</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 flex-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-[88%]"></div>
            </div>
            <span className="text-xs font-bold text-white">88%</span>
          </div>
          <p className="text-[10px] text-slate-400">Next Audit: Oct 2025</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
