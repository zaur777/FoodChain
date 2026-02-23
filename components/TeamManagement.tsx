
import React, { useState } from 'react';
import { HACCPPlan, HACCPTeamMember } from '../types';
import { ICONS } from '../constants';

interface TeamManagementProps {
  plan: HACCPPlan;
  onUpdatePlan: (plan: HACCPPlan) => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ plan, onUpdatePlan }) => {
  const [newMember, setNewMember] = useState({ name: '', role: '', responsibility: '' });

  const addMember = () => {
    if (!newMember.name) return;
    const member: HACCPTeamMember = {
      id: `member-${Date.now()}`,
      ...newMember
    };
    onUpdatePlan({ ...plan, team: [...plan.team, member] });
    setNewMember({ name: '', role: '', responsibility: '' });
  };

  const removeMember = (id: string) => {
    onUpdatePlan({ ...plan, team: plan.team.filter(m => m.id !== id) });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">HACCP Team Members</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <input 
            placeholder="Full Name"
            className="rounded-lg border-slate-200 text-sm"
            value={newMember.name}
            onChange={e => setNewMember({ ...newMember, name: e.target.value })}
          />
          <input 
            placeholder="Company Role (e.g. QC Manager)"
            className="rounded-lg border-slate-200 text-sm"
            value={newMember.role}
            onChange={e => setNewMember({ ...newMember, role: e.target.value })}
          />
          <input 
            placeholder="HACCP Responsibility"
            className="rounded-lg border-slate-200 text-sm"
            value={newMember.responsibility}
            onChange={e => setNewMember({ ...newMember, responsibility: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && addMember()}
          />
          <button 
            onClick={addMember}
            disabled={!newMember.name || !newMember.role}
            className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Member
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">HACCP Responsibility</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {plan.team.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">No members added yet.</td>
                </tr>
              ) : (
                plan.team.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{m.name}</td>
                    <td className="px-4 py-3 text-slate-600">{m.role}</td>
                    <td className="px-4 py-3 text-slate-600">{m.responsibility}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removeMember(m.id)} className="text-red-400 hover:text-red-600">Remove</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
