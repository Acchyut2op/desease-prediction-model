# DiagnoSense — Disease & Diabetes Prediction System

A full-stack Machine Learning web application built with **Scikit-Learn**, **Python (Starlette/Uvicorn)**, and **React.js (Vite)** for clinical symptom-based disease classification and diabetes biomarker risk estimation.

## Datasets & Machine Learning Models

1. **Multi-Disease Symptom Classification (`symptom_model.py` / `symptom_disease_dataset.csv`)**
   - **Dataset:** Extracted from the Columbia/Kaggle Disease-Symptom dataset (`720` patient records across `42` clinical symptom features and `6` conditions: *Common Cold*, *Diabetes*, *Hypertension*, *Migraine*, *Gastroenteritis*, and *Bronchial Asthma*).
   - **Pipeline:** `Normalizer(norm="l2")` + `LogisticRegression` saved to `symptom_model.pkl`.

2. **Diabetes Clinical Biomarker Model (`diabetes_model.py` / `diabetes_dataset.csv`)**
   - **Dataset:** Pima Indians Diabetes Database (`768` clinical records across `8` biomarkers: Plasma Glucose, BMI, Diastolic Blood Pressure, Age, Diabetes Pedigree Function, Prior Pregnancies, Serum Insulin, and Triceps Skinfold Thickness).
   - **Pipeline:** Zero-as-missing clinical imputation (`SimpleImputer(strategy="median")`) + `StandardScaler` + `LogisticRegression` saved to `diabetes_model.pkl`.

## Project Structure

- `app.py` — Python REST API backend (`/api/symptoms-info`, `/api/predict-disease`, `/api/model-info`, `/api/predict`)
- `symptom_model.py` — Trains and saves `symptom_model.pkl` and `symptom_metadata.json` from `symptom_disease_dataset.csv`
- `diabetes_model.py` — Trains and saves `diabetes_model.pkl` and `model_metadata.json` from `diabetes_dataset.csv`
- `src/App.jsx` & `src/App.css` — React.js frontend interface
- `test1.py` — End-to-end automated verification suite for both ML models

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
npm install
```

### 2. Run the Application
Run `start.bat` on Windows, or start the backend and frontend servers:
```bash
# Terminal 1: Start Python API Server
python app.py

# Terminal 2: Start React Development Server
npm run dev
```

