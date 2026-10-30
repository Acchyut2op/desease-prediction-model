"""Train the Multi-Disease Symptom Classifier on the real Kaggle/Columbia CSV dataset."""
import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import Normalizer

BASE_DIR = Path(__file__).resolve().parent
RAW_CSV_PATH = BASE_DIR / "raw_symptom_dataset.csv"
CLEAN_CSV_PATH = BASE_DIR / "symptom_disease_dataset.csv"

# Target diseases from the real dataset (6 common conditions)
TARGET_DISEASES = [
    "Common Cold",
    "Diabetes",
    "Hypertension",
    "Migraine",
    "Gastroenteritis",
    "Bronchial Asthma",
]

# Human-friendly labels, body categories, and search keywords for the dataset's symptom columns
SYMPTOM_CATALOG = {
    # General & Whole Body
    "high_fever": {
        "label": "High Fever",
        "category": "General & Whole Body",
        "keywords": ["high fever", "fever", "temperature", "hot"],
    },
    "mild_fever": {
        "label": "Mild Fever",
        "category": "General & Whole Body",
        "keywords": ["mild fever", "low fever", "slight fever"],
    },
    "chills": {
        "label": "Chills & Shivering",
        "category": "General & Whole Body",
        "keywords": ["chills", "shivering", "cold"],
    },
    "fatigue": {
        "label": "Fatigue / Feeling Very Tired",
        "category": "General & Whole Body",
        "keywords": ["fatigue", "tired", "weak", "exhausted", "low energy"],
    },
    "lethargy": {
        "label": "Lethargy / Lack of Energy",
        "category": "General & Whole Body",
        "keywords": ["lethargy", "sluggish", "drowsy", "no energy"],
    },
    "malaise": {
        "label": "General Body Discomfort (Malaise)",
        "category": "General & Whole Body",
        "keywords": ["malaise", "unwell", "body discomfort", "feeling sick"],
    },
    "muscle_pain": {
        "label": "Muscle Pain / Body Aches",
        "category": "General & Whole Body",
        "keywords": ["muscle pain", "body ache", "aching muscles", "soreness"],
    },
    "weight_loss": {
        "label": "Unexplained Weight Loss",
        "category": "General & Whole Body",
        "keywords": ["weight loss", "losing weight", "thin"],
    },
    "obesity": {
        "label": "Overweight / Obesity",
        "category": "General & Whole Body",
        "keywords": ["obesity", "overweight", "heavy weight"],
    },
    "restlessness": {
        "label": "Restlessness / Trouble Relaxing",
        "category": "General & Whole Body",
        "keywords": ["restless", "restlessness", "uneasy"],
    },

    # Head, Eyes, Nose & Throat
    "headache": {
        "label": "Headache",
        "category": "Head, Eyes, Nose & Throat",
        "keywords": ["headache", "head pain", "throbbing head", "migraine"],
    },
    "continuous_sneezing": {
        "label": "Continuous Sneezing",
        "category": "Head, Eyes, Nose & Throat",
        "keywords": ["sneezing", "sneeze"],
    },
    "runny_nose": {
        "label": "Runny Nose",
        "category": "Head, Eyes, Nose & Throat",
        "keywords": ["runny nose", "nasal drip"],
    },
    "congestion": {
        "label": "Nasal Congestion / Stuffy Nose",
        "category": "Head, Eyes, Nose & Throat",
        "keywords": ["congestion", "stuffy nose", "blocked nose"],
    },
    "sinus_pressure": {
        "label": "Sinus Pressure (Around Eyes/Forehead)",
        "category": "Head, Eyes, Nose & Throat",
        "keywords": ["sinus", "sinus pressure", "face pressure"],
    },
    "throat_irritation": {
        "label": "Sore or Irritated Throat",
        "category": "Head, Eyes, Nose & Throat",
        "keywords": ["throat", "sore throat", "scratchy throat", "throat irritation"],
    },
    "loss_of_smell": {
        "label": "Loss of Smell",
        "category": "Head, Eyes, Nose & Throat",
        "keywords": ["smell", "loss of smell"],
    },
    "redness_of_eyes": {
        "label": "Red or Watery Eyes",
        "category": "Head, Eyes, Nose & Throat",
        "keywords": ["red eyes", "redness of eyes", "watery eyes"],
    },
    "blurred_and_distorted_vision": {
        "label": "Blurred or Distorted Vision",
        "category": "Head, Eyes, Nose & Throat",
        "keywords": ["blurred vision", "blurry", "vision", "sight"],
    },
    "visual_disturbances": {
        "label": "Visual Disturbances / Sensitivity to Light",
        "category": "Head, Eyes, Nose & Throat",
        "keywords": ["visual", "flashing lights", "aura", "bright light"],
    },
    "dizziness": {
        "label": "Dizziness / Lightheadedness",
        "category": "Head, Eyes, Nose & Throat",
        "keywords": ["dizzy", "dizziness", "lightheaded", "vertigo"],
    },
    "loss_of_balance": {
        "label": "Loss of Balance / Unsteadiness",
        "category": "Head, Eyes, Nose & Throat",
        "keywords": ["balance", "loss of balance", "unsteady"],
    },
    "lack_of_concentration": {
        "label": "Difficulty Concentrating",
        "category": "Head, Eyes, Nose & Throat",
        "keywords": ["concentration", "focus", "brain fog"],
    },
    "stiff_neck": {
        "label": "Stiff Neck",
        "category": "Head, Eyes, Nose & Throat",
        "keywords": ["stiff neck", "neck pain"],
    },
    "irritability": {
        "label": "Irritability / Mood Changes",
        "category": "Head, Eyes, Nose & Throat",
        "keywords": ["irritable", "irritability", "mood swings"],
    },

    # Chest & Breathing
    "cough": {
        "label": "Cough",
        "category": "Chest & Breathing",
        "keywords": ["cough", "coughing", "dry cough"],
    },
    "phlegm": {
        "label": "Phlegm / Mucus in Throat",
        "category": "Chest & Breathing",
        "keywords": ["phlegm", "mucus", "sputum"],
    },
    "mucoid_sputum": {
        "label": "Thick Mucus Cough (Mucoid Sputum)",
        "category": "Chest & Breathing",
        "keywords": ["mucoid", "thick mucus", "wheezing cough"],
    },
    "breathlessness": {
        "label": "Shortness of Breath (Breathlessness)",
        "category": "Chest & Breathing",
        "keywords": ["breathless", "breathlessness", "shortness of breath", "difficulty breathing"],
    },
    "chest_pain": {
        "label": "Chest Pain or Tightness",
        "category": "Chest & Breathing",
        "keywords": ["chest pain", "chest tightness", "heavy chest"],
    },
    "swelled_lymph_nodes": {
        "label": "Swollen Glands in Neck (Lymph Nodes)",
        "category": "Chest & Breathing",
        "keywords": ["lymph nodes", "swollen glands", "neck swelling"],
    },

    # Stomach, Thirst & Digestion
    "polyuria": {
        "label": "Frequent Urination (Polyuria)",
        "category": "Stomach, Thirst & Digestion",
        "keywords": ["frequent urination", "polyuria", "peeing a lot", "bathroom trips"],
    },
    "increased_appetite": {
        "label": "Increased Appetite / Constant Thirst",
        "category": "Stomach, Thirst & Digestion",
        "keywords": ["increased appetite", "thirsty", "thirst", "drinking water"],
    },
    "excessive_hunger": {
        "label": "Excessive Hunger",
        "category": "Stomach, Thirst & Digestion",
        "keywords": ["excessive hunger", "hungry", "always hungry"],
    },
    "irregular_sugar_level": {
        "label": "Irregular Blood Sugar Readings",
        "category": "Stomach, Thirst & Digestion",
        "keywords": ["sugar level", "high sugar", "blood sugar", "glucose"],
    },
    "vomiting": {
        "label": "Vomiting / Throwing Up",
        "category": "Stomach, Thirst & Digestion",
        "keywords": ["vomiting", "vomit", "throwing up", "nausea"],
    },
    "diarrhoea": {
        "label": "Diarrhea / Loose Motions",
        "category": "Stomach, Thirst & Digestion",
        "keywords": ["diarrhea", "diarrhoea", "loose motion", "watery stool"],
    },
    "dehydration": {
        "label": "Dehydration / Dry Mouth",
        "category": "Stomach, Thirst & Digestion",
        "keywords": ["dehydration", "dehydrated", "dry mouth"],
    },
    "sunken_eyes": {
        "label": "Sunken or Tired Eyes (From Fluid Loss)",
        "category": "Stomach, Thirst & Digestion",
        "keywords": ["sunken eyes", "dark circles", "fluid loss"],
    },
    "indigestion": {
        "label": "Indigestion / Stomach Upset",
        "category": "Stomach, Thirst & Digestion",
        "keywords": ["indigestion", "stomach upset", "acidity", "gas"],
    },
    "acidity": {
        "label": "Acidity / Heartburn",
        "category": "Stomach, Thirst & Digestion",
        "keywords": ["acidity", "heartburn", "acid reflux", "burning stomach"],
    },
    "family_history": {
        "label": "Family History of Chronic Illness",
        "category": "Stomach, Thirst & Digestion",
        "keywords": ["family history", "parents", "hereditary"],
    },
}

