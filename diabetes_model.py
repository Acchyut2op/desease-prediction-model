import json
import joblib
import numpy as np
import pandas as pd
from sklearn.datasets import fetch_openml
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

# Features where 0 represents an unrecorded/missing clinical measurement
ZERO_AS_MISSING_COLS = ["plas", "pres", "skin", "insu", "mass"]
FEATURE_COLUMNS = ["preg", "plas", "pres", "skin", "insu", "mass", "pedi", "age"]


def clean_features(df: pd.DataFrame) -> pd.DataFrame:
    """Replace biologically invalid 0 values with NaN for clinical columns."""
    cleaned = df[FEATURE_COLUMNS].copy().astype(float)
    for col in ZERO_AS_MISSING_COLS:
        cleaned[col] = cleaned[col].replace(0.0, np.nan)
    return cleaned


def train_and_save():
    # 1. Load diabetes dataset from local CSV (or OpenML fallback)
    print("Loading dataset...")
    csv_path = "diabetes_dataset.csv"
    try:
        df = pd.read_csv(csv_path)
        X = df[FEATURE_COLUMNS]
        y = df["class"]
    except Exception:
        data = fetch_openml(name="diabetes", version=1, as_frame=True)
        data.frame.to_csv(csv_path, index=False)
        X = data.data
        y = data.target

    # 2. Convert target into binary labels
    y = y.astype(str).str.strip().str.lower()
    y = y.map({"tested_positive": 1, "tested_negative": 0})

    # Remove rows with unknown target labels, if any
    valid = y.notna()
    X = clean_features(X.loc[valid])
    y = y.loc[valid].astype(int)

    print("Dataset loaded!")
    print("Total records:", len(X))

    # 3. Split into training and testing data
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    # 4. Create and train the model
    model = make_pipeline(
        SimpleImputer(strategy="median"),
        StandardScaler(),
        LogisticRegression(max_iter=1000, random_state=42),
    )

    print("Training model...")
    model.fit(X_train, y_train)

    # 5. Evaluate on unseen test data
    predictions = model.predict(X_test)
    probabilities = model.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(y_test, predictions)
    roc_auc = roc_auc_score(y_test, probabilities)
    precision = precision_score(y_test, predictions)
    recall = recall_score(y_test, predictions)
    f1 = f1_score(y_test, predictions)
    tn, fp, fn, tp = confusion_matrix(y_test, predictions).ravel()

    print("\nModel training complete!")
    print(f"Test accuracy: {accuracy * 100:.2f}%")
    print(f"ROC-AUC:       {roc_auc:.4f}")
    print("Training records:", len(X_train))
    print("Testing records:", len(X_test))

    # Save the trained model
    joblib.dump(model, "diabetes_model.pkl")

    # Save model metrics and distribution metadata for the API/UI
    imputer = model.named_steps["simpleimputer"]
    scaler = model.named_steps["standardscaler"]
    clf = model.named_steps["logisticregression"]

    feature_stats = {}
    for idx, col in enumerate(FEATURE_COLUMNS):
        col_series = X_train[col].dropna()
        feature_stats[col] = {
            "median": round(float(imputer.statistics_[idx]), 3),
            "mean": round(float(scaler.mean_[idx]), 3),
            "std": round(float(scaler.scale_[idx]), 3),
            "p25": round(float(col_series.quantile(0.25)), 3),
            "p75": round(float(col_series.quantile(0.75)), 3),
            "min": round(float(col_series.min()), 3),
            "max": round(float(col_series.max()), 3),
            "coefficient": round(float(clf.coef_[0][idx]), 4),
        }

    metadata = {
        "algorithm": "Logistic Regression (L2 Regularized)",
        "dataset": "Pima Indians Diabetes Database (OpenML v1)",
        "total_records": int(len(X)),
        "train_records": int(len(X_train)),
        "test_records": int(len(X_test)),
        "positive_prevalence": round(float(y.mean()), 4),
        "intercept": round(float(clf.intercept_[0]), 4),
        "metrics": {
            "accuracy": round(float(accuracy), 4),
            "roc_auc": round(float(roc_auc), 4),
            "precision": round(float(precision), 4),
            "recall": round(float(recall), 4),
            "f1": round(float(f1), 4),
            "confusion_matrix": {
                "tn": int(tn),
                "fp": int(fp),
                "fn": int(fn),
                "tp": int(tp),
            },
        },
        "feature_stats": feature_stats,
    }

    with open("model_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("Model and metadata saved successfully!")


if __name__ == "__main__":
    train_and_save()
