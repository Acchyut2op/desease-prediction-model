import json
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import uvicorn
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import FileResponse, JSONResponse
from starlette.routing import Mount, Route
from starlette.staticfiles import StaticFiles

from diabetes_model import FEATURE_COLUMNS, ZERO_AS_MISSING_COLS, clean_features, train_and_save
from symptom_model import CLEAN_CSV_PATH, DISEASE_GUIDANCE, train_symptom_model

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "diabetes_model.pkl"
METADATA_PATH = BASE_DIR / "model_metadata.json"
SYMPTOM_MODEL_PATH = BASE_DIR / "symptom_model.pkl"
SYMPTOM_META_PATH = BASE_DIR / "symptom_metadata.json"
FRONTEND_DIST = (
    BASE_DIR / "dist"
    if (BASE_DIR / "dist").exists()
    else BASE_DIR / "frontend" / "dist"
)

# Ensure models and metadata exist
if not MODEL_PATH.exists() or not METADATA_PATH.exists():
    train_and_save()

if not SYMPTOM_MODEL_PATH.exists() or not SYMPTOM_META_PATH.exists() or not CLEAN_CSV_PATH.exists():
    train_symptom_model()

model = joblib.load(MODEL_PATH)
with open(METADATA_PATH, "r", encoding="utf-8") as f:
    model_metadata = json.load(f)

symptom_clf = joblib.load(SYMPTOM_MODEL_PATH)
with open(SYMPTOM_META_PATH, "r", encoding="utf-8") as f:
    symptom_metadata = json.load(f)

CLINICAL_FEATURES = [
    {
        "key": "plas",
        "label": "Plasma Glucose (2-hr OGTT)",
        "short_label": "Glucose",
        "unit": "mg/dL",
        "category": "Glycemic & Metabolic",
        "min": 40,
        "max": 250,
        "step": 1,
        "default": 118,
        "normal_range": [70, 139],
        "borderline_range": [140, 199],
        "description": "2-hour plasma glucose concentration during an oral glucose tolerance test.",
        "reference_note": "< 140 mg/dL normal · 140–199 mg/dL impaired glucose tolerance · ≥ 200 mg/dL diabetic threshold",
    },
    {
        "key": "mass",
        "label": "Body Mass Index (BMI)",
        "short_label": "BMI",
        "unit": "kg/m²",
        "category": "Glycemic & Metabolic",
        "min": 15.0,
        "max": 60.0,
        "step": 0.1,
        "default": 28.4,
        "normal_range": [18.5, 24.9],
        "borderline_range": [25.0, 29.9],
        "description": "Weight in kilograms divided by height in meters squared.",
        "reference_note": "18.5–24.9 kg/m² normal · 25.0–29.9 kg/m² overweight · ≥ 30.0 kg/m² obesity",
    },
    {
        "key": "insu",
        "label": "2-Hour Serum Insulin",
        "short_label": "Serum Insulin",
        "unit": "µU/mL",
        "category": "Glycemic & Metabolic",
        "min": 0,
        "max": 600,
        "step": 1,
        "default": 95,
        "normal_range": [16, 166],
        "borderline_range": [167, 240],
        "description": "2-hour post-load serum insulin level (enter 0 if unmeasured to use cohort median).",
        "reference_note": "16–166 µU/mL typical 2-hr post-challenge range · 0 = unrecorded (imputed)",
    },
    {
        "key": "pres",
        "label": "Diastolic Blood Pressure",
        "short_label": "Diastolic BP",
        "unit": "mmHg",
        "category": "Hemodynamic & Anthropometric",
        "min": 35,
        "max": 130,
        "step": 1,
        "default": 72,
        "normal_range": [60, 79],
        "borderline_range": [80, 89],
        "description": "Resting brachial diastolic arterial blood pressure.",
        "reference_note": "< 80 mmHg normal · 80–89 mmHg stage 1 hypertension · ≥ 90 mmHg stage 2",
    },
    {
        "key": "skin",
        "label": "Triceps Skinfold Thickness",
        "short_label": "Skinfold",
        "unit": "mm",
        "category": "Hemodynamic & Anthropometric",
        "min": 0,
        "max": 75,
        "step": 1,
        "default": 26,
        "normal_range": [10, 30],
        "borderline_range": [31, 40],
        "description": "Subcutaneous fat fold thickness measured at the posterior midpoint of the upper arm.",
        "reference_note": "12–28 mm typical adult reference · 0 = unrecorded (imputed)",
    },
    {
        "key": "age",
        "label": "Patient Age",
        "short_label": "Age",
        "unit": "years",
        "category": "History & Demographics",
        "min": 21,
        "max": 90,
        "step": 1,
        "default": 34,
        "normal_range": [21, 44],
        "borderline_range": [45, 64],
        "description": "Chronological age in years (cohort includes subjects aged 21 years and older).",
        "reference_note": "ADA recommends universal screening starting at age 35",
    },
    {
        "key": "pedi",
        "label": "Diabetes Pedigree Function",
        "short_label": "Pedigree Index",
        "unit": "score",
        "category": "History & Demographics",
        "min": 0.08,
        "max": 2.40,
        "step": 0.01,
        "default": 0.42,
        "normal_range": [0.08, 0.50],
        "borderline_range": [0.51, 0.85],
        "description": "Composite genetic likelihood score derived from first- and second-degree family history and age of onset.",
        "reference_note": "Cohort median 0.38 · > 0.64 represents top quartile familial predisposition",
    },
    {
        "key": "preg",
        "label": "Prior Pregnancies",
        "short_label": "Pregnancies",
        "unit": "count",
        "category": "History & Demographics",
        "min": 0,
        "max": 17,
        "step": 1,
        "default": 1,
        "normal_range": [0, 3],
        "borderline_range": [4, 6],
        "description": "Total number of past pregnancies (parity factor in Pima cohort; set to 0 if not applicable).",
        "reference_note": "Cohort range 0–17 · median 3",
    },
]

