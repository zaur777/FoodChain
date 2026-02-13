
import { GoogleGenAI, Type } from "@google/genai";

// Always use direct process.env.API_KEY for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeHazard = async (processStep: string, productDescription: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As an expert HACCP consultant, analyze the following process step for potential food/feed safety hazards.
    Product: ${productDescription}
    Process Step: ${processStep}
    
    Provide a list of likely biological, chemical, physical, and radiological hazards.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            potentialHazard: { type: Type.STRING, description: 'The name of the hazard' },
            type: { type: Type.STRING, description: 'BIOLOGICAL, CHEMICAL, PHYSICAL, or RADIOLOGICAL' },
            severity: { type: Type.STRING, description: 'LOW, MEDIUM, HIGH, or CRITICAL' },
            probability: { type: Type.STRING, description: 'LOW, MEDIUM, or HIGH' },
            justification: { type: Type.STRING, description: 'Scientific or historical reasoning' },
            preventativeMeasures: { type: Type.STRING, description: 'How to control this hazard' },
            isCCP: { type: Type.BOOLEAN, description: 'Whether this step is likely a Critical Control Point' }
          },
          required: ['potentialHazard', 'type', 'severity', 'probability', 'justification', 'preventativeMeasures', 'isCCP']
        }
      }
    }
  });

  try {
    const text = response.text || '';
    return JSON.parse(text.trim());
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return [];
  }
};

export const suggestCcpDetails = async (processStep: string, hazard: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `For the following Critical Control Point (CCP) in a food/feed safety plan, suggest scientifically justified parameters.
    Process Step: ${processStep}
    Hazard: ${hazard}
    
    Provide industry-standard monitoring, limits, and verification procedures. 
    Crucially, for "validationProcedures", provide the scientific basis or reference studies (e.g., FDA guidelines, peer-reviewed thermal death studies) that justify the selected critical limits.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          criticalLimits: { type: Type.STRING, description: 'Measurable thresholds' },
          monitoringProcedures: { type: Type.STRING, description: 'The "How" of monitoring' },
          monitoringFrequency: { type: Type.STRING, description: 'The "When"' },
          monitoringResponsibility: { type: Type.STRING, description: 'The "Who"' },
          correctiveActions: { type: Type.STRING, description: 'What to do if limits are exceeded' },
          verificationProcedures: { type: Type.STRING, description: 'Procedures to confirm the system is working' },
          validation: { type: Type.STRING, description: 'A short summary of validation evidence' },
          validationProcedures: { type: Type.STRING, description: 'DETAILED scientific basis or reference study text' },
          records: { type: Type.STRING, description: 'Documentation required' }
        },
        required: ['criticalLimits', 'monitoringProcedures', 'monitoringFrequency', 'monitoringResponsibility', 'correctiveActions', 'verificationProcedures', 'validation', 'validationProcedures', 'records']
      }
    }
  });

  try {
    const text = response.text || '{}';
    return JSON.parse(text.trim());
  } catch (e) {
    console.error("Failed to parse CCP details", e);
    return null;
  }
};

export const suggestVerificationProcedures = async (hazard: string, criticalLimits: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest highly specific verification procedures (Principle 6) for a Critical Control Point.
    Hazard being controlled: ${hazard}
    Critical Limits: ${criticalLimits}
    
    Include activities like:
    1. Daily review of monitoring records.
    2. Equipment calibration frequency.
    3. Independent checks or testing.
    4. Periodic audits of the procedure.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verificationProcedures: { type: Type.STRING, description: 'Detailed verification activities' }
        },
        required: ['verificationProcedures']
      }
    }
  });

  try {
    const text = response.text || '{}';
    return JSON.parse(text.trim());
  } catch (e) {
    console.error("Failed to parse verification suggestions", e);
    return null;
  }
};

export const validateCriticalLimit = async (limit: string, hazard: string, processStep: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As an expert HACCP validator, evaluate the scientific validity of the following Critical Limit.
    Process Step: ${processStep}
    Hazard: ${hazard}
    Critical Limit: ${limit}

    Is this limit sufficient to control the hazard according to international standards (e.g. Codex Alimentarius, FDA, EFSA)?
    If it's too vague or scientifically weak, provide a corrected, robust version and explain why.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isValid: { type: Type.BOOLEAN, description: 'True if the limit is scientifically robust' },
          assessment: { type: Type.STRING, description: 'Brief evaluation of the current limit' },
          suggestedLimit: { type: Type.STRING, description: 'Improved scientific limit if needed' },
          scientificBasis: { type: Type.STRING, description: 'The scientific reasoning or regulatory reference' }
        },
        required: ['isValid', 'assessment', 'suggestedLimit', 'scientificBasis']
      }
    }
  });

  try {
    const text = response.text || '{}';
    return JSON.parse(text.trim());
  } catch (e) {
    console.error("Failed to parse validation", e);
    return null;
  }
};

export const suggestMaterialsForHazard = async (hazard: string, availableMaterials: any[]) => {
  const materialsContext = availableMaterials.map(m => `- ${m.name} (ID: ${m.id}, Type: ${m.type})`).join('\n');
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following food/feed safety hazard and suggest which of the registered raw materials are most likely associated with it or could be sources of this specific hazard.
    
    Hazard: ${hazard}
    
    Registered Materials Registry:
    ${materialsContext}
    
    Return a JSON array containing ONLY the string IDs of the associated materials.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    const text = response.text || '[]';
    return JSON.parse(text.trim());
  } catch (e) {
    console.error("Failed to parse material suggestions", e);
    return [];
  }
};

export const suggestCorrectiveAction = async (hazard: string, violation: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide an immediate corrective action and a long-term preventative action for the following HACCP violation:
    Hazard: ${hazard}
    Violation: ${violation}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          immediateAction: { type: Type.STRING },
          preventativeAction: { type: Type.STRING }
        },
        required: ['immediateAction', 'preventativeAction']
      }
    }
  });

  const text = response.text || '{}';
  return JSON.parse(text.trim());
};
