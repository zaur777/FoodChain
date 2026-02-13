
import React from 'react';
import { HACCPPlan } from '../types';

interface HACCPWorksheetProps {
  plan: HACCPPlan;
}

const HACCPWorksheet: React.FC<HACCPWorksheetProps> = ({ plan }) => {
  return (
    <div className="space-y-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none">
      <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">HACCP Plan Summary</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">{plan.name} — Status: {plan.status}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">HACCP Team</h4>
          <div className="space-y-1">
            {plan.team.map(m => (
              <p key={m.id} className="text-sm font-medium"><span className="text-slate-400 mr-2">•</span>{m.name} ({m.role})</p>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">General Info</h4>
          <p className="text-sm">Created: {new Date(plan.createdAt).toLocaleDateString()}</p>
          <p className="text-sm">Active Materials: {plan.materials.length}</p>
          <p className="text-sm">Process Steps: {plan.flowSteps.length}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-left font-black uppercase tracking-wider">
              <th className="p-2 border border-slate-900 w-12">CCP #</th>
              <th className="p-2 border border-slate-900">Process Step / Hazard / Materials</th>
              <th className="p-2 border border-slate-900">Critical Limits</th>
              <th className="p-2 border border-slate-900">Monitoring (What/How/Freq/Who)</th>
              <th className="p-2 border border-slate-900">Corrective Action</th>
              <th className="p-2 border border-slate-900">Verification & Validation</th>
              <th className="p-2 border border-slate-900">Records</th>
            </tr>
          </thead>
          <tbody>
            {plan.ccps.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 italic border border-slate-200 text-xs">No Critical Control Points defined in the plan yet.</td>
              </tr>
            ) : (
              plan.ccps.map((ccp, idx) => {
                const hazard = plan.hazards.find(h => h.id === ccp.hazardId);
                const step = plan.flowSteps.find(s => s.id === hazard?.flowStepId);
                const associatedMaterials = plan.materials.filter(m => ccp.associatedMaterialIds?.includes(m.id));
                
                return (
                  <tr key={ccp.id}>
                    <td className="p-2 border border-slate-200 align-top font-bold text-center">{idx + 1}</td>
                    <td className="p-2 border border-slate-200 align-top">
                      <p className="font-bold text-indigo-700">{step?.name}</p>
                      <p className="text-slate-500 italic mt-1 mb-2">{hazard?.potentialHazard}</p>
                      {associatedMaterials.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {associatedMaterials.map(m => (
                            <span key={m.id} className="bg-slate-100 text-[8px] px-1 rounded border border-slate-200 text-slate-600">{m.name}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-2 border border-slate-200 align-top font-bold text-red-700">{ccp.criticalLimits}</td>
                    <td className="p-2 border border-slate-200 align-top space-y-1">
                      <p><span className="font-black uppercase text-slate-400 mr-1">Procedure:</span>{ccp.monitoringProcedures}</p>
                      <p><span className="font-black uppercase text-slate-400 mr-1">Freq:</span>{ccp.monitoringFrequency}</p>
                      <p><span className="font-black uppercase text-slate-400 mr-1">Resp:</span>{ccp.monitoringResponsibility}</p>
                    </td>
                    <td className="p-2 border border-slate-200 align-top">{ccp.correctiveActions}</td>
                    <td className="p-2 border border-slate-200 align-top space-y-2">
                      <div className="mb-2">
                        <span className="font-black uppercase text-slate-400 block mb-0.5">Verification:</span>
                        {ccp.verificationProcedures}
                      </div>
                      <div className="mb-2">
                        <span className="font-black uppercase text-indigo-400 block mb-0.5">Validation Basis:</span>
                        {ccp.validationProcedures || 'Pending scientific review'}
                      </div>
                      <div>
                        <span className="font-black uppercase text-indigo-400 block mb-0.5">Summary:</span>
                        {ccp.validation || 'N/A'}
                      </div>
                    </td>
                    <td className="p-2 border border-slate-200 align-top">
                      {ccp.records || 'Daily Production Logs'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest print:mt-4">
        Generated by FoodSafe HACCP Management System — Document Version: 2.1.0
      </div>
    </div>
  );
};

export default HACCPWorksheet;
