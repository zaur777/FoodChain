
import React, { useState, useMemo } from 'react';
import { HACCPPlan, Material } from '../types';
import { ICONS } from '../constants';
import { translations } from '../translations';

interface MaterialsManagementProps {
  plan: HACCPPlan;
  onUpdatePlan: (plan: HACCPPlan) => void;
}

const MaterialsManagement: React.FC<MaterialsManagementProps> = ({ plan, onUpdatePlan }) => {
  const [activeView, setActiveView] = useState<'materials' | 'products'>('materials');
  const [searchTerm, setSearchTerm] = useState('');
  const [allergenStatus, setAllergenStatus] = useState<'all' | 'contains' | 'none'>('all');
  const [selectedSpecificAllergens, setSelectedSpecificAllergens] = useState<string[]>([]);
  
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({
    name: '', type: 'Ingredient', regulatoryDoc: '', storageConditions: '', expirationPeriod: '', allergens: []
  });

  const currentLang = (localStorage.getItem('app_lang') as any) || 'en';
  const t = translations[currentLang as 'en' | 'ru' | 'az'];

  // Extract unique allergens from existing materials for the filter list
  const availableAllergens = useMemo(() => {
    const all = plan.materials.flatMap(m => m.allergens);
    return Array.from(new Set(all)).sort();
  }, [plan.materials]);

  const addMaterial = () => {
    if (!newMaterial.name) return;
    const material: Material = {
      id: `mat-${Date.now()}`,
      name: newMaterial.name || '',
      type: newMaterial.type as any || 'Ingredient',
      regulatoryDoc: newMaterial.regulatoryDoc || '',
      storageConditions: newMaterial.storageConditions || '',
      expirationPeriod: newMaterial.expirationPeriod || '',
      allergens: newMaterial.allergens || []
    };
    onUpdatePlan({ ...plan, materials: [...plan.materials, material] });
    setNewMaterial({ name: '', type: 'Ingredient', regulatoryDoc: '', storageConditions: '', expirationPeriod: '', allergens: [] });
  };

  const removeMaterial = (id: string) => {
    onUpdatePlan({ ...plan, materials: plan.materials.filter(m => m.id !== id) });
  };

  const toggleSpecificAllergen = (allergen: string) => {
    setSelectedSpecificAllergens(prev => 
      prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen]
    );
  };

  const filteredMaterials = useMemo(() => {
    return plan.materials.filter(m => {
      // Name search
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      let matchesStatus = true;
      if (allergenStatus === 'contains') matchesStatus = m.allergens.length > 0;
      if (allergenStatus === 'none') matchesStatus = m.allergens.length === 0;

      // Specific allergens filter (OR logic: has any of the selected)
      let matchesSpecific = true;
      if (selectedSpecificAllergens.length > 0) {
        matchesSpecific = selectedSpecificAllergens.some(a => m.allergens.includes(a));
      }

      return matchesSearch && matchesStatus && matchesSpecific;
    });
  }, [plan.materials, searchTerm, allergenStatus, selectedSpecificAllergens]);

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-4">
        <button 
          onClick={() => setActiveView('materials')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'materials' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          Raw Materials & Additives
        </button>
        <button 
          onClick={() => setActiveView('products')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'products' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          Finished Products
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-800">
              {activeView === 'materials' ? 'Raw Materials, Additives & Packaging' : 'Product Specifications'}
            </h3>
            
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <ICONS.Search />
              </span>
              <input 
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64"
              />
            </div>
          </div>

          {activeView === 'materials' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.filterAllergens}:</span>
                <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                  <button 
                    onClick={() => setAllergenStatus('all')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${allergenStatus === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {t.showAll}
                  </button>
                  <button 
                    onClick={() => setAllergenStatus('none')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${allergenStatus === 'none' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {t.noAllergens}
                  </button>
                  <button 
                    onClick={() => setAllergenStatus('contains')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${allergenStatus === 'contains' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {t.containsAllergens}
                  </button>
                </div>
              </div>

              {availableAllergens.length > 0 && (
                <div className="flex items-start gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Specific:</span>
                  <div className="flex flex-wrap gap-2">
                    {availableAllergens.map(allergen => (
                      <label 
                        key={allergen} 
                        className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold cursor-pointer transition-all ${
                          selectedSpecificAllergens.includes(allergen)
                          ? 'bg-amber-100 border-amber-300 text-amber-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          className="hidden"
                          checked={selectedSpecificAllergens.includes(allergen)}
                          onChange={() => toggleSpecificAllergen(allergen)}
                        />
                        {allergen}
                      </label>
                    ))}
                    {selectedSpecificAllergens.length > 0 && (
                      <button 
                        onClick={() => setSelectedSpecificAllergens([])}
                        className="text-[10px] font-black text-red-500 uppercase ml-2 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {activeView === 'materials' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input 
                placeholder="Component Name"
                className="rounded-lg border-slate-200 text-sm"
                value={newMaterial.name}
                onChange={e => setNewMaterial({ ...newMaterial, name: e.target.value })}
              />
              <select 
                className="rounded-lg border-slate-200 text-sm"
                value={newMaterial.type}
                onChange={e => setNewMaterial({ ...newMaterial, type: e.target.value as any })}
              >
                <option value="Ingredient">Ingredient</option>
                <option value="Additive">Additive</option>
                <option value="Packaging">Packaging</option>
              </select>
              <input 
                placeholder="Regulatory Doc (e.g. ISO 22000)"
                className="rounded-lg border-slate-200 text-sm"
                value={newMaterial.regulatoryDoc}
                onChange={e => setNewMaterial({ ...newMaterial, regulatoryDoc: e.target.value })}
              />
              <input 
                placeholder="Storage Conditions"
                className="rounded-lg border-slate-200 text-sm"
                value={newMaterial.storageConditions}
                onChange={e => setNewMaterial({ ...newMaterial, storageConditions: e.target.value })}
              />
              <input 
                placeholder="Expiration Period"
                className="rounded-lg border-slate-200 text-sm"
                value={newMaterial.expirationPeriod}
                onChange={e => setNewMaterial({ ...newMaterial, expirationPeriod: e.target.value })}
              />
              <input 
                placeholder="Allergens (comma separated)"
                className="rounded-lg border-slate-200 text-sm"
                value={newMaterial.allergens?.join(', ')}
                onChange={e => setNewMaterial({ ...newMaterial, allergens: e.target.value ? e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') : [] })}
              />
            </div>
            <button 
              onClick={addMaterial}
              className="w-full bg-slate-800 text-white font-bold py-2 rounded-lg hover:bg-slate-900 transition-colors shadow-sm"
            >
              Register Component
            </button>

            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold uppercase text-[10px] tracking-widest">Name</th>
                    <th className="px-4 py-3 font-semibold uppercase text-[10px] tracking-widest">Type</th>
                    <th className="px-4 py-3 font-semibold uppercase text-[10px] tracking-widest">Storage</th>
                    <th className="px-4 py-3 font-semibold text-center uppercase text-[10px] tracking-widest">Allergens</th>
                    <th className="px-4 py-3 font-semibold text-right uppercase text-[10px] tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredMaterials.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-400 italic">
                        <div className="flex flex-col items-center gap-2">
                          <ICONS.Search />
                          No components match the selected filters.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900">{m.name}</td>
                        <td className="px-4 py-3">
                          <span className="bg-slate-100 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{m.type}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{m.storageConditions}</td>
                        <td className="px-4 py-3 text-center">
                          {m.allergens.length > 0 ? (
                            <div className="flex flex-wrap gap-1 justify-center">
                              {m.allergens.map(a => <span key={a} className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded font-bold border border-amber-200">{a}</span>)}
                            </div>
                          ) : (
                            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-tighter">Safe</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => removeMaterial(m.id)} className="text-slate-300 hover:text-red-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'products' && (
          <div className="space-y-6">
            <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
               <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-sm">
                 <ICONS.Clipboard />
               </div>
               <h4 className="font-bold text-slate-800 mb-2">Product Specifications</h4>
               <p className="text-slate-500 text-sm max-w-md mx-auto italic">Specifications for finished products are automatically derived from the materials used in your active HACCP process flowchart.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialsManagement;
