
import React, { useState, useRef } from 'react';
import { Language, EDocument, DocType, Attachment } from '../types';
import { translations } from '../translations';
import { ICONS } from '../constants';

interface EDocumentationProps {
  lang: Language;
  companyId: string;
}

const EDocumentation: React.FC<EDocumentationProps> = ({ lang, companyId }) => {
  const t = translations[lang];
  const [activeCategory, setActiveCategory] = useState<DocType>('Hygiene');
  const [documents, setDocuments] = useState<EDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newDoc, setNewDoc] = useState<Partial<EDocument>>({
    type: 'Hygiene',
    title: '',
    description: '',
    providedBy: '',
    inputtedBy: '',
    attachments: [],
    metadata: {}
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    fetchDocuments();
  }, [companyId, activeCategory]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/documents?companyId=${companyId}&type=${activeCategory}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    } finally {
      setIsLoading(false);
    }
  };

  const categories: { type: DocType; label: string; icon: React.ReactNode; description: string }[] = [
    { type: 'Hygiene', label: 'Hygiene Log', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.046 3 5.5L12 21Z"/></svg>, description: 'Employee health status and readiness to work.' },
    { type: 'Refrigeration', label: 'Refrigeration Temp', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>, description: 'Temperature monitoring for fridges and freezers.' },
    { type: 'Storage', label: 'Storage Conditions', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>, description: 'Warehouse temperature and humidity logs.' },
    { type: 'FryingOil', label: 'Frying Oil Log', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7"/></svg>, description: 'Oil replacement dates and quantities.' },
    { type: 'ProductInspection', label: 'Product Inspection', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>, description: 'Quality assessment of finished dishes.' },
    { type: 'Sanitization', label: 'Sanitization Log', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.9-9.9c1-1 2.5-1 3.4 0l4.3 4.3c1 1 1 2.5 0 3.4l-9.9 9.9c-1 1-2.5 1-3.4 0Z"/><path d="M19 21h-7"/><path d="m14 11 5-5"/></svg>, description: 'Cleaning and disinfection schedules.' },
    { type: 'PestControl', label: 'Pest Control Log', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>, description: 'Disinfection, disinsection, and deratization.' },
    { type: 'RawMaterial', label: 'Incoming Materials', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>, description: 'Control of incoming raw materials.' },
    { type: 'Equipment', label: 'Equipment Operation', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>, description: 'Operational checks and maintenance.' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const attachment: Attachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type,
          data: reader.result as string
        };
        setNewDoc(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), attachment]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveDoc = async () => {
    if (!newDoc.title || !newDoc.providedBy || !newDoc.inputtedBy) return;

    const doc: EDocument = {
      id: `doc-${Date.now()}`,
      companyId,
      type: activeCategory,
      title: newDoc.title,
      description: newDoc.description || '',
      timestamp: newDoc.timestamp || new Date().toISOString(),
      providedBy: newDoc.providedBy,
      inputtedBy: newDoc.inputtedBy,
      attachments: newDoc.attachments || [],
      metadata: newDoc.metadata || {}
    };

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, document: doc })
      });

      if (response.ok) {
        setDocuments(prev => [doc, ...prev]);
        setIsAdding(false);
        setNewDoc({
          type: activeCategory,
          title: '',
          description: '',
          providedBy: '',
          inputtedBy: '',
          attachments: [],
          metadata: {}
        });
      }
    } catch (err) {
      console.error("Failed to save document", err);
    }
  };

  const filteredDocs = documents.filter(d => d.type === activeCategory);

  const renderMetadataInputs = () => {
    switch (activeCategory) {
      case 'Refrigeration':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={newDoc.metadata?.temperature || ''}
                onChange={e => setNewDoc({ ...newDoc, metadata: { ...newDoc.metadata, temperature: e.target.value } })}
                className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
                placeholder="e.g. 4.2"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipment ID</label>
              <input
                type="text"
                value={newDoc.metadata?.equipmentId || ''}
                onChange={e => setNewDoc({ ...newDoc, metadata: { ...newDoc.metadata, equipmentId: e.target.value } })}
                className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
                placeholder="e.g. FRIDGE-01"
              />
            </div>
          </div>
        );
      case 'Storage':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={newDoc.metadata?.temperature || ''}
                onChange={e => setNewDoc({ ...newDoc, metadata: { ...newDoc.metadata, temperature: e.target.value } })}
                className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Humidity (%)</label>
              <input
                type="number"
                value={newDoc.metadata?.humidity || ''}
                onChange={e => setNewDoc({ ...newDoc, metadata: { ...newDoc.metadata, humidity: e.target.value } })}
                className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
              />
            </div>
          </div>
        );
      case 'FryingOil':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Oil Replaced (Liters)</label>
              <input
                type="number"
                value={newDoc.metadata?.oilQuantity || ''}
                onChange={e => setNewDoc({ ...newDoc, metadata: { ...newDoc.metadata, oilQuantity: e.target.value } })}
                className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TPM Value (%)</label>
              <input
                type="number"
                step="0.1"
                value={newDoc.metadata?.tpmValue || ''}
                onChange={e => setNewDoc({ ...newDoc, metadata: { ...newDoc.metadata, tpmValue: e.target.value } })}
                className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
              />
            </div>
          </div>
        );
      case 'Hygiene':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <input
                type="checkbox"
                id="noSymptoms"
                checked={newDoc.metadata?.noSymptoms || false}
                onChange={e => setNewDoc({ ...newDoc, metadata: { ...newDoc.metadata, noSymptoms: e.target.checked } })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="noSymptoms" className="text-xs font-bold text-slate-700">No Symptoms / Lesions</label>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <input
                type="checkbox"
                id="readyToWork"
                checked={newDoc.metadata?.readyToWork || false}
                onChange={e => setNewDoc({ ...newDoc, metadata: { ...newDoc.metadata, readyToWork: e.target.checked } })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="readyToWork" className="text-xs font-bold text-slate-700">Ready to Work</label>
            </div>
          </div>
        );
      case 'ProductInspection':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quality Score (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newDoc.metadata?.qualityScore || ''}
                onChange={e => setNewDoc({ ...newDoc, metadata: { ...newDoc.metadata, qualityScore: e.target.value } })}
                className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={newDoc.metadata?.internalTemp || ''}
                onChange={e => setNewDoc({ ...newDoc, metadata: { ...newDoc.metadata, internalTemp: e.target.value } })}
                className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
              />
            </div>
          </div>
        );
      case 'Sanitization':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sanitizer Used</label>
              <input
                type="text"
                value={newDoc.metadata?.sanitizer || ''}
                onChange={e => setNewDoc({ ...newDoc, metadata: { ...newDoc.metadata, sanitizer: e.target.value } })}
                className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
                placeholder="e.g. Quat-10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Concentration (ppm)</label>
              <input
                type="number"
                value={newDoc.metadata?.concentration || ''}
                onChange={e => setNewDoc({ ...newDoc, metadata: { ...newDoc.metadata, concentration: e.target.value } })}
                className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
              />
            </div>
          </div>
        );
      case 'PestControl':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity Detected</label>
              <select
                value={newDoc.metadata?.activity || 'None'}
                onChange={e => setNewDoc({ ...newDoc, metadata: { ...newDoc.metadata, activity: e.target.value } })}
                className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
              >
                <option value="None">None</option>
                <option value="Insects">Insects</option>
                <option value="Rodents">Rodents</option>
                <option value="Birds">Birds</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Taken</label>
              <input
                type="text"
                value={newDoc.metadata?.actionTaken || ''}
                onChange={e => setNewDoc({ ...newDoc, metadata: { ...newDoc.metadata, actionTaken: e.target.value } })}
                className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
                placeholder="e.g. Traps reset"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Categories */}
        <div className="w-full md:w-64 space-y-2">
          {categories.map(cat => (
            <button
              key={cat.type}
              onClick={() => setActiveCategory(cat.type)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeCategory === cat.type
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {categories.find(c => c.type === activeCategory)?.label}
                </h3>
                <p className="text-xs text-slate-400 font-medium">Digital logs and compliance documentation</p>
              </div>
              <button
                onClick={() => setIsAdding(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <ICONS.Plus /> Add New Log
              </button>
            </div>

            <div className="divide-y divide-slate-50">
              {isLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-sm text-slate-400">Loading documents...</p>
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <ICONS.Clipboard />
                  </div>
                  <p className="text-sm text-slate-400 font-medium italic">No logs found for this category.</p>
                </div>
              ) : (
                filteredDocs.map(doc => (
                  <div key={doc.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800">{doc.title}</h4>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(doc.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{doc.description}</p>
                    
                    {Object.keys(doc.metadata).length > 0 && (
                      <div className="flex flex-wrap gap-4 mb-4 p-3 bg-slate-100/50 rounded-xl border border-slate-100">
                        {Object.entries(doc.metadata).map(([key, val]) => (
                          <div key={key} className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{key}</span>
                            <span className="text-xs font-bold text-slate-700">{val}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600">
                            {doc.providedBy.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Provided By</span>
                            <span className="text-xs font-bold text-slate-500">{doc.providedBy}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600">
                            {doc.inputtedBy.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Inputted By</span>
                            <span className="text-xs font-bold text-slate-500">{doc.inputtedBy}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {doc.attachments.map(att => (
                          <div key={att.id} className="group relative">
                            {att.type.startsWith('image/') ? (
                              <img src={att.data} alt={att.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                              </div>
                            )}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[8px] px-2 py-1 rounded whitespace-nowrap">
                              {att.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">New {activeCategory} Log</h3>
                <p className="text-indigo-100 text-xs mt-1">Record compliance data and attach evidence.</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="text-white/80 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Log Title</label>
                  <input
                    type="text"
                    value={newDoc.title}
                    onChange={e => setNewDoc({ ...newDoc, title: e.target.value })}
                    className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
                    placeholder="e.g. Morning Fridge Check"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provided By (Performed By)</label>
                  <input
                    type="text"
                    value={newDoc.providedBy}
                    onChange={e => setNewDoc({ ...newDoc, providedBy: e.target.value })}
                    className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
                    placeholder="Staff Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inputted By (Data Entry)</label>
                  <input
                    type="text"
                    value={newDoc.inputtedBy}
                    onChange={e => setNewDoc({ ...newDoc, inputtedBy: e.target.value })}
                    className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
                    placeholder="Your Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</label>
                  <input
                    type="datetime-local"
                    defaultValue={new Date().toISOString().slice(0, 16)}
                    onChange={e => setNewDoc({ ...newDoc, timestamp: new Date(e.target.value).toISOString() })}
                    className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
                  />
                </div>
              </div>

              {renderMetadataInputs()}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description / Observations</label>
                <textarea
                  value={newDoc.description}
                  onChange={e => setNewDoc({ ...newDoc, description: e.target.value })}
                  className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500 h-24"
                  placeholder="Details about the check..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attachments (Photos/Docs)</label>
                <div className="flex flex-wrap gap-3">
                  {newDoc.attachments?.map(att => (
                    <div key={att.id} className="relative w-16 h-16 group">
                      {att.type.startsWith('image/') ? (
                        <img src={att.data} alt={att.name} className="w-full h-full rounded-xl object-cover border border-slate-200" />
                      ) : (
                        <div className="w-full h-full rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                      )}
                      <button
                        onClick={() => setNewDoc(prev => ({ ...prev, attachments: prev.attachments?.filter(a => a.id !== att.id) }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-all"
                  >
                    <ICONS.Plus />
                    <span className="text-[8px] font-black uppercase mt-1">Upload</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDoc}
                  disabled={!newDoc.title || !newDoc.operator}
                  className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EDocumentation;