DISEASE_GUIDANCE = {
    "Common Cold": {
        "name": "Common Cold (Upper Respiratory Infection)",
        "short_desc": "A viral infection of the nose, sinus, and throat passages.",
        "urgency": "Mild to Moderate — Typically resolves within 5 to 7 days",
        "doctor_type": "General Physician / Family Doctor",
        "what_to_do": [
            "Get plenty of rest and drink warm fluids (water, clear broths, warm lemon water) to ease congestion.",
            "Gargle with warm salt water to soothe throat irritation and use steam inhalation for a stuffy nose.",
            "Consult a physician if high fever persists beyond 3 days or if chest pain develops.",
        ],
        "warning_signs": "Seek medical care if you develop severe shortness of breath, persistent high fever, or sharp chest pain.",
    },
    "Diabetes": {
        "name": "Diabetes (Hyperglycemia / Metabolic Disorder)",
        "short_desc": "A chronic metabolic condition characterized by elevated blood glucose levels and insulin resistance.",
        "urgency": "Important — Schedule a confirmatory lab blood test",
        "doctor_type": "General Physician or Endocrinologist / Diabetologist",
        "what_to_do": [
            "Schedule a Fasting Blood Glucose test and HbA1c test at a medical laboratory.",
            "Use the 'Diabetes Lab Assessment' tab above to evaluate your exact Glucose, BMI, and Blood Pressure numbers.",
            "Reduce sugary beverages and refined carbohydrates, stay hydrated with water, and walk 20–30 minutes daily.",
        ],
        "warning_signs": "Seek prompt medical care if you experience extreme thirst, rapid weight loss, blurry vision, or confusion.",
    },
    "Hypertension": {
        "name": "Hypertension (High Blood Pressure)",
        "short_desc": "Elevated arterial blood pressure placing extra strain on the heart and blood vessels.",
        "urgency": "High Priority — Measure blood pressure and consult a doctor",
        "doctor_type": "Cardiologist or General Physician",
        "what_to_do": [
            "Sit quietly for 5 minutes and measure your blood pressure using a calibrated cuff or at a clinic.",
            "Reduce dietary sodium (salt), avoid caffeine and tobacco, and rest if feeling dizzy.",
            "Schedule an appointment with a physician for blood pressure monitoring and cardiovascular evaluation.",
        ],
        "warning_signs": "If chest pain radiates to the arm or jaw, or you experience severe shortness of breath, seek emergency care immediately.",
    },
    "Migraine": {
        "name": "Migraine",
        "short_desc": "A recurrent neurological headache disorder often accompanied by visual changes and sensitivity.",
        "urgency": "Moderate — Manageable with rest and targeted treatment",
        "doctor_type": "General Physician or Neurologist",
        "what_to_do": [
            "Rest in a quiet, darkened room and apply a cool compress to your forehead or back of the neck.",
            "Stay hydrated with water and avoid bright screens, loud noises, and skipped meals.",
            "Consult a doctor for preventive or acute migraine medication if episodes recur.",
        ],
        "warning_signs": "Seek urgent care if a headache is sudden and severe, or is accompanied by high fever, stiff neck, or confusion.",
    },
    "Gastroenteritis": {
        "name": "Gastroenteritis (Stomach Flu / Digestive Infection)",
        "short_desc": "Inflammation of the stomach and intestines causing vomiting, diarrhea, and fluid loss.",
        "urgency": "Moderate — Priority is preventing dehydration with ORS",
        "doctor_type": "General Physician or Gastroenterologist",
        "what_to_do": [
            "Drink Oral Rehydration Solution (ORS), coconut water, or clear broths in small, frequent sips.",
            "Eat bland, easily digestible foods (rice, bananas, curd, toast) and avoid spicy, fried, or dairy-heavy meals.",
            "See a doctor if vomiting or diarrhea lasts longer than 24–48 hours.",
        ],
        "warning_signs": "Seek immediate care for severe dehydration (sunken eyes, inability to keep fluids down, dizziness on standing).",
    },
    "Bronchial Asthma": {
        "name": "Bronchial Asthma (Airway Inflammation)",
        "short_desc": "Narrowing and swelling of the airways with extra mucus, causing cough and breathlessness.",
        "urgency": "Important — Requires medical evaluation and inhaler guidance",
        "doctor_type": "Pulmonologist or General Physician",
        "what_to_do": [
            "Sit upright in a comfortable position and take slow, steady breaths; use a prescribed rescue inhaler if you have one.",
            "Move away from smoke, dust, cold air, or strong fumes that may trigger airway irritation.",
            "Consult a physician for lung function testing (spirometry) and an asthma action plan.",
        ],
        "warning_signs": "Seek emergency care immediately if breathlessness makes it hard to speak in full sentences or lips/fingertips turn bluish.",
    },
}


