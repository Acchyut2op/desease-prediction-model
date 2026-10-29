"""End-to-end verification tests for both trained ML models on real CSV datasets."""
import pandas as pd
from app import CLINICAL_PRESETS, compute_prediction_details, symptom_clf, symptom_metadata


def run_tests():
    print("--- Testing Diabetes Clinical Biomarker Model (Pima Dataset) ---")
    for preset in CLINICAL_PRESETS:
        res = compute_prediction_details(preset["values"])
        assert res["prediction"] in (0, 1)
        assert 0.0 <= res["probability"] <= 1.0
        print(
            f"[PASS] {preset['name']:<28} | Class: {res['prediction']} | "
            f"Prob: {res['probability']*100:5.1f}%"
        )

    print("\n--- Testing Multi-Disease Symptom Classifier (Real Kaggle CSV Dataset) ---")
    feature_cols = symptom_metadata["feature_columns"]
    test_cases = {
        "Common Cold": ["continuous_sneezing", "chills", "fatigue", "cough", "high_fever", "runny_nose", "congestion"],
        "Diabetes": ["fatigue", "weight_loss", "polyuria", "increased_appetite", "excessive_hunger", "blurred_and_distorted_vision"],
        "Hypertension": ["headache", "chest_pain", "dizziness", "loss_of_balance", "lack_of_concentration"],
        "Migraine": ["headache", "acidity", "indigestion", "blurred_and_distorted_vision", "stiff_neck", "visual_disturbances"],
        "Gastroenteritis": ["vomiting", "sunken_eyes", "dehydration", "diarrhoea"],
        "Bronchial Asthma": ["fatigue", "cough", "high_fever", "breathlessness", "mucoid_sputum"],
    }

    for expected_disease, syms in test_cases.items():
        row = [{col: (1 if col in syms else 0) for col in feature_cols}]
        df_row = pd.DataFrame(row, columns=feature_cols)
        pred = symptom_clf.predict(df_row)[0]
        prob = max(symptom_clf.predict_proba(df_row)[0])
        assert pred == expected_disease, f"Expected {expected_disease}, got {pred}"
        print(f"[PASS] Expected: {expected_disease:<18} | Predicted: {pred:<18} | Prob: {prob*100:5.1f}%")


if __name__ == "__main__":
    run_tests()
