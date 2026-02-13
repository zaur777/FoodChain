
import React, { useState } from 'react';
import { HACCPPlan, FlowStep } from '../types';
import { ICONS } from '../constants';

interface FlowchartEditorProps {
  plan: HACCPPlan;
  onUpdatePlan: (plan: HACCPPlan) => void;
}

const FlowchartEditor: React.FC<FlowchartEditorProps> = ({ plan, onUpdatePlan }) => {
  const [newStep, setNewStep] = useState('');

  const addStep = () => {
    if (!newStep) return;
    const step: FlowStep = {
      id: `step-${Date.now()}`,
      order: plan.flowSteps.length + 1,
      name: newStep,
      description: ''
    };
    onUpdatePlan({ ...plan, flowSteps: [...plan.flowSteps, step] });
    setNewStep('');
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const steps = [...plan.flowSteps];
    if (direction === 'up' && index > 0) {
      [steps[index], steps[index - 1]] = [steps[index - 1], steps[index]];
    } else if (direction === 'down' && index < steps.length - 1) {
      [steps[index], steps[index + 1]] = [steps[index + 1], steps[index]];
    }
    const reordered = steps.map((s, i) => ({ ...s, order: i + 1 }));
    onUpdatePlan({ ...plan, flowSteps: reordered });
  };

  const removeStep = (id: string) => {
    onUpdatePlan({ 
      ...plan, 
      flowSteps: plan.flowSteps.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })) 
    });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto">
        <h3 className="text-lg font-bold text-slate-800 mb-6 text-center">Production Process Flowchart</h3>
        
        <div className="flex gap-2 mb-8">
          <input 
            placeholder="Add new process step (e.g. Mixing)"
            className="flex-1 rounded-lg border-slate-200 text-sm"
            value={newStep}
            onChange={e => setNewStep(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && addStep()}
          />
          <button 
            onClick={addStep}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700"
          >
            Add
          </button>
        </div>

        <div className="space-y-4">
          {plan.flowSteps.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
              Start adding steps to visualize your process.
            </div>
          ) : (
            plan.flowSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="relative group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {step.order}
                    </div>
                    <span className="font-bold text-slate-800">{step.name}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => moveStep(index, 'up')}
                      className="p-1 hover:bg-slate-100 rounded"
                    >
                      ↑
                    </button>
                    <button 
                      onClick={() => moveStep(index, 'down')}
                      className="p-1 hover:bg-slate-100 rounded"
                    >
                      ↓
                    </button>
                    <button 
                      onClick={() => removeStep(step.id)}
                      className="p-1 text-red-400 hover:bg-red-50 rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
                {index < plan.flowSteps.length - 1 && (
                  <div className="flex justify-center my-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="m12 19 7-7-7-7"/><path d="M5 12h14"/></svg>
                  </div>
                )}
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowchartEditor;
