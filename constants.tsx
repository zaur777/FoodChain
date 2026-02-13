
import React from 'react';
import { HACCPPlan, HazardType, Severity } from './types';

export const INITIAL_PLANS: HACCPPlan[] = [
  {
    id: 'plan-1',
    name: 'Poultry Feed Production Line A',
    createdAt: new Date().toISOString(),
    status: 'Active',
    team: [],
    materials: [],
    products: [
      {
        id: 'p-1',
        name: 'Broiler Starter',
        description: 'Extruded broiler starter feed pellets.',
        intendedUse: 'Feeding broilers aged 0-14 days.',
        targetAudience: 'Commercial poultry farms.'
      }
    ],
    flowSteps: [
      { id: 'fs-1', order: 1, name: 'Raw Material Receiving', description: 'Initial reception' },
      { id: 'fs-2', order: 2, name: 'Conditioning / Pelleting', description: 'Thermal processing' }
    ],
    hazards: [
      {
        id: 'h-1',
        flowStepId: 'fs-1',
        processStep: 'Raw Material Receiving',
        potentialHazard: 'Salmonella Contamination',
        type: HazardType.BIOLOGICAL,
        severity: Severity.HIGH,
        probability: Severity.MEDIUM,
        justification: 'Inherent risk in raw poultry ingredients.',
        preventativeMeasures: 'Supplier certification and testing.',
        decisionTree: { q1: true, q2: false, q3: true, q4: true },
        isCCP: false,
        associatedMaterialIds: []
      },
      {
        id: 'h-2',
        flowStepId: 'fs-2',
        processStep: 'Conditioning / Pelleting',
        potentialHazard: 'Pathogen Survival (Low Temp)',
        type: HazardType.BIOLOGICAL,
        severity: Severity.CRITICAL,
        probability: Severity.MEDIUM,
        justification: 'Inadequate heat treatment allows pathogens to persist.',
        preventativeMeasures: 'Ensure temperature > 85°C for 30s.',
        decisionTree: { q1: true, q2: true, q3: false, q4: false },
        isCCP: true,
        associatedMaterialIds: []
      }
    ],
    ccps: [
      {
        id: 'ccp-1',
        hazardId: 'h-2',
        criticalLimits: 'Temp > 85°C, Retention > 30s',
        monitoringProcedures: 'Continuous digital temperature probes.',
        monitoringFrequency: 'Continuous',
        monitoringResponsibility: 'Production Supervisor',
        correctiveActions: 'Divert material back to conditioning, check steam pressure.',
        verificationProcedures: 'Weekly calibration of sensors, daily log review.',
        validation: 'Scientific study on pathogen reduction at 85°C for 30s.',
        validationProcedures: 'Based on FDA Guidance for Industry #168 and scientific literature identifying 85°C/30s as a 5-log reduction point for Salmonella in mixed mash feeds.',
        records: 'Conditioning Temp Logs',
        associatedMaterialIds: []
      }
    ]
  }
];

export const ICONS = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
  ),
  Clipboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
  ),
  Alert: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
  ),
  Activity: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
  ),
  Link: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
  )
};