CLINICAL_PRESETS = [
    {
        "id": "normoglycemic",
        "name": "Normoglycemic Baseline",
        "summary": "29yo with normal OGTT glucose (102 mg/dL) and healthy BMI (23.4 kg/m²)",
        "values": {
            "preg": 1,
            "plas": 102,
            "pres": 68,
            "skin": 21,
            "insu": 78,
            "mass": 23.4,
            "pedi": 0.28,
            "age": 29,
        },
    },
    {
        "id": "borderline_igt",
        "name": "Impaired Glucose Tolerance",
        "summary": "46yo with borderline 2-hr OGTT (144 mg/dL) and overweight BMI (29.8 kg/m²)",
        "values": {
            "preg": 3,
            "plas": 144,
            "pres": 78,
            "skin": 31,
            "insu": 145,
            "mass": 29.8,
            "pedi": 0.52,
            "age": 46,
        },
    },
    {
        "id": "metabolic_syndrome",
        "name": "High-Risk Metabolic Profile",
        "summary": "54yo with elevated post-load glucose (178 mg/dL), BMI 36.2 kg/m², strong family history",
        "values": {
            "preg": 5,
            "plas": 178,
            "pres": 88,
            "skin": 38,
            "insu": 215,
            "mass": 36.2,
            "pedi": 0.89,
            "age": 54,
        },
    },
    {
        "id": "unrecorded_labs",
        "name": "Partial Lab Panel (Imputed)",
        "summary": "38yo where serum insulin and skinfold were not collected (0 → median imputed)",
        "values": {
            "preg": 2,
            "plas": 131,
            "pres": 74,
            "skin": 0,
            "insu": 0,
            "mass": 31.0,
            "pedi": 0.44,
            "age": 38,
        },
    },
]


def evaluate_clinical_status(key: str, val: float, imputed: bool) -> str:
    if imputed:
        return "Imputed"
    meta = next((item for item in CLINICAL_FEATURES if item["key"] == key), None)
    if not meta:
        return "Normal"
    low_norm, high_norm = meta["normal_range"]
    _, high_bord = meta["borderline_range"]
    if val < low_norm:
        return "Below Reference"
    if val <= high_norm:
        return "Within Reference"
    if val <= high_bord:
        return "Borderline"
    return "Elevated"


