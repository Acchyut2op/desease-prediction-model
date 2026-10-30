import React, { useEffect, useMemo, useState } from 'react';
import symptomWeights from './symptom_weights.json';

const DEFAULT_SYMPTOMS = [
  // General & Whole Body
  { id: 'high_fever', label: 'High Fever', category: 'General & Whole Body', keywords: ['high fever', 'fever', 'temperature', 'hot'] },
  { id: 'mild_fever', label: 'Mild Fever', category: 'General & Whole Body', keywords: ['mild fever', 'low fever', 'slight fever'] },
  { id: 'chills', label: 'Chills & Shivering', category: 'General & Whole Body', keywords: ['chills', 'shivering', 'cold'] },
  { id: 'fatigue', label: 'Fatigue / Feeling Very Tired', category: 'General & Whole Body', keywords: ['fatigue', 'tired', 'weak', 'exhausted', 'low energy'] },
  { id: 'lethargy', label: 'Lethargy / Lack of Energy', category: 'General & Whole Body', keywords: ['lethargy', 'sluggish', 'drowsy', 'no energy'] },
  { id: 'malaise', label: 'General Body Discomfort (Malaise)', category: 'General & Whole Body', keywords: ['malaise', 'unwell', 'body discomfort', 'feeling sick'] },
  { id: 'muscle_pain', label: 'Muscle Pain / Body Aches', category: 'General & Whole Body', keywords: ['muscle pain', 'body ache', 'aching muscles', 'soreness'] },
  { id: 'weight_loss', label: 'Unexplained Weight Loss', category: 'General & Whole Body', keywords: ['weight loss', 'losing weight', 'thin'] },
  { id: 'obesity', label: 'Overweight / Obesity', category: 'General & Whole Body', keywords: ['obesity', 'overweight', 'heavy weight'] },
  { id: 'restlessness', label: 'Restlessness / Trouble Relaxing', category: 'General & Whole Body', keywords: ['restless', 'restlessness', 'uneasy'] },

  // Head, Eyes, Nose & Throat
  { id: 'headache', label: 'Headache', category: 'Head, Eyes, Nose & Throat', keywords: ['headache', 'head pain', 'throbbing head', 'migraine'] },
  { id: 'continuous_sneezing', label: 'Continuous Sneezing', category: 'Head, Eyes, Nose & Throat', keywords: ['sneezing', 'sneeze'] },
  { id: 'runny_nose', label: 'Runny Nose', category: 'Head, Eyes, Nose & Throat', keywords: ['runny nose', 'nasal drip'] },
  { id: 'congestion', label: 'Nasal Congestion / Stuffy Nose', category: 'Head, Eyes, Nose & Throat', keywords: ['congestion', 'stuffy nose', 'blocked nose'] },
  { id: 'sinus_pressure', label: 'Sinus Pressure (Around Eyes/Forehead)', category: 'Head, Eyes, Nose & Throat', keywords: ['sinus', 'sinus pressure', 'face pressure'] },
  { id: 'throat_irritation', label: 'Sore or Irritated Throat', category: 'Head, Eyes, Nose & Throat', keywords: ['throat', 'sore throat', 'scratchy throat', 'throat irritation'] },
  { id: 'loss_of_smell', label: 'Loss of Smell', category: 'Head, Eyes, Nose & Throat', keywords: ['smell', 'loss of smell'] },
  { id: 'redness_of_eyes', label: 'Red or Watery Eyes', category: 'Head, Eyes, Nose & Throat', keywords: ['red eyes', 'redness of eyes', 'watery eyes'] },
  { id: 'blurred_and_distorted_vision', label: 'Blurred or Distorted Vision', category: 'Head, Eyes, Nose & Throat', keywords: ['blurred vision', 'blurry', 'vision', 'sight'] },
  { id: 'visual_disturbances', label: 'Visual Disturbances / Sensitivity to Light', category: 'Head, Eyes, Nose & Throat', keywords: ['visual', 'flashing lights', 'aura', 'bright light'] },
  { id: 'dizziness', label: 'Dizziness / Lightheadedness', category: 'Head, Eyes, Nose & Throat', keywords: ['dizzy', 'dizziness', 'lightheaded', 'vertigo'] },
  { id: 'loss_of_balance', label: 'Loss of Balance / Unsteadiness', category: 'Head, Eyes, Nose & Throat', keywords: ['balance', 'loss of balance', 'unsteady'] },
  { id: 'lack_of_concentration', label: 'Difficulty Concentrating', category: 'Head, Eyes, Nose & Throat', keywords: ['concentration', 'focus', 'brain fog'] },
  { id: 'stiff_neck', label: 'Stiff Neck', category: 'Head, Eyes, Nose & Throat', keywords: ['stiff neck', 'neck pain'] },
  { id: 'irritability', label: 'Irritability / Mood Changes', category: 'Head, Eyes, Nose & Throat', keywords: ['irritable', 'irritability', 'mood swings'] },

  // Chest & Breathing
  { id: 'cough', label: 'Cough', category: 'Chest & Breathing', keywords: ['cough', 'coughing', 'dry cough'] },
  { id: 'phlegm', label: 'Phlegm / Mucus in Throat', category: 'Chest & Breathing', keywords: ['phlegm', 'mucus', 'sputum'] },
  { id: 'mucoid_sputum', label: 'Thick Mucus Cough (Mucoid Sputum)', category: 'Chest & Breathing', keywords: ['mucoid', 'thick mucus', 'wheezing cough'] },
  { id: 'breathlessness', label: 'Shortness of Breath (Breathlessness)', category: 'Chest & Breathing', keywords: ['breathless', 'breathlessness', 'shortness of breath', 'difficulty breathing'] },
  { id: 'chest_pain', label: 'Chest Pain or Tightness', category: 'Chest & Breathing', keywords: ['chest pain', 'chest tightness', 'heavy chest'] },
  { id: 'swelled_lymph_nodes', label: 'Swollen Glands in Neck (Lymph Nodes)', category: 'Chest & Breathing', keywords: ['lymph nodes', 'swollen glands', 'neck swelling'] },

  // Stomach, Thirst & Digestion
  { id: 'polyuria', label: 'Frequent Urination (Polyuria)', category: 'Stomach, Thirst & Digestion', keywords: ['frequent urination', 'polyuria', 'peeing a lot', 'bathroom trips'] },
  { id: 'increased_appetite', label: 'Increased Appetite / Constant Thirst', category: 'Stomach, Thirst & Digestion', keywords: ['increased appetite', 'thirsty', 'thirst', 'drinking water'] },
  { id: 'excessive_hunger', label: 'Excessive Hunger', category: 'Stomach, Thirst & Digestion', keywords: ['excessive hunger', 'hungry', 'always hungry'] },
  { id: 'irregular_sugar_level', label: 'Irregular Blood Sugar Readings', category: 'Stomach, Thirst & Digestion', keywords: ['sugar level', 'high sugar', 'blood sugar', 'glucose'] },
  { id: 'vomiting', label: 'Vomiting / Throwing Up', category: 'Stomach, Thirst & Digestion', keywords: ['vomiting', 'vomit', 'throwing up', 'nausea'] },
  { id: 'diarrhoea', label: 'Diarrhea / Loose Motions', category: 'Stomach, Thirst & Digestion', keywords: ['diarrhea', 'diarrhoea', 'loose motion', 'watery stool'] },
  { id: 'dehydration', label: 'Dehydration / Dry Mouth', category: 'Stomach, Thirst & Digestion', keywords: ['dehydration', 'dehydrated', 'dry mouth'] },
  { id: 'sunken_eyes', label: 'Sunken or Tired Eyes (From Fluid Loss)', category: 'Stomach, Thirst & Digestion', keywords: ['sunken eyes', 'dark circles', 'fluid loss'] },
  { id: 'indigestion', label: 'Indigestion / Stomach Upset', category: 'Stomach, Thirst & Digestion', keywords: ['indigestion', 'stomach upset', 'acidity', 'gas'] },
  { id: 'acidity', label: 'Acidity / Heartburn', category: 'Stomach, Thirst & Digestion', keywords: ['acidity', 'heartburn', 'acid reflux', 'burning stomach'] },
  { id: 'family_history', label: 'Family History of Chronic Illness', category: 'Stomach, Thirst & Digestion', keywords: ['family history', 'parents', 'hereditary'] },
];

