
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { HACCPPlan, HazardType, Severity, HazardAnalysis, CriticalControlPoint, Material } from '../types';
import { ICONS } from '../constants';
import { analyzeHazard, suggestCcpDetails, suggestVerificationProcedures, suggestMaterialsForHazard, validateCriticalLimit } from '../geminiService';
import { translations } from '../translations';

const getSeverityColor = (severity: Severity) => {
  switch (severity) {
    case Severity.CRITICAL: return 'text-red-600';
    case Severity.HIGH: return 'text-amber-600';
    case Severity.MEDIUM: return 'text-indigo-600';
    default: return 'text-slate-600';
  }
};

const TabButton = ({ active, children, onClick }: { active: boolean; children?: React.ReactNode; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
      active 
      ? 'bg-white text-indigo-600 shadow-sm' 
      : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    {children}
  </button>
);

const Field = ({ label, value, onChange, placeholder, type = 'textarea', helperText, className = "", actionButton }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: 'input' | 'textarea'; helperText?: string; className?: string, actionButton?: React.ReactNode }) => {
  const isDetailedField = label.toLowerCase().includes('verification') || 
                          label.toLowerCase().includes('verifikasiya') || 
                          label.toLowerCase().includes('верификации') ||
                          label.toLowerCase().includes('records') ||
                          label.toLowerCase().includes('qeydiyyat') ||
                          label.toLowerCase().includes('записей') ||
                          label.toLowerCase().includes('validation') ||
                          label.toLowerCase().includes('validasiya') ||
                          label.toLowerCase().includes('валидации');

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2">
          {label}
          {actionButton}
        </span>
        {helperText && <span className="normal-case font-black text-indigo-500 italic bg-indigo-50 px-2 py-0.5 rounded-full text-[9px]">{helperText}</span>}
      </label>
      {type === 'textarea' ? (
        <textarea 
          className={`w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/30 transition-all ${
            isDetailedField ? 'min-h-[220px]' : 'min-h-[80px]'
          }`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input 
          className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/30"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};

// Moved ReviewItem above PlanEditor to fix scope errors
const ReviewItem = ({ label, value, className = "" }: { label: string; value: string; className?: string }) => (
  <div className={`flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100 ${className}`}>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <p className="text-sm text-slate-700 font-medium leading-relaxed">{value}</p>
  </div>
);

// Moved QuestionRow above PlanEditor to fix scope errors
const QuestionRow = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-0">
    <span className="text-slate-600 font-medium">{label}</span>
    <div className="flex bg-white rounded-lg border border-slate-200 p-0.5 shadow-sm">
      <button 
        onClick={() => onChange(true)}
        className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${value ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
      >
        YES
      </button>
      <button 
        onClick={() => onChange(false)}
        className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${!value ? 'bg-slate-400 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
      >
        NO
      </button>
    </div>
  </div>
);

const MaterialMultiSelect = ({ label, materials, selectedIds, onChange, helperText, className = "" }: { label: string; materials: Material[]; selectedIds: string[]; onChange: (ids: string[]) => void; helperText?: string; className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMaterial = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(mid => mid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  }, [materials, search]);

  const selectedCount = selectedIds.length;
  const summaryText = selectedCount > 0 
    ? `${selectedCount} item${selectedCount > 1 ? 's' : ''} linked` 
    : "Search & link materials...";

  return (
    <div className={`flex flex-col relative ${className}`} ref={containerRef}>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
        {label}
        {helperText && <span className="normal-case font-black text-indigo-500 italic bg-indigo-50 px-2 py-0.5 rounded-full text-[9px]">{helperText}</span>}
      </label>
      
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50/30 border border-slate-200 rounded-lg p-3 text-sm text-left flex items-center justify-between hover:border-indigo-300 transition-colors shadow-sm"
      >
        <span className={selectedCount > 0 ? 'text-slate-900 font-bold' : 'text-slate-400'}>{summaryText}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-2 max-h-72 overflow-hidden flex flex-col">
          <div className="relative mb-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input 
              autoFocus
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border-slate-200 text-xs focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
              placeholder="Filter materials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto space-y-1 flex-1">
            {filteredMaterials.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic p-4 text-center">No materials found in registry.</p>
            ) : (
              filteredMaterials.map(m => {
                const isSelected = selectedIds.includes(m.id);
                return (
                  <label 
                    key={m.id} 
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                      checked={isSelected}
                      onChange={() => toggleMaterial(m.id)}
                    />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">{m.name}</span>
                        {m.allergens.length > 0 && <span className="text-[8px] bg-amber-100 text-amber-700 px-1 rounded font-black">ALLERGEN</span>}
                      </div>
                      <span className="text-[9px] text-slate-400 uppercase font-black">{m.type}</span>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}

      {selectedCount > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {materials.filter(m => selectedIds.includes(m.id)).map(m => (
            <span key={m.id} className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-indigo-100 shadow-sm group">
              {m.name}
              <button 
                onClick={() => toggleMaterial(m.id)} 
                className="text-indigo-300 hover:text-red-500 transition-colors"
                title="Remove link"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

interface PlanEditorProps {
  plans: HACCPPlan[];
  selectedPlanId: string | null;
  onSelectPlan: (id: string | null) => void;
  onUpdatePlan: (plan: HACCPPlan) => void;
}

const PlanEditor: React.FC<PlanEditorProps> = ({ plans, selectedPlanId, onUpdatePlan }) => {
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFlowStepId, setSelectedFlowStepId] = useState<string>('');
  const [hazardFilter, setHazardFilter] = useState<HazardType | 'All'>('All');
  const [expandedMaterialLinks, setExpandedMaterialLinks] = useState<Set<string>>(new Set());
  const [isSuggestingMaterials, setIsSuggestingMaterials] = useState<string | null>(null);
  
  // Modal states for AI feedback
  const [verificationModal, setVerificationModal] = useState<{ isOpen: boolean; ccpId: string; suggestion: string; loading: boolean }>({
    isOpen: false,
    ccpId: '',
    suggestion: '',
    loading: false
  });

  const [validationAiModal, setValidationAiModal] = useState<{ isOpen: boolean; ccpId: string; suggestion: string; loading: boolean }>({
    isOpen: false,
    ccpId: '',
    suggestion: '',
    loading: false
  });

  const [magicFillModal, setMagicFillModal] = useState<{ isOpen: boolean; ccpId: string; data: any; loading: boolean }>({
    isOpen: false,
    ccpId: '',
    data: null,
    loading: false
  });

  const [validationModal, setValidationModal] = useState<{ isOpen: boolean; ccpId: string; result: any; loading: boolean }>({
    isOpen: false,
    ccpId: '',
    result: null,
    loading: false
  });

  const currentLang = (localStorage.getItem('app_lang') as any) || 'en';
  const t = translations[currentLang as 'en' | 'ru' | 'az'];

  const currentPlan = plans.find(p => p.id === selectedPlanId);

  const filteredHazards = useMemo(() => {
    if (!currentPlan) return [];
    return currentPlan.hazards.filter(h => {
      const typeMatch = hazardFilter === 'All' || h.type === hazardFilter;
      const stepMatch = !selectedFlowStepId || h.flowStepId === selectedFlowStepId;
      return typeMatch && stepMatch;
    });
  }, [currentPlan, hazardFilter, selectedFlowStepId]);

  if (!currentPlan) return null;

  const toggleMaterialLinker = (hazardId: string) => {
    setExpandedMaterialLinks(prev => {
      const next = new Set(prev);
      if (next.has(hazardId)) next.delete(hazardId);
      else next.add(hazardId);
      return next;
    });
  };

  const handleSuggestMaterials = async (hazardId: string) => {
    const hazard = currentPlan.hazards.find(h => h.id === hazardId);
    if (!hazard) return;

    setIsSuggestingMaterials(hazardId);
    try {
      const suggestedIds = await suggestMaterialsForHazard(hazard.potentialHazard, currentPlan.materials);
      if (suggestedIds && suggestedIds.length > 0) {
        // Merge suggested IDs with existing ones, ensuring uniqueness
        const existingIds = hazard.associatedMaterialIds || [];
        const mergedIds = Array.from(new Set([...existingIds, ...suggestedIds]));
        updateHazardMaterials(hazardId, mergedIds);
      } else {
        alert("AI could not find matching materials in your registry.");
      }
    } catch (e) {
      console.error("Material suggestion failed", e);
    } finally {
      setIsSuggestingMaterials(null);
    }
  };

  const handleAiAnalysis = async () => {
    if (!selectedFlowStepId) return;
    const step = currentPlan.flowSteps.find(s => s.id === selectedFlowStepId);
    if (!step) return;

    setIsAnalyzing(true);
    try {
      const results = await analyzeHazard(step.name, currentPlan.name);
      const newHazards = results.map((h: any) => {
        let typeValue = HazardType.BIOLOGICAL;
        const aiType = h.type?.toUpperCase();
        if (aiType === 'CHEMICAL') typeValue = HazardType.CHEMICAL;
        if (aiType === 'PHYSICAL') typeValue = HazardType.PHYSICAL;
        if (aiType === 'RADIOLOGICAL') typeValue = HazardType.RADIOLOGICAL;

        return {
          ...h,
          type: typeValue,
          id: `h-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          flowStepId: selectedFlowStepId,
          decisionTree: { q1: true, q2: false, q3: false, q4: false },
          isCCP: false,
          associatedMaterialIds: []
        };
      });
      
      onUpdatePlan({ ...currentPlan, hazards: [...currentPlan.hazards, ...newHazards] });
    } catch (e) {
      alert("AI Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCcpAiSuggest = async (ccpId: string) => {
    const ccp = currentPlan.ccps.find(c => c.id === ccpId);
    const hazard = currentPlan.hazards.find(h => h.id === ccp?.hazardId);
    const step = currentPlan.flowSteps.find(s => s.id === hazard?.flowStepId);

    if (!ccp || !hazard || !step) return;

    setMagicFillModal({ isOpen: true, ccpId, data: null, loading: true });
    
    try {
      const suggestions = await suggestCcpDetails(step.name, hazard.potentialHazard);
      if (suggestions) {
        setMagicFillModal(prev => ({ ...prev, data: suggestions, loading: false }));
      }
    } catch (e) {
      console.error("Failed to get AI suggestions", e);
      alert("Failed to get AI suggestions. Please try again.");
      setMagicFillModal({ isOpen: false, ccpId: '', data: null, loading: false });
    }
  };

  const approveMagicFill = () => {
    const { ccpId, data } = magicFillModal;
    if (!data) return;

    const updatedCcps = currentPlan.ccps.map(c => 
      c.id === ccpId ? { 
        ...c, 
        criticalLimits: data.criticalLimits || c.criticalLimits,
        monitoringProcedures: data.monitoringProcedures || c.monitoringProcedures,
        monitoringFrequency: data.monitoringFrequency || c.monitoringFrequency,
        monitoringResponsibility: data.monitoringResponsibility || c.monitoringResponsibility,
        correctiveActions: data.correctiveActions || c.correctiveActions,
        verificationProcedures: data.verificationProcedures || c.verificationProcedures,
        validation: data.validation || c.validation,
        validationProcedures: data.validationProcedures || c.validationProcedures,
        records: data.records || c.records
      } : c
    );
    onUpdatePlan({ ...currentPlan, ccps: updatedCcps });
    setMagicFillModal({ isOpen: false, ccpId: '', data: null, loading: false });
  };

  const handleValidateScientificLimit = async (ccpId: string) => {
    const ccp = currentPlan.ccps.find(c => c.id === ccpId);
    const hazard = currentPlan.hazards.find(h => h.id === ccp?.hazardId);
    const step = currentPlan.flowSteps.find(s => s.id === hazard?.flowStepId);

    if (!ccp || !hazard || !step || !ccp.criticalLimits) {
       alert("Please enter a critical limit first.");
       return;
    }

    setValidationModal({ isOpen: true, ccpId, result: null, loading: true });
    
    try {
      const result = await validateCriticalLimit(ccp.criticalLimits, hazard.potentialHazard, step.name);
      if (result) {
        setValidationModal(prev => ({ ...prev, result, loading: false }));
      }
    } catch (e) {
      alert("Failed to validate limit.");
      setValidationModal({ isOpen: false, ccpId: '', result: null, loading: false });
    }
  };

  const applyValidatedLimit = () => {
    const { ccpId, result } = validationModal;
    if (!result?.suggestedLimit) return;

    const updatedCcps = currentPlan.ccps.map(c => 
      c.id === ccpId ? { ...c, criticalLimits: result.suggestedLimit, validationProcedures: result.scientificBasis } : c
    );
    onUpdatePlan({ ...currentPlan, ccps: updatedCcps });
    setValidationModal({ isOpen: false, ccpId: '', result: null, loading: false });
  };

  const handleSuggestVerification = async (ccpId: string) => {
    const ccp = currentPlan.ccps.find(c => c.id === ccpId);
    const hazard = currentPlan.hazards.find(h => h.id === ccp?.hazardId);
    if (!ccp || !hazard) return;

    setVerificationModal({ isOpen: true, ccpId, suggestion: '', loading: true });
    
    try {
      const result = await suggestVerificationProcedures(hazard.potentialHazard, ccp.criticalLimits);
      if (result) {
        setVerificationModal(prev => ({ ...prev, suggestion: result.verificationProcedures, loading: false }));
      }
    } catch (e) {
      alert("Failed to fetch verification suggestions.");
      setVerificationModal({ isOpen: false, ccpId: '', suggestion: '', loading: false });
    }
  };

  const handleSuggestValidationAI = async (ccpId: string) => {
    const ccp = currentPlan.ccps.find(c => c.id === ccpId);
    const hazard = currentPlan.hazards.find(h => h.id === ccp?.hazardId);
    if (!ccp || !hazard) return;

    setValidationAiModal({ isOpen: true, ccpId, suggestion: '', loading: true });
    
    try {
      const result = await suggestVerificationProcedures(hazard.potentialHazard, ccp.criticalLimits);
      if (result) {
        setValidationAiModal(prev => ({ ...prev, suggestion: result.verificationProcedures, loading: false }));
      }
    } catch (e) {
      alert("Failed to fetch validation suggestions.");
      setValidationAiModal({ isOpen: false, ccpId: '', suggestion: '', loading: false });
    }
  };

  const approveVerification = () => {
    const { ccpId, suggestion } = verificationModal;
    const updatedCcps = currentPlan.ccps.map(c => 
      c.id === ccpId ? { ...c, verificationProcedures: suggestion } : c
    );
    onUpdatePlan({ ...currentPlan, ccps: updatedCcps });
    setVerificationModal({ isOpen: false, ccpId: '', suggestion: '', loading: false });
  };

  const approveValidationAI = () => {
    const { ccpId, suggestion } = validationAiModal;
    const updatedCcps = currentPlan.ccps.map(c => 
      c.id === ccpId ? { ...c, validationProcedures: suggestion } : c
    );
    onUpdatePlan({ ...currentPlan, ccps: updatedCcps });
    setValidationAiModal({ isOpen: false, ccpId: '', suggestion: '', loading: false });
  };

  const handleDeleteCcp = (ccpId: string) => {
    if (!window.confirm("Are you sure you want to remove this Critical Control Point? This will also update the hazard analysis decision tree.")) return;
    
    const ccp = currentPlan.ccps.find(c => c.id === ccpId);
    if (!ccp) return;

    const hazards = currentPlan.hazards.map(h => {
      if (h.id === ccp.hazardId) {
        return {
          ...h,
          isCCP: false,
          decisionTree: { q1: true, q2: false, q3: false, q4: false },
          associatedMaterialIds: h.associatedMaterialIds || []
        };
      }
      return h;
    });

    const ccps = currentPlan.ccps.filter(c => c.id !== ccpId);
    onUpdatePlan({ ...currentPlan, hazards, ccps });
  };

  const updateDecision = (hazardId: string, q: 'q1' | 'q2' | 'q3' | 'q4', val: boolean) => {
    const hazards = currentPlan.hazards.map(h => {
      if (h.id === hazardId) {
        const newTree = { ...h.decisionTree, [q]: val };
        let isCCP = false;
        if (newTree.q1) {
          if (newTree.q2) isCCP = true;
          else if (newTree.q3 && !newTree.q4) isCCP = true;
        }

        return { ...h, decisionTree: newTree, isCCP };
      }
      return h;
    });

    const activeCCPs = hazards.filter(h => h.isCCP);
    const existingCCPIds = currentPlan.ccps.map(c => c.hazardId);
    
    let newCCPs = [...currentPlan.ccps].filter(c => activeCCPs.find(h => h.id === c.hazardId));
    
    activeCCPs.forEach(h => {
      if (!existingCCPIds.includes(h.id)) {
        newCCPs.push({
          id: `ccp-${Date.now()}-${h.id}`,
          hazardId: h.id,
          criticalLimits: '',
          monitoringProcedures: '',
          monitoringFrequency: '',
          monitoringResponsibility: '',
          correctiveActions: '',
          verificationProcedures: '',
          validation: '',
          validationProcedures: '',
          records: '',
          associatedMaterialIds: h.associatedMaterialIds || []
        });
      }
    });

    onUpdatePlan({ ...currentPlan, hazards, ccps: newCCPs });
  };

  const updateHazardMaterials = (hazardId: string, materialIds: string[]) => {
    const hazards = currentPlan.hazards.map(h => 
      h.id === hazardId ? { ...h, associatedMaterialIds: materialIds } : h
    );
    
    const ccps = currentPlan.ccps.map(c => 
      c.hazardId === hazardId ? { ...c, associatedMaterialIds: materialIds } : c
    );

    onUpdatePlan({ ...currentPlan, hazards, ccps });
  };

  const getCount = (type: HazardType | 'All') => {
    const baseList = selectedFlowStepId 
      ? currentPlan.hazards.filter(h => h.flowStepId === selectedFlowStepId)
      : currentPlan.hazards;
      
    if (type === 'All') return baseList.length;
    return baseList.filter(h => h.type === type).length;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[600px]">
      <div className="border-b border-slate-200 p-4 md:px-6 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
            <ICONS.Search />
          </div>
          <h3 className="font-bold text-slate-800">Safety Analysis Studio</h3>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <TabButton active={activeStep === 1} onClick={() => setActiveStep(1)}>1. Hazard Analysis</TabButton>
          <TabButton active={activeStep === 2} onClick={() => setActiveStep(2)}>2. CCP Plan</TabButton>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex-[2]">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Process Step Focus</label>
                <select 
                  className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={selectedFlowStepId}
                  onChange={e => setSelectedFlowStepId(e.target.value)}
                >
                  <option value="">All Process Steps</option>
                  {currentPlan.flowSteps.map(s => <option key={s.id} value={s.id}>{s.order}. {s.name}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Hazard Category</label>
                <select 
                  className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={hazardFilter}
                  onChange={e => setHazardFilter(e.target.value as any)}
                >
                  <option value="All">All Categories ({getCount('All')})</option>
                  {Object.values(HazardType).map(type => (
                    <option key={type} value={type}>{type} ({getCount(type)})</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  disabled={isAnalyzing || !selectedFlowStepId}
                  onClick={handleAiAnalysis}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 transition-all shadow-sm font-bold text-sm h-[38px] w-full md:w-auto justify-center"
                >
                  <ICONS.Sparkles />
                  {isAnalyzing ? "Analyzing..." : "AI Auto-Identify"}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredHazards.length === 0 ? (
                <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="mb-4 flex justify-center text-slate-300">
                    <ICONS.Search />
                  </div>
                  <h4 className="font-bold text-slate-600 mb-1">No Hazards Found</h4>
                  <p className="text-xs max-w-xs mx-auto">
                    {currentPlan.hazards.length === 0 
                      ? "Use the AI Auto-Identify button above or add hazards manually for this process step."
                      : "Adjust your filters or step selection to see other hazards."
                    }
                  </p>
                  {(hazardFilter !== 'All' || selectedFlowStepId !== '') && (
                    <button 
                      onClick={() => { setHazardFilter('All'); setSelectedFlowStepId(''); }}
                      className="mt-4 text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              ) : (
                filteredHazards.map(hazard => {
                  const associatedMaterialsCount = hazard.associatedMaterialIds?.length || 0;
                  const isLinkerExpanded = expandedMaterialLinks.has(hazard.id);
                  const isSuggesting = isSuggestingMaterials === hazard.id;
                  
                  return (
                    <div key={hazard.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-indigo-200 transition-all bg-white">
                      <div className="bg-slate-50 p-4 flex justify-between items-center border-b border-slate-200">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-200/50 px-2 py-0.5 rounded">
                              STEP: {currentPlan.flowSteps.find(s => s.id === hazard.flowStepId)?.name || 'Unknown'}
                            </span>
                            <span className="text-slate-300">/</span>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                              {hazard.type}
                            </span>
                          </div>
                          <span className="font-bold text-slate-900 text-lg">{hazard.potentialHazard}</span>
                        </div>
                        <div className="flex gap-2">
                           <div className="flex flex-col items-end">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${getSeverityColor(hazard.severity)} border-current bg-white mb-1`}>
                                {hazard.severity} Severity
                              </span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${hazard.isCCP ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-100' : 'bg-slate-200 text-slate-600'}`}>
                                {hazard.isCCP ? 'Critical Control Point' : 'Control Point'}
                              </span>
                           </div>
                        </div>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                           <div>
                              <span className="font-black uppercase text-[10px] text-slate-400 block mb-2 tracking-widest">Scientific Justification</span>
                              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{hazard.justification}</p>
                           </div>
                           <div>
                              <span className="font-black uppercase text-[10px] text-slate-400 block mb-2 tracking-widest">Preventative Control Measure</span>
                              <p className="text-sm text-slate-700 leading-relaxed font-medium bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 italic">"{hazard.preventativeMeasures}"</p>
                           </div>
                           
                           <div className="pt-2 border-t border-slate-100 mt-4">
                              <div className="flex items-center justify-between mb-2">
                                 <button 
                                    onClick={() => toggleMaterialLinker(hazard.id)}
                                    className={`flex items-center gap-2 text-xs font-bold transition-all px-3 py-1.5 rounded-lg border ${
                                       isLinkerExpanded 
                                       ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                       : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                    }`}
                                 >
                                    <ICONS.Link />
                                    {associatedMaterialsCount > 0 ? `${associatedMaterialsCount} Materials Linked` : "Link Source Materials"}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isLinkerExpanded ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
                                 </button>
                                 
                                 {isLinkerExpanded && (
                                    <button 
                                       onClick={() => handleSuggestMaterials(hazard.id)}
                                       disabled={isSuggesting}
                                       className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase hover:text-indigo-800 disabled:opacity-50 transition-colors"
                                    >
                                       <ICONS.Sparkles />
                                       {isSuggesting ? "Analyzing..." : "AI Suggest"}
                                    </button>
                                 )}
                              </div>

                              {isLinkerExpanded && (
                                 <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-inner animate-in fade-in slide-in-from-top-2 duration-200">
                                    <MaterialMultiSelect 
                                       label="Material Registry Selector"
                                       materials={currentPlan.materials}
                                       selectedIds={hazard.associatedMaterialIds || []}
                                       onChange={ids => updateHazardMaterials(hazard.id, ids)}
                                       helperText="Select materials that contribute to this hazard"
                                    />
                                 </div>
                              )}

                              {!isLinkerExpanded && associatedMaterialsCount > 0 && (
                                 <div className="flex flex-wrap gap-1 mt-2">
                                    {currentPlan.materials.filter(m => hazard.associatedMaterialIds?.includes(m.id)).map(m => (
                                       <span key={m.id} className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                                          {m.name}
                                       </span>
                                    ))}
                                 </div>
                              )}
                           </div>
                        </div>
                        <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 space-y-3">
                          <p className="text-[11px] font-black text-slate-500 uppercase mb-4 flex items-center justify-between border-b border-slate-200 pb-2">
                            Decision Tree (Principle 2)
                            {hazard.isCCP && <span className="text-red-600 font-black animate-pulse">● CCP Identified</span>}
                          </p>
                          <QuestionRow label="Q1: Control measures exist for this hazard?" value={hazard.decisionTree.q1} onChange={v => updateDecision(hazard.id, 'q1', v)} />
                          <QuestionRow label="Q2: Is this step designed to eliminate/reduce it?" value={hazard.decisionTree.q2} onChange={v => updateDecision(hazard.id, 'q2', v)} />
                          <QuestionRow label="Q3: Could contamination occur in excess?" value={hazard.decisionTree.q3} onChange={v => updateDecision(hazard.id, 'q3', v)} />
                          <QuestionRow label="Q4: Will a subsequent step eliminate it?" value={hazard.decisionTree.q4} onChange={v => updateDecision(hazard.id, 'q4', v)} />
                          
                          <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200 text-[10px] text-slate-400 leading-tight">
                            <p><strong>Note:</strong> Principle 2 requires systematic evaluation. If Q2 is 'Yes' or if Q1 is 'Yes' AND Q3 is 'Yes' while Q4 is 'No', this is a CCP.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-8">
            {currentPlan.ccps.length === 0 ? (
              <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="mb-4 flex justify-center text-slate-300">
                  <ICONS.Clipboard />
                </div>
                <h4 className="font-bold text-slate-600 mb-1">No CCPs Defined</h4>
                <p className="text-xs max-w-xs mx-auto">Mark a hazard as a Critical Control Point (CCP) in Step 1 using the Decision Tree to define technical parameters here.</p>
                <button 
                  onClick={() => setActiveStep(1)}
                  className="mt-4 bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-all"
                >
                  Return to Hazard Analysis
                </button>
              </div>
            ) : (
              currentPlan.ccps.map(ccp => {
                const hazard = currentPlan.hazards.find(h => h.id === ccp.hazardId);
                const associatedMaterials = currentPlan.materials.filter(m => ccp.associatedMaterialIds?.includes(m.id));
                const hasAllergenicMaterials = associatedMaterials.some(m => m.allergens.length > 0);
                
                return (
                  <div key={ccp.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all bg-white hover:border-red-200">
                    <div className="bg-red-50 p-5 border-b border-red-100 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-lg shadow-red-200">
                          {currentPlan.ccps.indexOf(ccp) + 1}
                        </div>
                        <div>
                          <h4 className="font-black text-red-900 text-lg leading-tight uppercase tracking-tight">{hazard?.potentialHazard}</h4>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                               PROCESSS STEP: {currentPlan.flowSteps.find(s => s.id === hazard?.flowStepId)?.name || 'N/A'}
                             </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleCcpAiSuggest(ccp.id)}
                          className="bg-white text-indigo-600 px-4 py-2 rounded-xl border border-indigo-200 text-xs font-black flex items-center gap-2 transition-all shadow-sm active:scale-95 hover:bg-indigo-50 active:shadow-inner"
                          title="AI Magic Fill: Principle 3 to 7"
                        >
                          <ICONS.Sparkles />
                          {t.aiSuggest}
                        </button>
                        
                        <button 
                          onClick={() => handleDeleteCcp(ccp.id)}
                          className="bg-white text-red-600 p-2 rounded-xl border border-red-200 hover:bg-red-50 transition-all shadow-sm"
                          title="Delete Critical Control Point"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      <Field 
                        label={t.criticalLimits} 
                        value={ccp.criticalLimits} 
                        onChange={v => onUpdatePlan({...currentPlan, ccps: currentPlan.ccps.map(c => c.id === ccp.id ? {...c, criticalLimits: v} : c)})} 
                        placeholder="e.g. Temperature > 85.0°C for 30 seconds" 
                        helperText="Principle 3"
                        actionButton={
                           <button 
                              onClick={() => handleValidateScientificLimit(ccp.id)}
                              className="text-indigo-600 hover:text-indigo-800 transition-colors p-1 bg-indigo-50 rounded flex items-center gap-1"
                              title="Validate scientific robustness with AI"
                           >
                              <ICONS.Sparkles />
                              <span className="text-[8px] font-black uppercase">Validate Science</span>
                           </button>
                        }
                      />
                      <Field 
                        label={t.monitoringProc} 
                        value={ccp.monitoringProcedures} 
                        onChange={v => onUpdatePlan({...currentPlan, ccps: currentPlan.ccps.map(c => c.id === ccp.id ? {...c, monitoringProcedures: v} : c)})} 
                        placeholder="How to measure? (e.g. In-line digital probes)" 
                        helperText="Principle 4 (How)"
                      />
                      <Field 
                        label={t.monitoringFreq} 
                        value={ccp.monitoringFrequency} 
                        onChange={v => onUpdatePlan({...currentPlan, ccps: currentPlan.ccps.map(c => c.id === ccp.id ? {...c, monitoringFrequency: v} : c)})} 
                        placeholder="How often? (e.g. Continuous with 5 min logging)" 
                        helperText="Principle 4 (When)"
                      />
                      <Field 
                        label={t.monitoringResp} 
                        value={ccp.monitoringResponsibility} 
                        onChange={v => onUpdatePlan({...currentPlan, ccps: currentPlan.ccps.map(c => c.id === ccp.id ? {...c, monitoringResponsibility: v} : c)})} 
                        placeholder="Who checks? (e.g. Production Supervisor)" 
                        helperText="Principle 4 (Who)"
                      />
                      
                      <div className="md:col-span-1 space-y-2">
                        <MaterialMultiSelect 
                          label={t.associatedMaterials}
                          materials={currentPlan.materials}
                          selectedIds={ccp.associatedMaterialIds || []}
                          onChange={ids => onUpdatePlan({...currentPlan, ccps: currentPlan.ccps.map(c => c.id === ccp.id ? {...c, associatedMaterialIds: ids} : c)})}
                          helperText="Linkage to Material Registry"
                        />
                        {hasAllergenicMaterials && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg text-[10px] text-amber-700 font-bold">
                            <ICONS.Alert />
                            Notice: Linked materials contain allergens. Ensure cleaning validation.
                          </div>
                        )}
                      </div>

                      <Field 
                        label={t.correctiveActions} 
                        value={ccp.correctiveActions} 
                        onChange={v => onUpdatePlan({...currentPlan, ccps: currentPlan.ccps.map(c => c.id === ccp.id ? {...c, correctiveActions: v} : c)})} 
                        placeholder="If limit violated... (e.g. Hold product & re-process)" 
                        helperText="Principle 5"
                      />
                      
                      <Field 
                        label={`${t.verificationProc} (Principle 6)`} 
                        value={ccp.verificationProcedures} 
                        onChange={v => onUpdatePlan({...currentPlan, ccps: currentPlan.ccps.map(c => c.id === ccp.id ? {...c, verificationProcedures: v} : c)})} 
                        placeholder="Outline detailed verification activities (e.g. daily review of logs, weekly calibration)..." 
                        helperText="Verification Activities (Principle 6)"
                        className="md:col-span-2"
                        actionButton={
                          (!ccp.verificationProcedures || ccp.verificationProcedures.trim() === '') && (
                            <button 
                              onClick={() => handleSuggestVerification(ccp.id)}
                              className="text-indigo-600 hover:text-indigo-800 transition-colors p-1 bg-indigo-50 rounded"
                              title="Suggest verification procedures with AI"
                            >
                              <ICONS.Sparkles />
                            </button>
                          )
                        }
                      />

                      <Field 
                        label={`${t.validationProcedures} (Principle 6)`} 
                        value={ccp.validationProcedures} 
                        onChange={v => onUpdatePlan({...currentPlan, ccps: currentPlan.ccps.map(c => c.id === ccp.id ? {...c, validationProcedures: v} : c)})} 
                        placeholder="Provide scientific basis or reference study text (e.g. Pasteurization standards)..." 
                        helperText="Scientific Justification"
                        className="md:col-span-2"
                        actionButton={
                          <button 
                            onClick={() => handleSuggestValidationAI(ccp.id)}
                            className="text-indigo-600 hover:text-indigo-800 transition-colors p-1 bg-indigo-50 rounded"
                            title="Suggest validation procedures with AI"
                          >
                            <ICONS.Sparkles />
                          </button>
                        }
                      />

                      <Field 
                        label={t.validationEvidence} 
                        value={ccp.validation} 
                        onChange={v => onUpdatePlan({...currentPlan, ccps: currentPlan.ccps.map(c => c.id === ccp.id ? {...c, validation: v} : c)})} 
                        placeholder="Short summary of validation (e.g. Study Ref #123)" 
                        helperText="Evidence Summary"
                        className="md:col-span-1"
                      />
                      
                      <Field 
                        label={t.recordKeeping} 
                        value={ccp.records} 
                        onChange={v => onUpdatePlan({...currentPlan, ccps: currentPlan.ccps.map(c => c.id === ccp.id ? {...c, records: v} : c)})} 
                        placeholder="Daily logs, charts, digital databases..." 
                        helperText="Principle 7"
                        className="md:col-span-1"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Verification Suggestion Modal */}
      {verificationModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ICONS.Sparkles />
                  AI Verification Suggestion
                </h3>
                <p className="text-indigo-100 text-xs mt-1">Based on identified hazard and critical limits.</p>
              </div>
              <button 
                onClick={() => setVerificationModal({ ...verificationModal, isOpen: false })}
                className="hover:bg-indigo-500 p-2 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-8">
              {verificationModal.loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-medium italic">Gemini is drafting technical procedures...</p>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 min-h-[150px]">
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
                      {verificationModal.suggestion}
                    </p>
                  </div>
                  <div className="flex gap-4 justify-end">
                    <button 
                      onClick={() => setVerificationModal({ ...verificationModal, isOpen: false })}
                      className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all text-sm"
                    >
                      Discard
                    </button>
                    <button 
                      onClick={approveVerification}
                      className="px-8 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg active:scale-95 text-sm"
                    >
                      Approve & Apply
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Validation Suggestion Modal */}
      {validationAiModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ICONS.Sparkles />
                  AI Validation Procedure Suggestion
                </h3>
                <p className="text-indigo-100 text-xs mt-1">Drafting scientific justification basis.</p>
              </div>
              <button 
                onClick={() => setValidationAiModal({ ...validationAiModal, isOpen: false })}
                className="hover:bg-indigo-500 p-2 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-8">
              {validationAiModal.loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-medium italic">Gemini is drafting scientific validation procedures...</p>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 min-h-[150px]">
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
                      {validationAiModal.suggestion}
                    </p>
                  </div>
                  <div className="flex gap-4 justify-end">
                    <button 
                      onClick={() => setValidationAiModal({ ...validationAiModal, isOpen: false })}
                      className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all text-sm"
                    >
                      Discard
                    </button>
                    <button 
                      onClick={approveValidationAI}
                      className="px-8 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg active:scale-95 text-sm"
                    >
                      Approve & Apply
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scientific Validation Modal */}
      {validationModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className={`p-6 text-white flex justify-between items-center ${validationModal.loading ? 'bg-indigo-600' : (validationModal.result?.isValid ? 'bg-emerald-600' : 'bg-amber-600')}`}>
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ICONS.Sparkles />
                  Scientific Limit Validation
                </h3>
                <p className="text-white/80 text-xs mt-1">Audit-ready verification of your critical thresholds.</p>
              </div>
              <button 
                onClick={() => setValidationModal({ ...validationModal, isOpen: false })}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-8">
              {validationModal.loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-medium italic">Consulting food safety research databases...</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      {validationModal.result?.isValid ? (
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black uppercase">Scientifically Robust</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black uppercase">Improvement Recommended</span>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Assessment</span>
                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">{validationModal.result?.assessment}</p>
                      </div>
                      
                      {!validationModal.result?.isValid && (
                        <div>
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Suggested robust limit</span>
                          <p className="text-sm font-bold text-indigo-700 bg-indigo-50 p-3 rounded-lg border border-indigo-100 leading-relaxed italic">"{validationModal.result?.suggestedLimit}"</p>
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Scientific Basis / References</span>
                        <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 italic leading-relaxed">{validationModal.result?.scientificBasis}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => setValidationModal({ ...validationModal, isOpen: false })}
                      className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all text-sm"
                    >
                      Keep Original
                    </button>
                    {!validationModal.result?.isValid && (
                      <button 
                        onClick={applyValidatedLimit}
                        className="px-8 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg active:scale-95 text-sm"
                      >
                        Apply Recommendation
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Magic Fill Modal */}
      {magicFillModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ICONS.Sparkles />
                  Magic Fill: Principles 3-7
                </h3>
                <p className="text-indigo-100 text-xs mt-1">Review industry-standard suggestions for this Critical Control Point.</p>
              </div>
              <button 
                onClick={() => setMagicFillModal({ ...magicFillModal, isOpen: false })}
                className="hover:bg-indigo-500 p-2 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {magicFillModal.loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-bold italic animate-pulse">Consulting safety standards...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {magicFillModal.data && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ReviewItem label="Critical Limits" value={magicFillModal.data.criticalLimits} />
                        <ReviewItem label="Monitoring Procedure" value={magicFillModal.data.monitoringProcedures} />
                        <ReviewItem label="Monitoring Frequency" value={magicFillModal.data.monitoringFrequency} />
                        <ReviewItem label="Responsibility" value={magicFillModal.data.monitoringResponsibility} />
                        <ReviewItem label="Corrective Actions" value={magicFillModal.data.correctiveActions} className="md:col-span-2" />
                        <ReviewItem label="Verification" value={magicFillModal.data.verificationProcedures} className="md:col-span-2" />
                        <ReviewItem label="Validation" value={magicFillModal.data.validation} />
                        <ReviewItem label="Record Keeping" value={magicFillModal.data.records} />
                      </div>
                      <div className="flex gap-4 justify-end pt-6 border-t border-slate-100">
                        <button 
                          onClick={() => setMagicFillModal({ ...magicFillModal, isOpen: false })}
                          className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all text-sm"
                        >
                          Discard
                        </button>
                        <button 
                          onClick={approveMagicFill}
                          className="px-8 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg active:scale-95 text-sm"
                        >
                          Apply Suggestions
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanEditor;