def compute_prediction_details(raw_payload: dict) -> dict:
    row = {}
    for col in FEATURE_COLUMNS:
        if col not in raw_payload:
            raise ValueError(f"Missing required parameter: '{col}'")
        val = float(raw_payload[col])
        if np.isnan(val) or np.isinf(val):
            raise ValueError(f"Invalid numeric value for '{col}'")
        row[col] = val

    raw_df = pd.DataFrame([row])
    cleaned_df = clean_features(raw_df)

    # Prediction and probability
    pred_class = int(model.predict(cleaned_df)[0])
    proba = float(model.predict_proba(cleaned_df)[0][1])

    # Extract pipeline steps for exact feature attribution
    imputer = model.named_steps["simpleimputer"]
    scaler = model.named_steps["standardscaler"]
    clf = model.named_steps["logisticregression"]

    imputed_values = imputer.transform(cleaned_df)[0]
    scaled_values = scaler.transform([imputed_values])[0]
    coefs = clf.coef_[0]
    intercept = float(clf.intercept_[0])
    log_odds = float(intercept + np.dot(scaled_values, coefs))

    contributions = []
    for idx, col in enumerate(FEATURE_COLUMNS):
        feat_meta = next(item for item in CLINICAL_FEATURES if item["key"] == col)
        is_imputed = col in ZERO_AS_MISSING_COLS and row[col] == 0.0
        eff_val = float(imputed_values[idx])
        z_val = float(scaled_values[idx])
        coef = float(coefs[idx])
        impact = float(z_val * coef)

        contributions.append({
            "key": col,
            "label": feat_meta["label"],
            "short_label": feat_meta["short_label"],
            "unit": feat_meta["unit"],
            "category": feat_meta["category"],
            "raw_value": round(row[col], 3),
            "effective_value": round(eff_val, 3),
            "imputed": is_imputed,
            "cohort_median": model_metadata["feature_stats"][col]["median"],
            "cohort_mean": model_metadata["feature_stats"][col]["mean"],
            "cohort_iqr": [
                model_metadata["feature_stats"][col]["p25"],
                model_metadata["feature_stats"][col]["p75"],
            ],
            "z_score": round(z_val, 3),
            "coefficient": round(coef, 4),
            "log_odds_impact": round(impact, 4),
            "clinical_status": evaluate_clinical_status(col, eff_val, is_imputed),
            "normal_range": feat_meta["normal_range"],
        })

    # Sort contributions by magnitude of log-odds impact
    contributions_sorted = sorted(
        contributions, key=lambda x: abs(x["log_odds_impact"]), reverse=True
    )

    # Sensitivity curve for Plasma Glucose (70 to 220 mg/dL) holding patient's other features fixed
    glucose_grid = list(range(70, 225, 10))
    grid_rows = []
    for g in glucose_grid:
        r = cleaned_df.iloc[0].to_dict()
        r["plas"] = float(g)
        grid_rows.append(r)
    grid_df = pd.DataFrame(grid_rows)[FEATURE_COLUMNS]
    grid_probs = model.predict_proba(grid_df)[:, 1]
    glucose_curve = [
        {"glucose": int(g), "probability": round(float(p), 4)}
        for g, p in zip(glucose_grid, grid_probs)
    ]

    if proba < 0.30:
        risk_tier = "Low"
        risk_summary = "Below decision boundary; low estimated probability relative to cohort baseline."
    elif proba < 0.50:
        risk_tier = "Moderate (Sub-threshold)"
        risk_summary = "Below 0.50 binary threshold, but approaching borderline risk zone."
    elif proba < 0.70:
        risk_tier = "Elevated (Positive Class)"
        risk_summary = "Exceeds 0.50 classification threshold; multiple glycemic/metabolic indicators elevated."
    else:
        risk_tier = "High (Positive Class)"
        risk_summary = "Strongly elevated probability driven by primary glycemic and anthropometric factors."

    return {
        "prediction": pred_class,
        "label": "Positive (Class 1)" if pred_class == 1 else "Negative (Class 0)",
        "probability": round(proba, 4),
        "threshold": 0.50,
        "risk_tier": risk_tier,
        "risk_summary": risk_summary,
        "log_odds": round(log_odds, 4),
        "intercept": round(intercept, 4),
        "contributions": contributions_sorted,
        "glucose_sensitivity": glucose_curve,
    }


