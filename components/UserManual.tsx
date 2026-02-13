
import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface UserManualProps {
  lang: Language;
}

const UserManual: React.FC<UserManualProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-900 p-8 text-white">
        <h2 className="text-3xl font-black mb-2">{t.userGuide}</h2>
        <p className="text-slate-400">Mastering the FoodSafe HACCP Management Platform</p>
      </div>
      
      <div className="p-8 space-y-12">
        <section>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-black">01</span>
            Getting Started
          </h3>
          <div className="pl-11 text-slate-600 space-y-3">
            <p>Every HACCP plan begins with a clear scope. Use the <strong>"New Plan"</strong> button to name your specific production line or facility.</p>
            <p>Switch between languages anytime using the toggle in the header. All AI-generated content will respect your active language selection.</p>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-black">02</span>
            Prerequisite Programs (PRPs)
          </h3>
          <div className="pl-11 text-slate-600 space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 mb-1">Team Management</h4>
              <p>Register your multi-disciplinary team. Auditors require proof of expertise (QC, Production, Engineering).</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-1">Materials & Products</h4>
              <p>Log all raw materials. Specify allergens so they can be identified as chemical hazards in the analysis phase.</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-black">03</span>
            Hazard Analysis & AI
          </h3>
          <div className="pl-11 text-slate-600 space-y-4">
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <h4 className="font-bold text-indigo-900 mb-1 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                AI Auto-Identify
              </h4>
              <p className="text-sm text-indigo-800/80">Use this in the <strong>Analysis</strong> tab to instantly generate lists of Biological, Chemical, and Physical hazards based on your process step.</p>
            </div>
            <p>Use the <strong>Decision Tree (Q1-Q4)</strong> to scientifically determine if a hazard is a Critical Control Point (CCP). The system automates this logic for you.</p>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-black">04</span>
            CCP Planning (Principle 3-7)
          </h3>
          <div className="pl-11 text-slate-600 space-y-4">
            <p>Once a CCP is identified, move to <strong>Step 2: CCP Plan</strong>. Use <strong>"Magic Fill"</strong> to generate:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-sm font-medium">
              <li>Critical Limits (measurable thresholds)</li>
              <li>Monitoring (How, Frequency, Who)</li>
              <li>Corrective Actions (Immediate response)</li>
              <li>Verification & Validation Evidence</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-black">05</span>
            Compliance & Printing
          </h3>
          <div className="pl-11 text-slate-600 space-y-3">
            <p>Go to the <strong>"HACCP Plan"</strong> tab to see the final unified worksheet. This document is formatted to be print-ready and suitable for third-party audits.</p>
            <p>Monitor real-time simulations in the <strong>"Live Monitoring"</strong> tab to train operators on how the system reacts to critical limit violations.</p>
          </div>
        </section>
      </div>

      <div className="bg-slate-50 p-8 border-t border-slate-200 text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">FoodSafe HACCP v2.4.0 — Technical Documentation</p>
      </div>
    </div>
  );
};

export default UserManual;
