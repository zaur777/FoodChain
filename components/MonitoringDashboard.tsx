
import React, { useState, useEffect } from 'react';
import { HACCPPlan, MonitoringLog } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ICONS } from '../constants';

interface MonitoringDashboardProps {
  plans: HACCPPlan[];
}

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ plans }) => {
  const [selectedCCP, setSelectedCCP] = useState<string | null>(null);
  const [logs, setLogs] = useState<MonitoringLog[]>([]);

  // Find all CCPs across all plans
  const allCCPs = plans.flatMap(plan => 
    plan.ccps.map(ccp => ({
      ...ccp,
      planName: plan.name,
      hazard: plan.hazards.find(h => h.id === ccp.hazardId)
    }))
  );

  useEffect(() => {
    if (allCCPs.length > 0 && !selectedCCP) {
      setSelectedCCP(allCCPs[0].id);
    }
  }, [allCCPs]);

  // Generate mock data for the selected CCP
  useEffect(() => {
    if (!selectedCCP) return;
    
    const newLogs: MonitoringLog[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const time = new Date(now - i * 60000);
      const value = 86 + Math.random() * 4; // Mocking temperature around 86-90°C
      newLogs.push({
        id: `log-${i}`,
        ccpId: selectedCCP,
        timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: parseFloat(value.toFixed(1)),
        unit: '°C',
        operator: 'John Doe',
        status: value < 85.5 ? 'Warning' : 'Normal'
      });
    }
    setLogs(newLogs);
    
    const interval = setInterval(() => {
      setLogs(prev => {
        const lastValue = prev[prev.length - 1].value;
        const newValue = lastValue + (Math.random() - 0.5) * 2;
        const newLog: MonitoringLog = {
          id: `log-${Date.now()}`,
          ccpId: selectedCCP,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: parseFloat(newValue.toFixed(1)),
          unit: '°C',
          operator: 'System AI',
          status: newValue < 85.5 ? 'Warning' : 'Normal'
        };
        return [...prev.slice(1), newLog];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedCCP]);

  const currentCCP = allCCPs.find(c => c.id === selectedCCP);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-4 overflow-y-auto max-h-[600px]">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Select Control Point</h3>
          <div className="space-y-2">
            {allCCPs.map(ccp => (
              <button
                key={ccp.id}
                onClick={() => setSelectedCCP(ccp.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedCCP === ccp.id 
                  ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' 
                  : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <p className="text-xs font-bold text-indigo-600 uppercase mb-1">{ccp.planName}</p>
                <p className="text-sm font-semibold text-slate-800 line-clamp-2">{ccp.hazard?.processStep}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Real-time Stream: {currentCCP?.hazard?.processStep}</h3>
                <p className="text-sm text-slate-500">Monitoring: {currentCCP?.hazard?.potentialHazard}</p>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
                  <p className="flex items-center gap-1 text-green-600 font-bold">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Operational
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Limit</p>
                  <p className="text-red-600 font-bold">85.0°C</p>
                </div>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={logs}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="timestamp" axisLine={false} tickLine={false} />
                  <YAxis domain={[80, 95]} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="5 5" label={{ position: 'right', value: 'Critical Limit', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    animationDuration={300}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-800">Compliance Log History</h4>
              <button className="text-indigo-600 text-sm font-semibold hover:underline">Export as PDF</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Time</th>
                    <th className="px-6 py-3 font-semibold">Operator</th>
                    <th className="px-6 py-3 font-semibold">Value</th>
                    <th className="px-6 py-3 font-semibold">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[...logs].reverse().slice(0, 5).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">{log.timestamp}</td>
                      <td className="px-6 py-4">{log.operator}</td>
                      <td className="px-6 py-4 font-mono font-bold">{log.value}{log.unit}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.status === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