async def health_endpoint(request: Request) -> JSONResponse:
    return JSONResponse({"status": "ok", "model_loaded": model is not None})


async def model_info_endpoint(request: Request) -> JSONResponse:
    return JSONResponse({
        "metadata": model_metadata,
        "features": CLINICAL_FEATURES,
        "presets": CLINICAL_PRESETS,
    })


async def predict_endpoint(request: Request) -> JSONResponse:
    try:
        payload = await request.json()
    except Exception:
        return JSONResponse({"error": "Request body must be valid JSON."}, status_code=400)

    try:
        result = compute_prediction_details(payload)
        return JSONResponse(result)
    except ValueError as err:
        return JSONResponse({"error": str(err)}, status_code=422)
    except Exception as err:
        return JSONResponse({"error": f"Prediction failed: {err}"}, status_code=500)


async def symptoms_info_endpoint(request: Request) -> JSONResponse:
    return JSONResponse(symptom_metadata)


async def predict_disease_endpoint(request: Request) -> JSONResponse:
    try:
        payload = await request.json()
    except Exception:
        return JSONResponse({"error": "Request body must be valid JSON."}, status_code=400)

    selected = set(payload.get("symptoms", []))
    feature_cols = symptom_metadata["feature_columns"]
    symptoms_list = symptom_metadata["symptoms"]
    disease_symptom_map = symptom_metadata["disease_symptom_map"]

    row = [{col: (1 if col in selected else 0) for col in feature_cols}]
    df_row = pd.DataFrame(row, columns=feature_cols)

    probs = symptom_clf.predict_proba(df_row)[0]
    classes = list(symptom_clf.classes_)

    ranked = sorted(
        zip(classes, probs), key=lambda item: item[1], reverse=True
    )

    predictions = []
    for d_key, prob in ranked:
        d_info = DISEASE_GUIDANCE[d_key]
        active_for_disease = set(disease_symptom_map.get(d_key, []))
        matched_symptoms = [
            s["label"]
            for s in symptoms_list
            if s["id"] in selected and s["id"] in active_for_disease
        ]
        predictions.append({
            "id": d_key,
            "name": d_info["name"],
            "probability": round(float(prob), 4),
            "short_desc": d_info["short_desc"],
            "urgency": d_info["urgency"],
            "doctor_type": d_info["doctor_type"],
            "what_to_do": d_info["what_to_do"],
            "warning_signs": d_info["warning_signs"],
            "matched_symptoms": matched_symptoms,
        })

    return JSONResponse({
        "selected_count": len(selected),
        "top_prediction": predictions[0],
        "all_predictions": predictions,
    })


async def spa_fallback(request: Request):
    index_file = FRONTEND_DIST / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return JSONResponse(
        {
            "message": "DiagnoSense API is running. Start the React frontend or run `npm run build` in ./frontend.",
            "endpoints": [
                "/api/health",
                "/api/model-info",
                "/api/predict",
                "/api/symptoms-info",
                "/api/predict-disease",
            ],
        }
    )


routes = [
    Route("/api/health", health_endpoint, methods=["GET"]),
    Route("/api/model-info", model_info_endpoint, methods=["GET"]),
    Route("/api/predict", predict_endpoint, methods=["POST"]),
    Route("/api/symptoms-info", symptoms_info_endpoint, methods=["GET"]),
    Route("/api/predict-disease", predict_disease_endpoint, methods=["POST"]),
]

if (FRONTEND_DIST / "assets").exists():
    routes.append(
        Mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")
    )

routes.append(Route("/{path:path}", spa_fallback, methods=["GET"]))
routes.append(Route("/", spa_fallback, methods=["GET"]))

app = Starlette(
    debug=False,
    routes=routes,
    middleware=[
        Middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_methods=["*"],
            allow_headers=["*"],
        )
    ],
)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8005))
    print(f"Starting DiagnoSense server on http://localhost:{port}")
    uvicorn.run(app, host="127.0.0.1", port=port)