const QUICK_SYMPTOM_PRESETS = [
  {
    name: 'Common Cold Case',
    symptoms: ['continuous_sneezing', 'chills', 'fatigue', 'cough', 'high_fever', 'headache', 'runny_nose', 'congestion', 'throat_irritation'],
  },
  {
    name: 'Diabetes Case',
    symptoms: ['fatigue', 'weight_loss', 'restlessness', 'lethargy', 'irregular_sugar_level', 'blurred_and_distorted_vision', 'excessive_hunger', 'polyuria', 'increased_appetite'],
  },
  {
    name: 'Hypertension Case',
    symptoms: ['headache', 'chest_pain', 'dizziness', 'loss_of_balance', 'lack_of_concentration'],
  },
  {
    name: 'Migraine Case',
    symptoms: ['acidity', 'indigestion', 'headache', 'blurred_and_distorted_vision', 'excessive_hunger', 'stiff_neck', 'irritability', 'visual_disturbances'],
  },
  {
    name: 'Gastroenteritis Case',
    symptoms: ['vomiting', 'sunken_eyes', 'dehydration', 'diarrhoea'],
  },
  {
    name: 'Bronchial Asthma Case',
    symptoms: ['fatigue', 'cough', 'high_fever', 'breathlessness', 'family_history', 'mucoid_sputum'],
  },
];

const PATIENT_PROFILES = [
  {
    id: 'healthy',
    name: 'Healthy Adult',
    values: { plas: 102, mass: 23.4, age: 29, pres: 70, pedi: 0.25, preg: 0, insu: 0, skin: 0 },
  },
  {
    id: 'borderline',
    name: 'Borderline / Pre-Diabetic',
    values: { plas: 144, mass: 29.5, age: 45, pres: 82, pedi: 0.55, preg: 2, insu: 145, skin: 30 },
  },
  {
    id: 'high_risk',
    name: 'High Risk Patient',
    values: { plas: 178, mass: 35.8, age: 54, pres: 88, pedi: 0.9, preg: 4, insu: 210, skin: 36 },
  },
];

const FAMILY_HISTORY_CHOICES = [
  { label: 'None', sub: 'No close relatives', value: 0.25 },
  { label: 'Moderate', sub: '1 parent or sibling', value: 0.55 },
  { label: 'Strong', sub: '2+ close relatives', value: 0.9 },
];

function getGlucoseBadge(val) {
  if (val < 140) return { text: 'Normal (< 140)', type: 'normal' };
  if (val < 200) return { text: 'Borderline (140–199)', type: 'borderline' };
  return { text: 'High (≥ 200)', type: 'elevated' };
}

function getBmiBadge(val) {
  if (val < 18.5) return { text: 'Underweight', type: 'borderline' };
  if (val < 25) return { text: 'Healthy Weight (18.5–24.9)', type: 'normal' };
  if (val < 30) return { text: 'Overweight (25–29.9)', type: 'borderline' };
  return { text: 'Obesity (≥ 30)', type: 'elevated' };
}

function getBpBadge(val) {
  if (val < 80) return { text: 'Normal (< 80)', type: 'normal' };
  if (val < 90) return { text: 'Slightly High (80–89)', type: 'borderline' };
  return { text: 'High (≥ 90)', type: 'elevated' };
}