def train_symptom_model():
    print("Loading real symptom-disease dataset...")
    df = pd.read_csv(RAW_CSV_PATH)
    df = df.loc[:, ~df.columns.str.contains("^Unnamed")]
    df.columns = [c.strip() for c in df.columns]
    df["prognosis"] = df["prognosis"].astype(str).str.strip()

    # Filter to the 6 target diseases in the real dataset
    sub_df = df[df["prognosis"].isin(TARGET_DISEASES)].copy()

    # Keep only the active symptom columns for these diseases
    feature_cols = [c for c in SYMPTOM_CATALOG.keys() if c in sub_df.columns]
    clean_df = sub_df[feature_cols + ["prognosis"]].copy()
    clean_df.to_csv(CLEAN_CSV_PATH, index=False)

    X = clean_df[feature_cols].astype(int)
    y = clean_df["prognosis"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # L2-normalized Multinomial Logistic Regression so partial symptom selections (2-6 symptoms)
    # and full symptom selections are scaled to unit length and classified accurately
    clf = make_pipeline(
        Normalizer(norm="l2"),
        LogisticRegression(max_iter=1000, C=5.0, random_state=42),
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Real Dataset Symptom Model Trained!")
    print(f"Dataset shape: {clean_df.shape} | Test Accuracy: {acc * 100:.2f}%")

    joblib.dump(clf, BASE_DIR / "symptom_model.pkl")

    # Build symptom list with real dataset prevalence per disease
    symptoms_list = []
    for col in feature_cols:
        info = SYMPTOM_CATALOG[col]
        symptoms_list.append({
            "id": col,
            "label": info["label"],
            "category": info["category"],
            "keywords": info["keywords"],
        })

    # Compute which symptoms are empirically associated with each disease in the real dataset
    disease_symptom_map = {}
    for d_name in TARGET_DISEASES:
        d_rows = clean_df[clean_df["prognosis"] == d_name][feature_cols]
        prevalence = d_rows.mean()
        active_syms = [col for col, val in prevalence.items() if val > 0.05]
        disease_symptom_map[d_name] = active_syms

    lr_step = clf.named_steps["logisticregression"]
    classes_list = [str(c) for c in lr_step.classes_]
    coef_matrix = [[round(float(v), 6) for v in row] for row in lr_step.coef_]
    intercept_list = [round(float(v), 6) for v in lr_step.intercept_]

    metadata = {
        "algorithm": "Multinomial Logistic Regression (Scikit-Learn)",
        "dataset_file": "symptom_disease_dataset.csv",
        "total_records": int(len(clean_df)),
        "train_records": int(len(X_train)),
        "test_records": int(len(X_test)),
        "num_features": int(len(feature_cols)),
        "num_classes": int(len(TARGET_DISEASES)),
        "test_accuracy": round(float(acc), 4),
        "feature_columns": feature_cols,
        "classes": classes_list,
        "coef": coef_matrix,
        "intercept": intercept_list,
        "symptoms": symptoms_list,
        "diseases": DISEASE_GUIDANCE,
        "disease_symptom_map": disease_symptom_map,
    }

    with open(BASE_DIR / "symptom_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    src_dir = BASE_DIR / "src"
    if src_dir.exists():
        with open(src_dir / "symptom_weights.json", "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

    return clf, metadata


if __name__ == "__main__":
    train_symptom_model()
