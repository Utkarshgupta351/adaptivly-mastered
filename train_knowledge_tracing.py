#!/usr/bin/env python3
"""train_knowledge_tracing.py

Standalone script that trains a Random Forest classifier to predict a student's next
programming‑exercise difficulty tier using a public computer‑science student
submission dataset (Project CodeNet).  The script demonstrates the preprocessing
steps required for the *Results* section of a research paper.

Features engineered per submission:
  * ``past_accuracy`` – proportion of correct submissions for the same student
    before the current event.
  * ``avg_runtime_ms`` – average runtime (ms) of the student's previous
    submissions.
  * ``current_difficulty`` – numeric encoding of the problem difficulty tier
    (Easy=0, Medium=1, Hard=2).

The target is the difficulty tier of the *next* submission (multi‑class
classification).  A chronological split per student is used to avoid data
leakage.

Metrics printed:
  * Accuracy
  * Precision (macro‑averaged)
  * F1‑Score (macro‑averaged)
  * ROC‑AUC (macro‑averaged, One‑vs‑Rest)

The trained model is persisted to ``adaptive_model.pkl`` using ``joblib``.
"""

import os
import sys
from pathlib import Path
from typing import List

import numpy as np
import pandas as pd
from datasets import load_dataset
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelBinarizer
import joblib

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
DATASET_NAME = "petersa2/CodeNet"  # Updated to community CodeNet subset
DATA_SPLIT = "train"  # the full split contains all submissions
MODEL_PATH = Path(__file__).with_name("adaptive_model.pkl")
RANDOM_STATE = 42

# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def load_codenet() -> pd.DataFrame:
    """Load Project CodeNet and return a DataFrame with a small subset of columns.

    The HuggingFace version contains the following useful fields (among others):
        - ``submission_id``
        - ``problem_id``
        - ``user_id`` (anonymised student identifier)
        - ``verdict`` (e.g. "Accepted", "Wrong Answer", ...)
        - ``runtime`` (seconds as float)
        - ``difficulty`` (categorical: "Easy", "Medium", "Hard")

    For the purpose of the demo we keep only the columns needed for feature
    engineering.  The function returns a ``pandas.DataFrame`` sorted by
    ``user_id`` and ``submission_id`` (chronological order).
    """
    ds = load_dataset(DATASET_NAME, split=DATA_SPLIT)
    df = pd.DataFrame(ds)
    # Keep only necessary columns and rename for clarity
    required = [
        "submission_id",
        "problem_id",
        "user_id",
        "verdict",
        "runtime",
        "difficulty",
    ]
    df = df[required]
    # Ensure chronological order (submission_id is monotonic per user)
    df = df.sort_values(["user_id", "submission_id"]).reset_index(drop=True)
    return df


def encode_difficulty(diff: str) -> int:
    """Map difficulty strings to integers.

    Expected values are ``"Easy"``, ``"Medium"`` and ``"Hard"``.
    Unknown values default to ``-1`` which later get filtered out.
    """
    mapping = {"Easy": 0, "Medium": 1, "Hard": 2}
    return mapping.get(diff, -1)


def preprocess(df: pd.DataFrame) -> pd.DataFrame:
    """Create feature columns and the target column.

    The steps are:
        1. Encode ``difficulty`` as an integer.
        2. Compute ``past_accuracy`` – cumulative correct rate *before* the row.
        3. Compute ``avg_runtime_ms`` – cumulative mean runtime (ms) *before* the row.
        4. Shift the encoded difficulty to obtain the *next* difficulty tier as
           the classification target (``y``).
    Rows where the target cannot be defined (i.e., the last submission for a
    student) are dropped.
    """
    # Encode difficulty
    df["difficulty_id"] = df["difficulty"].apply(encode_difficulty)
    # Filter out rows with unknown difficulty
    df = df[df["difficulty_id"] >= 0].copy()

    # Binary correctness flag
    df["correct"] = (df["verdict"] == "Accepted").astype(int)

    # Runtime in milliseconds (convert from seconds if needed)
    df["runtime_ms"] = df["runtime"].astype(float) * 1000.0

    # Group‑wise cumulative statistics (excluding the current row)
    df["past_correct_sum"] = df.groupby("user_id")["correct"].cumsum() - df["correct"]
    df["past_count"] = df.groupby("user_id").cumcount()
    # past_accuracy – guard division by zero
    df["past_accuracy"] = np.where(
        df["past_count"] > 0, df["past_correct_sum"] / df["past_count"], 0.0
    )
    # Cumulative runtime mean (excluding current row)
    df["past_runtime_sum"] = (
        df.groupby("user_id")["runtime_ms"].cumsum() - df["runtime_ms"]
    )
    df["avg_runtime_ms"] = np.where(
        df["past_count"] > 0, df["past_runtime_sum"] / df["past_count"], 0.0
    )

    # The feature we already have: current difficulty tier (integer)
    df["current_difficulty"] = df["difficulty_id"]

    # Target: next difficulty tier (shifted per student)
    df["next_difficulty"] = df.groupby("user_id")["difficulty_id"].shift(-1)
    # Drop rows where the target is missing (last submission of each student)
    df = df.dropna(subset=["next_difficulty"]).copy()
    df["next_difficulty"] = df["next_difficulty"].astype(int)

    # Final feature matrix columns
    feature_cols = ["past_accuracy", "avg_runtime_ms", "current_difficulty"]
    X = df[feature_cols]
    y = df["next_difficulty"]
    return X, y


def evaluate(y_true: np.ndarray, y_pred: np.ndarray, y_proba: np.ndarray) -> None:
    """Print evaluation metrics.

    ``y_proba`` is expected to be the probability matrix of shape ``(n_samples,
    n_classes)``.
    """
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, average="macro", zero_division=0)
    f1 = f1_score(y_true, y_pred, average="macro", zero_division=0)
    # For multi‑class ROC‑AUC we use One‑vs‑Rest binarisation
    lb = LabelBinarizer()
    lb.fit(y_true)
    y_true_bin = lb.transform(y_true)
    try:
        auc = roc_auc_score(y_true_bin, y_proba, average="macro", multi_class="ovr")
    except ValueError:
        auc = float("nan")
    print("--- Evaluation Metrics ---")
    print(f"Accuracy   : {acc:.4f}")
    print(f"Precision  : {prec:.4f}")
    print(f"F1‑Score   : {f1:.4f}")
    print(f"AUC (OVR)  : {auc:.4f}")


def main() -> None:
    print("Loading Project CodeNet dataset …")
    df = load_codenet()
    print(f"Dataset rows loaded: {len(df)}")

    print("Pre‑processing …")
    X, y = preprocess(df)
    print(f"Feature matrix shape: {X.shape}")

    # Train / test split (70/30) – stratified to keep class balance
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.30,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    print("Training Random Forest …")
    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    # Predictions
    y_pred = clf.predict(X_test)
    y_proba = clf.predict_proba(X_test)

    evaluate(y_test.values, y_pred, y_proba)

    # Persist the model
    print(f"Saving model to {MODEL_PATH}")
    joblib.dump(clf, MODEL_PATH)
    print("Done.")


if __name__ == "__main__":
    main()