function buildDiabetesActionPlan(inputs, probability) {
  const actions = [];
  const pct = Math.round(probability * 100);

  if (pct >= 50) {
    actions.push({
      priority: 'urgent',
      badge: 'Step 1 · Medical Checkup',
      title: 'Schedule a Confirmatory Blood Test (HbA1c & Fasting Glucose)',
      desc: 'Your classification result is in the High Risk range. Visit a clinic or primary care physician for a standard laboratory HbA1c blood test to confirm your status.',
    });
  } else if (pct >= 30) {
    actions.push({
      priority: 'recommended',
      badge: 'Step 1 · Preventive Check',
      title: 'Get a Routine Blood Sugar Check Within 1–3 Months',
      desc: 'Your result is in the Moderate / Borderline watch zone. Early diet and activity adjustments now can prevent blood glucose from rising further.',
    });
  } else {
    actions.push({
      priority: 'good',
      badge: 'Step 1 · Routine Care',
      title: 'Continue Annual Health Checkups',
      desc: 'Your current diabetes risk classification is Low. Maintain your current healthy habits and re-check blood glucose during routine annual checkups.',
    });
  }

  if (inputs.plas >= 140) {
    actions.push({
      priority: inputs.plas >= 170 ? 'urgent' : 'recommended',
      badge: 'Blood Sugar Target',
      title: `Lower Blood Glucose From ${inputs.plas} mg/dL Toward < 140 mg/dL`,
      desc: 'Elevated blood glucose is the primary factor increasing your risk score. Reducing sugary beverages, refined carbohydrates, and walking 20–30 minutes after meals helps improve glucose regulation.',
    });
  }

  if (inputs.mass >= 25) {
    actions.push({
      priority: inputs.mass >= 30 ? 'urgent' : 'recommended',
      badge: 'Weight & BMI Target',
      title: `Work Toward a BMI Below 25 kg/m² (Current: ${inputs.mass})`,
      desc: 'A modest 5%–7% reduction in body weight significantly improves insulin sensitivity and lowers long-term metabolic risk.',
    });
  }

  if (inputs.pres >= 80) {
    actions.push({
      priority: 'recommended',
      badge: 'Blood Pressure',
      title: `Monitor Diastolic Blood Pressure (Current: ${inputs.pres} mmHg)`,
      desc: 'A healthy resting diastolic reading is below 80 mmHg. Limiting dietary sodium and staying physically active supports healthy blood pressure.',
    });
  }

  if (inputs.plas < 140 && inputs.mass < 25 && inputs.pres < 80) {
    actions.push({
      priority: 'good',
      badge: 'Healthy Measurements',
      title: 'Your Core Measurements Are Within Healthy Reference Ranges',
      desc: 'Your blood glucose (< 140 mg/dL), BMI (< 25 kg/m²), and blood pressure (< 80 mmHg) are all within normal clinical limits.',
    });
  }

  return actions;
}

const PIMA_PIPELINE_STATS = {
  intercept: -0.8722,
  features: {
    preg: { median: 3.0, mean: 3.819, std: 3.311, coef: 0.3774 },
    plas: { median: 117.0, mean: 121.671, std: 29.979, coef: 1.1826 },
    pres: { median: 72.0, mean: 72.14, std: 12.265, coef: -0.0441 },
    skin: { median: 29.0, mean: 29.042, std: 8.885, coef: 0.0283 },
    insu: { median: 125.0, mean: 137.705, std: 78.701, coef: -0.0661 },
    mass: { median: 32.4, mean: 32.448, std: 6.819, coef: 0.6887 },
    pedi: { median: 0.383, mean: 0.477, std: 0.33, coef: 0.2333 },
    age: { median: 29.0, mean: 33.366, std: 11.824, coef: 0.1478 },
  },
};

function evaluateDiabetesPipeline(values) {
  const zeroImputed = new Set(['plas', 'pres', 'skin', 'insu', 'mass']);
  let logit = PIMA_PIPELINE_STATS.intercept;
  Object.entries(PIMA_PIPELINE_STATS.features).forEach(([key, st]) => {
    const raw = Number(values[key] ?? 0);
    const eff = zeroImputed.has(key) && raw === 0 ? st.median : raw;
    const z = (eff - st.mean) / st.std;
    logit += z * st.coef;
  });
  const prob = 1 / (1 + Math.exp(-logit));
  return {
    prediction: prob >= 0.5 ? 1 : 0,
    probability: Number(prob.toFixed(4)),
  };
}

function evaluateSymptomPipeline(selectedIds) {
  const selected = new Set(selectedIds);
  const featureCols = symptomWeights.feature_columns;
  const classes = symptomWeights.classes;
  const coef = symptomWeights.coef;
  const intercept = symptomWeights.intercept;
  const diseases = symptomWeights.diseases;
  const diseaseSymptomMap = symptomWeights.disease_symptom_map;
  const symptomsList = symptomWeights.symptoms;

  // Step 1: Build binary feature vector
  const x = featureCols.map((col) => (selected.has(col) ? 1.0 : 0.0));

  // Step 2: Normalizer(norm="l2")
  const norm = Math.sqrt(x.reduce((acc, v) => acc + v * v, 0));
  const xNorm = norm > 0 ? x.map((v) => v / norm) : x;

  // Step 3: Multinomial Logistic Regression logits (x_norm · coef^T + intercept)
  const logits = classes.map((_, cIdx) => {
    let sum = intercept[cIdx];
    for (let j = 0; j < featureCols.length; j += 1) {
      sum += xNorm[j] * coef[cIdx][j];
    }
    return sum;
  });

  // Softmax probabilities
  const maxLogit = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - maxLogit));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map((e) => e / sumExps);

  const ranked = classes
    .map((dKey, idx) => {
      const dInfo = diseases[dKey];
      const activeSet = new Set(diseaseSymptomMap[dKey] || []);
      const matched = symptomsList
        .filter((s) => selected.has(s.id) && activeSet.has(s.id))
        .map((s) => s.label);

      return {
        id: dKey,
        name: dInfo.name,
        probability: Number(probs[idx].toFixed(4)),
        short_desc: dInfo.short_desc,
        urgency: dInfo.urgency,
        doctor_type: dInfo.doctor_type,
        what_to_do: dInfo.what_to_do,
        warning_signs: dInfo.warning_signs,
        matched_symptoms: matched,
      };
    })
    .sort((a, b) => b.probability - a.probability);

  return {
    selected_count: selected.size,
    top_prediction: ranked[0],
    all_predictions: ranked,
  };
}

async function apiFetch(endpoint, options) {
  const bases = ['http://127.0.0.1:8005', 'http://127.0.0.1:8000', ''];
  for (const base of bases) {
    try {
      const res = await fetch(`${base}${endpoint}`, options);
      if (res.ok) return await res.json();
    } catch {}
  }
  throw new Error('Request failed');
}

