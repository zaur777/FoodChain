import { HACCPPlan, HazardType, Severity } from './types';

export const INDUSTRY_TEMPLATES: Record<string, Partial<HACCPPlan>> = {
  restaurant: {
    name: 'Standard Restaurant Kitchen',
    materials: [
      { id: 'm-res-1', name: 'Raw Chicken Breast', type: 'Ingredient', regulatoryDoc: 'Local Health Dept', storageConditions: 'Chilled < 4°C', expirationPeriod: '3 days', allergens: [] },
      { id: 'm-res-2', name: 'Fresh Lettuce', type: 'Ingredient', regulatoryDoc: 'GAP Certified', storageConditions: 'Chilled < 4°C', expirationPeriod: '5 days', allergens: [] },
      { id: 'm-res-3', name: 'Wheat Buns', type: 'Ingredient', regulatoryDoc: 'Bakery Spec', storageConditions: 'Dry/Ambient', expirationPeriod: '7 days', allergens: ['Wheat', 'Gluten'] }
    ],
    products: [
      { id: 'p-res-1', name: 'Grilled Chicken Sandwich', description: 'Cooked chicken on wheat bun with lettuce', intendedUse: 'Immediate consumption', targetAudience: 'General public' }
    ],
    flowSteps: [
      { id: 'res-1', order: 1, name: 'Receiving Raw Materials', description: 'Receiving chilled and dry goods' },
      { id: 'res-2', order: 2, name: 'Chilled Storage', description: 'Storage at < 5°C' },
      { id: 'res-3', order: 3, name: 'Preparation', description: 'Cutting, mixing, seasoning' },
      { id: 'res-4', order: 4, name: 'Cooking', description: 'Thermal processing' },
      { id: 'res-5', order: 5, name: 'Hot Holding', description: 'Service at > 60°C' }
    ],
    hazards: [
      {
        id: 'h-res-1',
        flowStepId: 'res-4',
        processStep: 'Cooking',
        potentialHazard: 'Survival of pathogens (Salmonella, E. coli)',
        type: HazardType.BIOLOGICAL,
        severity: Severity.CRITICAL,
        probability: Severity.MEDIUM,
        justification: 'Inadequate cooking fails to kill pathogens.',
        preventativeMeasures: 'Cook to internal temperature of 75°C.',
        decisionTree: { q1: true, q2: true, q3: false, q4: false },
        isCCP: true,
        associatedMaterialIds: []
      }
    ],
    ccps: [
      {
        id: 'ccp-res-1',
        hazardId: 'h-res-1',
        criticalLimits: 'Internal Temp >= 75°C',
        monitoringProcedures: 'Probe thermometer measurement',
        monitoringFrequency: 'Every batch/item',
        monitoringResponsibility: 'Chef de Partie',
        correctiveActions: 'Continue cooking until 75°C is reached',
        verificationProcedures: 'Daily log review by Head Chef',
        validation: 'FDA Food Code standards',
        validationProcedures: '75°C ensures 7-log reduction of Salmonella',
        records: 'Cooking Temperature Logs',
        associatedMaterialIds: []
      }
    ]
  },
  poultry_farming: {
    name: 'Chicken Grow-out Facility',
    materials: [
      { id: 'm-pf-1', name: 'Poultry Starter Feed', type: 'Ingredient', regulatoryDoc: 'Feed Spec #101', storageConditions: 'Dry Silo', expirationPeriod: '3 months', allergens: ['Soy'] },
      { id: 'm-pf-2', name: 'Drinking Water', type: 'Ingredient', regulatoryDoc: 'Municipal Standards', storageConditions: 'Ambient', expirationPeriod: 'N/A', allergens: [] }
    ],
    products: [
      { id: 'p-pf-1', name: 'Live Broilers', description: '42-day old live chickens', intendedUse: 'Slaughter', targetAudience: 'Processing plants' }
    ],
    flowSteps: [
      { id: 'pf-1', order: 1, name: 'Chicks Receiving', description: 'Day-old chicks arrival' },
      { id: 'pf-2', order: 2, name: 'Feeding & Watering', description: 'Growth phase' },
      { id: 'pf-3', order: 3, name: 'Medication/Vaccination', description: 'Health management' },
      { id: 'pf-4', order: 4, name: 'Catching & Transport', description: 'Load out to slaughter' }
    ],
    hazards: [
      {
        id: 'h-pf-1',
        flowStepId: 'pf-2',
        processStep: 'Feeding & Watering',
        potentialHazard: 'Mycotoxins in feed',
        type: HazardType.CHEMICAL,
        severity: Severity.HIGH,
        probability: Severity.LOW,
        justification: 'Contaminated feed affects bird health and meat safety.',
        preventativeMeasures: 'Feed testing and supplier quality assurance.',
        decisionTree: { q1: true, q2: false, q3: true, q4: true },
        isCCP: false,
        associatedMaterialIds: []
      }
    ]
  },
  feed_manufacturing: {
    name: 'Animal Feed Mill',
    materials: [
      { id: 'm-fm-1', name: 'Corn Grain', type: 'Ingredient', regulatoryDoc: 'Grain Standard', storageConditions: 'Dry Silo', expirationPeriod: '1 year', allergens: [] },
      { id: 'm-fm-2', name: 'Vitamin Premix', type: 'Additive', regulatoryDoc: 'Supplier COA', storageConditions: 'Cool/Dry', expirationPeriod: '6 months', allergens: [] }
    ],
    products: [
      { id: 'p-fm-1', name: 'Pelleted Broiler Feed', description: 'Complete nutritional feed', intendedUse: 'Poultry nutrition', targetAudience: 'Poultry farms' }
    ],
    flowSteps: [
      { id: 'fm-1', order: 1, name: 'Ingredient Receiving', description: 'Bulk grains and additives' },
      { id: 'fm-2', order: 2, name: 'Grinding & Mixing', description: 'Particle size reduction' },
      { id: 'fm-3', order: 3, name: 'Conditioning/Pelleting', description: 'Steam treatment' },
      { id: 'fm-4', order: 4, name: 'Cooling & Bagging', description: 'Final product handling' }
    ],
    hazards: [
      {
        id: 'h-fm-1',
        flowStepId: 'fm-3',
        processStep: 'Conditioning/Pelleting',
        potentialHazard: 'Salmonella survival',
        type: HazardType.BIOLOGICAL,
        severity: Severity.CRITICAL,
        probability: Severity.MEDIUM,
        justification: 'Heat treatment is the primary kill step.',
        preventativeMeasures: 'Maintain 85°C for 30 seconds.',
        decisionTree: { q1: true, q2: true, q3: false, q4: false },
        isCCP: true,
        associatedMaterialIds: []
      }
    ]
  },
  chicken_slaughter: {
    name: 'Poultry Slaughter & Processing',
    materials: [
      { id: 'm-cs-1', name: 'Live Broilers', type: 'Ingredient', regulatoryDoc: 'Farm Health Cert', storageConditions: 'Ambient', expirationPeriod: '24 hours', allergens: [] },
      { id: 'm-cs-2', name: 'Packaging Film', type: 'Packaging', regulatoryDoc: 'Food Grade Cert', storageConditions: 'Dry', expirationPeriod: '2 years', allergens: [] }
    ],
    products: [
      { id: 'p-cs-1', name: 'Whole Chilled Chicken', description: 'Eviscerated carcass', intendedUse: 'Cooking', targetAudience: 'Retail/Foodservice' }
    ],
    flowSteps: [
      { id: 'cs-1', order: 1, name: 'Live Bird Receiving', description: 'Unloading' },
      { id: 'cs-2', order: 2, name: 'Stunning & Bleeding', description: 'Initial processing' },
      { id: 'cs-3', order: 3, name: 'Scalding & Defeathering', description: 'Cleaning' },
      { id: 'cs-4', order: 4, name: 'Evisceration', description: 'Internal organ removal' },
      { id: 'cs-5', order: 5, name: 'Chilling', description: 'Carcass cooling' }
    ],
    hazards: [
      {
        id: 'h-cs-1',
        flowStepId: 'cs-5',
        processStep: 'Chilling',
        potentialHazard: 'Pathogen growth (Campylobacter)',
        type: HazardType.BIOLOGICAL,
        severity: Severity.HIGH,
        probability: Severity.HIGH,
        justification: 'Slow cooling allows rapid bacterial multiplication.',
        preventativeMeasures: 'Chill carcasses to < 4°C within 4 hours.',
        decisionTree: { q1: true, q2: true, q3: false, q4: false },
        isCCP: true,
        associatedMaterialIds: []
      }
    ]
  },
  cattle_slaughter: {
    name: 'Cattle Slaughterhouse',
    materials: [
      { id: 'm-bs-1', name: 'Live Cattle', type: 'Ingredient', regulatoryDoc: 'Vet Health Cert', storageConditions: 'Lairage', expirationPeriod: '48 hours', allergens: [] },
      { id: 'm-bs-2', name: 'Organic Acid Spray', type: 'Additive', regulatoryDoc: 'FDA Approved', storageConditions: 'Cool', expirationPeriod: '1 year', allergens: [] }
    ],
    products: [
      { id: 'p-bs-1', name: 'Beef Carcass Sides', description: 'Split chilled carcasses', intendedUse: 'Further processing', targetAudience: 'Butchers/Processors' }
    ],
    flowSteps: [
      { id: 'bs-1', order: 1, name: 'Lairage', description: 'Pre-slaughter holding' },
      { id: 'bs-2', order: 2, name: 'Stunning & Hoisting', description: 'Processing start' },
      { id: 'bs-3', order: 3, name: 'Dehiding', description: 'Skin removal' },
      { id: 'bs-4', order: 4, name: 'Evisceration', description: 'Internal organ removal' },
      { id: 'bs-5', order: 5, name: 'Carcass Washing/Organic Acid Spray', description: 'Decontamination' }
    ],
    hazards: [
      {
        id: 'h-bs-1',
        flowStepId: 'bs-3',
        processStep: 'Dehiding',
        potentialHazard: 'Fecal contamination (E. coli O157:H7)',
        type: HazardType.BIOLOGICAL,
        severity: Severity.CRITICAL,
        probability: Severity.MEDIUM,
        justification: 'Hide-to-carcass transfer of pathogens.',
        preventativeMeasures: 'Strict hygienic dehiding and knife sterilization.',
        decisionTree: { q1: true, q2: false, q3: true, q4: true },
        isCCP: false,
        associatedMaterialIds: []
      }
    ]
  },
  drink_production: {
    name: 'Beverage Bottling Plant',
    materials: [
      { id: 'm-dp-1', name: 'Sugar Syrup', type: 'Ingredient', regulatoryDoc: 'Supplier Spec', storageConditions: 'Ambient', expirationPeriod: '6 months', allergens: [] },
      { id: 'm-dp-2', name: 'PET Bottles', type: 'Packaging', regulatoryDoc: 'Food Grade Cert', storageConditions: 'Dry', expirationPeriod: 'Indefinite', allergens: [] }
    ],
    products: [
      { id: 'p-dp-1', name: 'Carbonated Soft Drink', description: 'Sweetened flavored beverage', intendedUse: 'Direct consumption', targetAudience: 'General public' }
    ],
    flowSteps: [
      { id: 'dp-1', order: 1, name: 'Water Treatment', description: 'Filtration and UV' },
      { id: 'dp-2', order: 2, name: 'Syrup Mixing', description: 'Ingredient blending' },
      { id: 'dp-3', order: 3, name: 'Carbonation', description: 'CO2 injection' },
      { id: 'dp-4', order: 4, name: 'Filling & Capping', description: 'Packaging' },
      { id: 'dp-5', order: 5, name: 'Pasteurization', description: 'Thermal stability' }
    ],
    hazards: [
      {
        id: 'h-dp-1',
        flowStepId: 'dp-1',
        processStep: 'Water Treatment',
        potentialHazard: 'Cryptosporidium/Giardia',
        type: HazardType.BIOLOGICAL,
        severity: Severity.HIGH,
        probability: Severity.LOW,
        justification: 'Source water contamination.',
        preventativeMeasures: 'UV treatment at 40mJ/cm2.',
        decisionTree: { q1: true, q2: true, q3: false, q4: false },
        isCCP: true,
        associatedMaterialIds: []
      }
    ]
  },
  milk_processing: {
    name: 'Dairy Processing Plant',
    materials: [
      { id: 'm-mp-1', name: 'Raw Cow Milk', type: 'Ingredient', regulatoryDoc: 'Farm Quality Cert', storageConditions: 'Chilled < 4°C', expirationPeriod: '48 hours', allergens: ['Milk'] },
      { id: 'm-mp-2', name: 'HDPE Bottles', type: 'Packaging', regulatoryDoc: 'Food Grade Cert', storageConditions: 'Dry', expirationPeriod: 'Indefinite', allergens: [] }
    ],
    products: [
      { id: 'p-mp-1', name: 'Pasteurized Whole Milk', description: 'Standardized 3.5% fat milk', intendedUse: 'Direct consumption', targetAudience: 'General public' }
    ],
    flowSteps: [
      { id: 'mp-1', order: 1, name: 'Raw Milk Receiving', description: 'Tanker unloading' },
      { id: 'mp-2', order: 2, name: 'Clarification/Separation', description: 'Centrifugation' },
      { id: 'mp-3', order: 3, name: 'Pasteurization', description: 'HTST treatment' },
      { id: 'mp-4', order: 4, name: 'Homogenization', description: 'Fat globule reduction' },
      { id: 'mp-5', order: 5, name: 'Packaging', description: 'Filling' }
    ],
    hazards: [
      {
        id: 'h-mp-1',
        flowStepId: 'mp-3',
        processStep: 'Pasteurization',
        potentialHazard: 'Survival of Coxiella burnetii',
        type: HazardType.BIOLOGICAL,
        severity: Severity.CRITICAL,
        probability: Severity.MEDIUM,
        justification: 'Heat treatment is the primary safety step.',
        preventativeMeasures: '72°C for 15 seconds.',
        decisionTree: { q1: true, q2: true, q3: false, q4: false },
        isCCP: true,
        associatedMaterialIds: []
      }
    ]
  },
  milk_farm: {
    name: 'Dairy Farm Operations',
    materials: [
      { id: 'm-mf-1', name: 'Dairy Cow Feed', type: 'Ingredient', regulatoryDoc: 'Feed Spec', storageConditions: 'Dry Silo', expirationPeriod: '3 months', allergens: [] },
      { id: 'm-mf-2', name: 'Teat Dip Sanitizer', type: 'Additive', regulatoryDoc: 'Vet Approved', storageConditions: 'Cool', expirationPeriod: '1 year', allergens: [] }
    ],
    products: [
      { id: 'p-mf-1', name: 'Raw Bulk Milk', description: 'Unpasteurized cow milk', intendedUse: 'Processing', targetAudience: 'Dairy plants' }
    ],
    flowSteps: [
      { id: 'mf-1', order: 1, name: 'Milking', description: 'Extraction' },
      { id: 'mf-2', order: 2, name: 'Cooling', description: 'Bulk tank storage' },
      { id: 'mf-3', order: 3, name: 'Cleaning & Sanitation', description: 'Equipment hygiene' },
      { id: 'mf-4', order: 4, name: 'Feed Management', description: 'Nutrition' }
    ],
    hazards: [
      {
        id: 'h-mf-1',
        flowStepId: 'mf-1',
        processStep: 'Milking',
        potentialHazard: 'Antibiotic residues',
        type: HazardType.CHEMICAL,
        severity: Severity.HIGH,
        probability: Severity.MEDIUM,
        justification: 'Treatment of cows with mastitis.',
        preventativeMeasures: 'Strict withdrawal periods and testing.',
        decisionTree: { q1: true, q2: true, q3: false, q4: false },
        isCCP: true,
        associatedMaterialIds: []
      }
    ]
  }
};