export default function App() {
  const [viewMode, setViewMode] = useState('symptoms');

  // --- SYMPTOM PREDICTOR STATE ---
  const [symptomsCatalog, setSymptomsCatalog] = useState(DEFAULT_SYMPTOMS);
  // Start with empty symptoms so no previous/default disease is shown before user input
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [describeText, setDescribeText] = useState('');
  const [describeMessage, setDescribeMessage] = useState('');
  const [unmatchedQuery, setUnmatchedQuery] = useState('');
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [loadingSymptomPred, setLoadingSymptomPred] = useState(false);

  // --- DIABETES LAB STATE ---
  const [activeProfile, setActiveProfile] = useState('healthy');
  const [inputs, setInputs] = useState(PATIENT_PROFILES[0].values);
  const [prediction, setPrediction] = useState({ prediction: 0, probability: 0.046 });
  const [showBmiCalc, setShowBmiCalc] = useState(false);
  const [heightCm, setHeightCm] = useState(168);
  const [weightKg, setWeightKg] = useState(66);
  const [showAdvancedLabs, setShowAdvancedLabs] = useState(false);

  // Load real symptom catalog from backend
  useEffect(() => {
    apiFetch('/api/symptoms-info')
      .then((data) => {
        if (data && Array.isArray(data.symptoms) && data.symptoms.length > 0) {
          setSymptomsCatalog(data.symptoms);
        }
      })
      .catch(() => {});
  }, []);

  // Group symptoms by body area
  const groupedSymptoms = useMemo(() => {
    const groups = {};
    symptomsCatalog.forEach((s) => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return groups;
  }, [symptomsCatalog]);

  // Execute ML prediction when symptoms change (instant trained-weight evaluation + backend sync)
  useEffect(() => {
    let cancelled = false;
    if (selectedSymptoms.length === 0) {
      setDiseaseResult(null);
      return undefined;
    }

    // Immediate evaluation using exact scikit-learn trained weights
    const localPred = evaluateSymptomPipeline(selectedSymptoms);
    if (localPred) {
      setDiseaseResult(localPred);
    }

    setLoadingSymptomPred(true);
    apiFetch('/api/predict-disease', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms: selectedSymptoms }),
    })
      .then((data) => {
        if (!cancelled && data && data.top_prediction) {
          setDiseaseResult(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingSymptomPred(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSymptoms]);

  const toggleSymptom = (id) => {
    setDescribeMessage('');
    setUnmatchedQuery('');
    const nextSymptoms = selectedSymptoms.includes(id)
      ? selectedSymptoms.filter((item) => item !== id)
      : [...selectedSymptoms, id];
    setSelectedSymptoms(nextSymptoms);
    setDiseaseResult(nextSymptoms.length > 0 ? evaluateSymptomPipeline(nextSymptoms) : null);
  };

  const handleSymptomSearch = (e) => {
    e.preventDefault();
    const rawText = describeText.trim();
    const text = rawText.toLowerCase();
    if (!text) {
      setSelectedSymptoms([]);
      setDiseaseResult(null);
      setUnmatchedQuery('');
      setDescribeMessage('');
      return;
    }

    const matchedSet = new Set();

    // Also match if user types a condition name directly
    const diseaseKeywordPresets = [
      { keys: ['common cold', 'cold', 'flu', 'viral'], syms: QUICK_SYMPTOM_PRESETS[0].symptoms },
      { keys: ['diabetes', 'diabetic', 'high sugar'], syms: QUICK_SYMPTOM_PRESETS[1].symptoms },
      { keys: ['hypertension', 'high bp', 'blood pressure'], syms: QUICK_SYMPTOM_PRESETS[2].symptoms },
      { keys: ['migraine'], syms: QUICK_SYMPTOM_PRESETS[3].symptoms },
      { keys: ['gastroenteritis', 'stomach flu', 'food poisoning', 'stomach bug', 'stomach pain'], syms: QUICK_SYMPTOM_PRESETS[4].symptoms },
      { keys: ['asthma', 'bronchial asthma', 'wheezing'], syms: QUICK_SYMPTOM_PRESETS[5].symptoms },
    ];

    diseaseKeywordPresets.forEach((dp) => {
      if (dp.keys.some((k) => text.includes(k))) {
        dp.syms.forEach((id) => matchedSet.add(id));
      }
    });

    symptomsCatalog.forEach((s) => {
      const labelMatch = text.includes(s.label.toLowerCase());
      const idMatch = text.includes(s.id.replace(/_/g, ' '));
      const keywordMatch = (s.keywords || []).some((kw) => text.includes(kw.toLowerCase()));
      if (labelMatch || idMatch || keywordMatch) {
        matchedSet.add(s.id);
      }
    });

    const matchedIds = Array.from(matchedSet);

    if (matchedIds.length > 0) {
      setUnmatchedQuery('');
      setSelectedSymptoms(matchedIds);
      setDiseaseResult(evaluateSymptomPipeline(matchedIds));
      setDescribeMessage(`Found and selected ${matchedIds.length} matching symptom(s) for "${rawText}".`);
    } else {
      // Clear any previous loaded symptoms and prediction immediately!
      setSelectedSymptoms([]);
      setDiseaseResult(null);
      setUnmatchedQuery(rawText);
      setDescribeMessage(
        `No matching symptoms found for "${rawText}". Previous selection has been cleared.`
      );
    }
  };

  // Execute Diabetes ML model when inputs change (instant trained-weight evaluation + backend sync)
  useEffect(() => {
    let cancelled = false;
    setPrediction(evaluateDiabetesPipeline(inputs));

    apiFetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs),
    })
      .then((data) => {
        if (!cancelled && data && typeof data.probability === 'number') {
          setPrediction(data);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [inputs]);

  const updateInput = (key, rawVal) => {
    setActiveProfile(null);
    const num = rawVal === '' ? 0 : Number(rawVal);
    setInputs((prev) => ({
      ...prev,
      [key]: Number.isNaN(num) ? 0 : num,
    }));
  };

  const applyBmiCalculation = () => {
    const hMeters = Number(heightCm) / 100;
    if (hMeters > 0.5 && Number(weightKg) > 20) {
      const calculated = Number((Number(weightKg) / (hMeters * hMeters)).toFixed(1));
      updateInput('mass', Math.min(60, Math.max(15, calculated)));
      setShowBmiCalc(false);
    }
  };

  const probPct = Math.round((prediction.probability || 0) * 100);
  let riskCategory = 'low';
  let riskTitle = 'Low Diabetes Risk (Negative Class)';
  let riskExplanation =
    'Based on the clinical measurements entered, your readings fall below the positive classification threshold.';

  if (probPct >= 50) {
    riskCategory = 'high';
    riskTitle = 'High Diabetes Risk (Positive Class)';
    riskExplanation =
      'Your clinical measurements exceed the 50% classification threshold. A confirmatory laboratory blood test with a physician is recommended.';
  } else if (probPct >= 30) {
    riskCategory = 'moderate';
    riskTitle = 'Moderate / Borderline Risk';
    riskExplanation =
      'Your readings are below the 50% positive cutoff, but several indicators are above normal reference ranges.';
  }

  const actionPlan = buildDiabetesActionPlan(inputs, prediction.probability || 0);
  const glucoseBadge = getGlucoseBadge(inputs.plas);
  const bmiBadge = getBmiBadge(inputs.mass);
  const bpBadge = getBpBadge(inputs.pres);

  const topDisease = diseaseResult?.top_prediction;
  const topMatchPct = Math.round((topDisease?.probability || 0) * 100);

  return (
    <div>
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo-area">
            <div className="logo-badge">DS</div>
            <div>
              <div className="app-title">DiagnoSense — Disease &amp; Health Prediction System</div>
              <div className="app-tagline">
                Clinical Symptom Classification &amp; Diabetes Biomarker Assessment
              </div>
            </div>
          </div>

          <div className="mode-switch">
            <button
              type="button"
              className={`mode-btn ${viewMode === 'symptoms' ? 'active' : ''}`}
              onClick={() => setViewMode('symptoms')}
            >
              Symptom Disease Predictor
            </button>
            <button
              type="button"
              className={`mode-btn ${viewMode === 'diabetes' ? 'active' : ''}`}
              onClick={() => setViewMode('diabetes')}
            >
              Diabetes Lab Assessment
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {viewMode === 'symptoms' ? (
          /* ============================================================
             VIEW 1: SYMPTOM-BASED MULTI-DISEASE PREDICTOR
             ============================================================ */
          <>
            <div className="steps-banner">
              <div className="step-card">
                <div className="step-num">1</div>
                <div>
                  <div className="step-title">Select Your Symptoms</div>
                  <div className="step-desc">
                    Search by keyword or tap the symptoms you are experiencing from the categories on the left.
                  </div>
                </div>
              </div>
              <div className="step-card">
                <div className="step-num">2</div>
                <div>
                  <div className="step-title">View Predicted Condition</div>
                  <div className="step-desc">
                    The trained classification model evaluates 42 clinical symptoms across 6 common conditions.
                  </div>
                </div>
              </div>
              <div className="step-card">
                <div className="step-num">3</div>
                <div>
                  <div className="step-title">Follow Recommended Next Steps</div>
                  <div className="step-desc">
                    Review which specialist to consult, practical care steps, and warning signs.
                  </div>
                </div>
              </div>
            </div>

            <div className="patient-grid">
              {/* LEFT COLUMN: SYMPTOM INPUTS */}
              <section className="card">
                <div className="card-header">
                  <div>
                    <h2 className="card-title">Step 1: Select Patient Symptoms</h2>
                    <p className="card-subtitle">
                      Selected: <strong>{selectedSymptoms.length}</strong> of {symptomsCatalog.length} dataset symptoms
                    </p>
                  </div>
                  {(selectedSymptoms.length > 0 || unmatchedQuery) && (
                    <button
                      type="button"
                      className="example-pill"
                      onClick={() => {
                        setSelectedSymptoms([]);
                        setDiseaseResult(null);
                        setDescribeText('');
                        setDescribeMessage('');
                        setUnmatchedQuery('');
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="card-body">
                  {/* Quick Keyword Filter */}
                  <form className="describe-box" onSubmit={handleSymptomSearch}>
                    <label htmlFor="symptom-describe" className="describe-label">
                      Quick Symptom Search (Type how you feel):
                    </label>
                    <div className="describe-row">
                      <input
                        id="symptom-describe"
                        type="text"
                        className="describe-input"
                        placeholder="e.g., high fever, cough, headache, vomiting..."
                        value={describeText}
                        onChange={(e) => setDescribeText(e.target.value)}
                      />
                      <button type="submit" className="describe-btn">
                        Select Matching
                      </button>
                    </div>
                    {describeMessage && (
                      <p
                        style={{
                          fontSize: '0.76rem',
                          color: unmatchedQuery ? '#b91c1c' : '#1e40af',
                          marginTop: '0.45rem',
                          fontWeight: 600,
                        }}
                      >
                        {describeMessage}
                      </p>
                    )}
                  </form>

                  {/* Sample Cases from Dataset */}
                  <div className="quick-examples">
                    <span className="quick-label">Load Sample Patient Case from Dataset:</span>
                    <div className="example-pills">
                      {QUICK_SYMPTOM_PRESETS.map((ex) => (
                        <button
                          key={ex.name}
                          type="button"
                          className="example-pill"
                          onClick={() => {
                            setUnmatchedQuery('');
                            setDescribeMessage('');
                            setSelectedSymptoms(ex.symptoms);
                            setDiseaseResult(evaluateSymptomPipeline(ex.symptoms));
                          }}
                        >
                          {ex.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Symptom Checkboxes by Category */}
                  {Object.entries(groupedSymptoms).map(([category, items]) => (
                    <div className="symptom-category" key={category}>
                      <div className="symptom-cat-title">{category}</div>
                      <div className="symptom-grid">
                        {items.map((sym) => {
                          const isChecked = selectedSymptoms.includes(sym.id);
                          return (
                            <button
                              key={sym.id}
                              type="button"
                              className={`symptom-chip ${isChecked ? 'checked' : ''}`}
                              onClick={() => toggleSymptom(sym.id)}
                            >
                              <span className="chip-check">{isChecked ? '✓' : ''}</span>
                              <span>{sym.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* RIGHT COLUMN: MODEL PREDICTION & CARE PLAN */}
              <div>
                {unmatchedQuery ? (
                  <>
                    <section className="result-banner moderate">
                      <div className="result-top">
                        <div>
                          <div className="result-status-label">
                            Step 2 · Symptom Search Status
                          </div>
                          <h2 className="result-headline">
                            No Matching Symptoms Found for &ldquo;{unmatchedQuery}&rdquo;
                          </h2>
                        </div>
                        <div className="score-pill">
                          <div className="score-num">0</div>
                          <div className="score-caption">Matched Symptoms</div>
                        </div>
                      </div>

                      <p className="result-explanation">
                        The term <strong>&ldquo;{unmatchedQuery}&rdquo;</strong> did not match any symptom in our clinical dataset, so no condition can be predicted from that word alone.
                      </p>

                      <div
                        style={{
                          marginTop: '0.85rem',
                          padding: '0.65rem 0.85rem',
                          background: 'rgba(255,255,255,0.8)',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                        }}
                      >
                        <strong>Matched Dataset Symptoms (0):</strong> None — please tell us your symptoms using the checklist on the left.
                      </div>
                    </section>

                    <section className="card">
                      <div className="card-header">
                        <div>
                          <h2 className="card-title">Step 3: How to Tell Us Your Symptoms</h2>
                          <p className="card-subtitle">
                            Select from the supported symptoms on the left to get an accurate prediction
                          </p>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="next-steps-list">
                          <div className="action-item">
                            <span className="action-priority recommended">Option 1</span>
                            <div>
                              <div className="action-title">Tap the Symptom Checkboxes on the Left</div>
                              <p className="action-desc">
                                Browse the 4 body categories on the left (General, Head &amp; Throat, Chest &amp; Breathing, Stomach &amp; Thirst) and tap every symptom you are experiencing.
                              </p>
                            </div>
                          </div>
                          <div className="action-item">
                            <span className="action-priority good">Option 2</span>
                            <div>
                              <div className="action-title">Try Common Symptom Words in the Search Box</div>
                              <p className="action-desc">
                                Type simple symptom words such as <strong>high fever, cough, runny nose, headache, chest pain, dizziness, vomiting, diarrhea, frequent urination, or weight loss</strong>.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  </>
                ) : selectedSymptoms.length === 0 || !topDisease ? (
                  <>
                    <section className="result-banner" style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}>
                      <div className="result-top">
                        <div>
                          <div className="result-status-label" style={{ color: '#475569' }}>
                            Step 2 · Primary Predicted Condition
                          </div>
                          <h2 className="result-headline">
                            {loadingSymptomPred
                              ? 'Running Classification Model...'
                              : 'Tell Us Your Symptoms to Begin'}
                          </h2>
                        </div>
                        <div className="score-pill">
                          <div className="score-num">--%</div>
                          <div className="score-caption">Waiting for Input</div>
                        </div>
                      </div>

                      <p className="result-explanation">
                        No symptoms have been selected yet. Please select the symptoms you are experiencing on the left (or type how you feel in the search box) to see your predicted condition.
                      </p>

                      <div
                        style={{
                          marginTop: '0.85rem',
                          padding: '0.65rem 0.85rem',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          color: '#475569',
                        }}
                      >
                        <strong>Matched Dataset Symptoms (0):</strong> Waiting for you to select symptoms on the left.
                      </div>
                    </section>

                    <section className="card">
                      <div className="card-header">
                        <div>
                          <h2 className="card-title">Step 3: Recommended Care &amp; Next Steps</h2>
                          <p className="card-subtitle">
                            Your personalized care plan will appear here once you select your symptoms
                          </p>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="next-steps-list">
                          <div className="action-item">
                            <span className="action-priority good">Step 1</span>
                            <div>
                              <div className="action-title">Select Your Symptoms on the Left</div>
                              <p className="action-desc">
                                Tap any symptom buttons that apply to you (for example: <strong>High Fever</strong>, <strong>Cough</strong>, <strong>Headache</strong>, or <strong>Vomiting</strong>), or type them in the search box above.
                              </p>
                            </div>
                          </div>
                          <div className="action-item">
                            <span className="action-priority recommended">Step 2</span>
                            <div>
                              <div className="action-title">Or Test a Sample Patient Case</div>
                              <p className="action-desc">
                                Click any of the <strong>Sample Patient Case</strong> buttons on the left to load a real symptom profile from the dataset and see the prediction immediately.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  </>
                ) : (
                  <>
                    {/* Top Predicted Condition */}
                    <section
                      className={`result-banner ${
                        topDisease.id === 'Hypertension' || topDisease.id === 'Bronchial Asthma'
                          ? 'high'
                          : topDisease.id === 'Diabetes'
                          ? 'moderate'
                          : 'low'
                      }`}
                    >
                      <div className="result-top">
                        <div>
                          <div className="result-status-label">
                            Step 2 · Primary Predicted Condition
                          </div>
                          <h2 className="result-headline">{topDisease.name}</h2>
                        </div>
                        <div className="score-pill">
                          <div className="score-num">{topMatchPct}%</div>
                          <div className="score-caption">Model Probability</div>
                        </div>
                      </div>

                      <p className="result-explanation">{topDisease.short_desc}</p>

                      {topDisease.matched_symptoms && topDisease.matched_symptoms.length > 0 && (
                        <div
                          style={{
                            marginTop: '0.85rem',
                            padding: '0.65rem 0.85rem',
                            background: 'rgba(255,255,255,0.75)',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                          }}
                        >
                          <strong>Matched Dataset Symptoms ({topDisease.matched_symptoms.length}):</strong>{' '}
                          {topDisease.matched_symptoms.join(' • ')}
                        </div>
                      )}

                      {topDisease.id === 'Diabetes' && (
                        <div style={{ marginTop: '0.9rem' }}>
                          <button
                            type="button"
                            className="describe-btn"
                            onClick={() => setViewMode('diabetes')}
                          >
                            Open Diabetes Lab Assessment (Glucose &amp; BMI) →
                          </button>
                        </div>
                      )}
                    </section>

                    {/* Care Plan & Next Steps */}
                    <section className="card">
                      <div className="card-header">
                        <div>
                          <h2 className="card-title">
                            Step 3: Recommended Care &amp; Next Steps
                          </h2>
                          <p className="card-subtitle">
                            Practical guidance for {topDisease.name}
                          </p>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="next-steps-list">
                          <div className="action-item">
                            <span className="action-priority recommended">Specialist</span>
                            <div>
                              <div className="action-title">{topDisease.doctor_type}</div>
                              <p className="action-desc">{topDisease.urgency}</p>
                            </div>
                          </div>

                          {topDisease.what_to_do.map((tip, idx) => (
                            <div className="action-item" key={idx}>
                              <span className="action-priority good">Step {idx + 1}</span>
                              <div>
                                <p className="action-desc" style={{ marginTop: 0, fontWeight: 500 }}>
                                  {tip}
                                </p>
                              </div>
                            </div>
                          ))}

                          <div className="action-item">
                            <span className="action-priority urgent">Warning Signs</span>
                            <div>
                              <div className="action-title">When to Seek Immediate Medical Care</div>
                              <p className="action-desc">{topDisease.warning_signs}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Probability Distribution Across All 6 Conditions */}
                    <section className="card">
                      <div className="card-header">
                        <div>
                          <h2 className="card-title">Condition Probability Distribution</h2>
                          <p className="card-subtitle">
                            Model probability across all 6 conditions in the dataset
                          </p>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="disease-rank-list">
                          {diseaseResult.all_predictions.map((item) => {
                            const pct = Math.round(item.probability * 100);
                            return (
                              <div className="disease-rank-row" key={item.id}>
                                <div className="disease-rank-top">
                                  <span>{item.name}</span>
                                  <span>{pct}%</span>
                                </div>
                                <div className="disease-bar-bg">
                                  <div
                                    className="disease-bar-fill"
                                    style={{ width: `${Math.max(2, pct)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </section>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          /* ============================================================
             VIEW 2: DIABETES LAB ASSESSMENT (BLOOD SUGAR, BMI, BP)
             ============================================================ */
          <>
            <div className="steps-banner">
              <div className="step-card">
                <div className="step-num">1</div>
                <div>
                  <div className="step-title">Enter Clinical Measurements</div>
                  <div className="step-desc">
                    Enter your blood glucose, BMI (or height and weight), blood pressure, and age on the left.
                  </div>
                </div>
              </div>
              <div className="step-card">
                <div className="step-num">2</div>
                <div>
                  <div className="step-title">View Risk Classification</div>
                  <div className="step-desc">
                    See whether your measurements fall into Low, Borderline, or High Risk based on the Pima dataset.
                  </div>
                </div>
              </div>
              <div className="step-card">
                <div className="step-num">3</div>
                <div>
                  <div className="step-title">Review Action Plan</div>
                  <div className="step-desc">
                    Check which measurements are within healthy targets and which ones need attention.
                  </div>
                </div>
              </div>
            </div>

            <div className="patient-grid">
              <section className="card">
                <div className="card-header">
                  <div>
                    <h2 className="card-title">Step 1: Patient Lab Measurements</h2>
                    <p className="card-subtitle">
                      Adjust the sliders below or select a sample patient profile.
                    </p>
                  </div>
                </div>

                <div className="card-body">
                  <div className="quick-examples">
                    <span className="quick-label">Load Sample Patient Profile:</span>
                    <div className="example-pills">
                      {PATIENT_PROFILES.map((prof) => (
                        <button
                          key={prof.id}
                          type="button"
                          className={`example-pill ${activeProfile === prof.id ? 'active' : ''}`}
                          onClick={() => {
                            setActiveProfile(prof.id);
                            setInputs({ ...prof.values });
                          }}
                        >
                          {prof.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 1. Blood Sugar */}
                  <div className="input-group">
                    <div className="input-header">
                      <label htmlFor="in-plas" className="input-title">
                        1. Blood Sugar (Plasma Glucose)
                      </label>
                      <span className={`badge ${glucoseBadge.type}`}>{glucoseBadge.text}</span>
                    </div>
                    <p className="input-help">
                      2-hour oral glucose tolerance test level. Normal reference is below 140 mg/dL.
                    </p>
                    <div className="slider-with-box">
                      <input
                        type="range"
                        className="slider"
                        min="50"
                        max="240"
                        step="1"
                        value={inputs.plas}
                        onChange={(e) => updateInput('plas', e.target.value)}
                      />
                      <div className="number-box-wrap">
                        <input
                          id="in-plas"
                          type="number"
                          className="number-box"
                          min="50"
                          max="240"
                          value={inputs.plas}
                          onChange={(e) => updateInput('plas', e.target.value)}
                        />
                        <span className="unit-tag">mg/dL</span>
                      </div>
                    </div>
                    <div className="range-guide">
                      <span>Normal: 70–139</span>
                      <span>Borderline: 140–199</span>
                      <span>High: 200+</span>
                    </div>
                  </div>

                  {/* 2. BMI */}
                  <div className="input-group">
                    <div className="input-header">
                      <label htmlFor="in-mass" className="input-title">
                        2. Body Mass Index (BMI)
                      </label>
                      <span className={`badge ${bmiBadge.type}`}>{bmiBadge.text}</span>
                    </div>
                    <p className="input-help">
                      Weight relative to height.{' '}
                      <button
                        type="button"
                        onClick={() => setShowBmiCalc(!showBmiCalc)}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: '#0f4c81',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: '0.76rem',
                        }}
                      >
                        {showBmiCalc ? 'Hide BMI Calculator' : 'Calculate BMI from Height & Weight'}
                      </button>
                    </p>

                    {showBmiCalc && (
                      <div className="bmi-helper">
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                          Enter height and weight:
                        </div>
                        <div className="bmi-helper-grid">
                          <div className="mini-field">
                            <label htmlFor="calc-h">Height (cm)</label>
                            <input
                              id="calc-h"
                              type="number"
                              value={heightCm}
                              onChange={(e) => setHeightCm(e.target.value)}
                            />
                          </div>
                          <div className="mini-field">
                            <label htmlFor="calc-w">Weight (kg)</label>
                            <input
                              id="calc-w"
                              type="number"
                              value={weightKg}
                              onChange={(e) => setWeightKg(e.target.value)}
                            />
                          </div>
                          <button type="button" className="btn-small" onClick={applyBmiCalculation}>
                            Apply BMI
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="slider-with-box" style={{ marginTop: '0.45rem' }}>
                      <input
                        type="range"
                        className="slider"
                        min="15"
                        max="55"
                        step="0.1"
                        value={inputs.mass}
                        onChange={(e) => updateInput('mass', e.target.value)}
                      />
                      <div className="number-box-wrap">
                        <input
                          id="in-mass"
                          type="number"
                          className="number-box"
                          min="15"
                          max="55"
                          step="0.1"
                          value={inputs.mass}
                          onChange={(e) => updateInput('mass', e.target.value)}
                        />
                        <span className="unit-tag">kg/m²</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Age */}
                  <div className="input-group">
                    <div className="input-header">
                      <label htmlFor="in-age" className="input-title">
                        3. Patient Age
                      </label>
                      <span className="badge normal">{inputs.age} years</span>
                    </div>
                    <div className="slider-with-box">
                      <input
                        type="range"
                        className="slider"
                        min="21"
                        max="85"
                        step="1"
                        value={inputs.age}
                        onChange={(e) => updateInput('age', e.target.value)}
                      />
                      <div className="number-box-wrap">
                        <input
                          id="in-age"
                          type="number"
                          className="number-box"
                          min="21"
                          max="85"
                          value={inputs.age}
                          onChange={(e) => updateInput('age', e.target.value)}
                        />
                        <span className="unit-tag">yrs</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Blood Pressure */}
                  <div className="input-group">
                    <div className="input-header">
                      <label htmlFor="in-pres" className="input-title">
                        4. Diastolic Blood Pressure (Bottom Number)
                      </label>
                      <span className={`badge ${bpBadge.type}`}>{bpBadge.text}</span>
                    </div>
                    <div className="slider-with-box">
                      <input
                        type="range"
                        className="slider"
                        min="45"
                        max="120"
                        step="1"
                        value={inputs.pres}
                        onChange={(e) => updateInput('pres', e.target.value)}
                      />
                      <div className="number-box-wrap">
                        <input
                          id="in-pres"
                          type="number"
                          className="number-box"
                          min="45"
                          max="120"
                          value={inputs.pres}
                          onChange={(e) => updateInput('pres', e.target.value)}
                        />
                        <span className="unit-tag">mmHg</span>
                      </div>
                    </div>
                  </div>

                  {/* 5. Family History */}
                  <div className="input-group">
                    <div className="input-header">
                      <span className="input-title">5. Family History of Diabetes</span>
                    </div>
                    <div className="choice-grid">
                      {FAMILY_HISTORY_CHOICES.map((ch) => {
                        const isSelected = Math.abs(inputs.pedi - ch.value) < 0.15;
                        return (
                          <button
                            key={ch.label}
                            type="button"
                            className={`choice-btn ${isSelected ? 'selected' : ''}`}
                            onClick={() => updateInput('pedi', ch.value)}
                          >
                            <span className="choice-title">{ch.label}</span>
                            <span className="choice-sub">{ch.sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="advanced-toggle"
                    onClick={() => setShowAdvancedLabs(!showAdvancedLabs)}
                  >
                    <span>Optional: Additional Lab Measurements (Pregnancies, Insulin, Skinfold)</span>
                    <span>{showAdvancedLabs ? '▲ Hide' : '▼ Show'}</span>
                  </button>

                  {showAdvancedLabs && (
                    <div style={{ marginTop: '1rem', paddingTop: '0.5rem' }}>
                      <div className="input-group">
                        <div className="input-header">
                          <label htmlFor="in-preg" className="input-title">
                            Prior Pregnancies (0 if not applicable)
                          </label>
                        </div>
                        <div className="slider-with-box">
                          <input
                            type="range"
                            className="slider"
                            min="0"
                            max="15"
                            value={inputs.preg}
                            onChange={(e) => updateInput('preg', e.target.value)}
                          />
                          <div className="number-box-wrap">
                            <input
                              id="in-preg"
                              type="number"
                              className="number-box"
                              min="0"
                              max="15"
                              value={inputs.preg}
                              onChange={(e) => updateInput('preg', e.target.value)}
                            />
                            <span className="unit-tag">count</span>
                          </div>
                        </div>
                      </div>

                      <div className="input-group">
                        <div className="input-header">
                          <label htmlFor="in-insu" className="input-title">
                            2-Hour Serum Insulin (0 = unrecorded)
                          </label>
                        </div>
                        <div className="slider-with-box">
                          <input
                            type="range"
                            className="slider"
                            min="0"
                            max="400"
                            value={inputs.insu}
                            onChange={(e) => updateInput('insu', e.target.value)}
                          />
                          <div className="number-box-wrap">
                            <input
                              id="in-insu"
                              type="number"
                              className="number-box"
                              min="0"
                              max="400"
                              value={inputs.insu}
                              onChange={(e) => updateInput('insu', e.target.value)}
                            />
                            <span className="unit-tag">µU/mL</span>
                          </div>
                        </div>
                      </div>

                      <div className="input-group">
                        <div className="input-header">
                          <label htmlFor="in-skin" className="input-title">
                            Triceps Skinfold Thickness (0 = unrecorded)
                          </label>
                        </div>
                        <div className="slider-with-box">
                          <input
                            type="range"
                            className="slider"
                            min="0"
                            max="60"
                            value={inputs.skin}
                            onChange={(e) => updateInput('skin', e.target.value)}
                          />
                          <div className="number-box-wrap">
                            <input
                              id="in-skin"
                              type="number"
                              className="number-box"
                              min="0"
                              max="60"
                              value={inputs.skin}
                              onChange={(e) => updateInput('skin', e.target.value)}
                            />
                            <span className="unit-tag">mm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <div>
                <section className={`result-banner ${riskCategory}`}>
                  <div className="result-top">
                    <div>
                      <div className="result-status-label">Step 2 · Classification Result</div>
                      <h2 className="result-headline">{riskTitle}</h2>
                    </div>
                    <div className="score-pill">
                      <div className="score-num">{probPct}%</div>
                      <div className="score-caption">Model Probability</div>
                    </div>
                  </div>

                  <p className="result-explanation">{riskExplanation}</p>

                  <div className="meter-wrap">
                    <div className="meter-bar">
                      <div
                        className="meter-pin"
                        style={{ left: `${Math.min(98, Math.max(2, probPct))}%` }}
                      />
                    </div>
                    <div className="meter-labels">
                      <span>0% — Low Risk</span>
                      <span>30% — Borderline</span>
                      <span>50%+ — Positive Class</span>
                    </div>
                  </div>
                </section>

                <section className="card">
                  <div className="card-header">
                    <div>
                      <h2 className="card-title">Step 3: Recommended Next Steps</h2>
                      <p className="card-subtitle">
                        Guidance based on your clinical measurements
                      </p>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="next-steps-list">
                      {actionPlan.map((step, idx) => (
                        <div className="action-item" key={idx}>
                          <span className={`action-priority ${step.priority}`}>{step.badge}</span>
                          <div>
                            <div className="action-title">{step.title}</div>
                            <p className="action-desc">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
