#!/usr/bin/env python3
"""main.py – FastAPI gateway for the Adaptive Difficulty model.

* Loads `adaptive_model.pkl` (trained by `train_knowledge_tracing.py`).
* Exposes POST /predict that receives telemetry and returns a recommended
  difficulty tier (1 = Easy, 2 = Medium, 3 = Hard).
"""

from pathlib import Path
from typing import Literal

import joblib
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, conint, confloat

# ---------------------------------------------------------------------------
# Load the pre‑trained RandomForest model (created by train_knowledge_tracing)
# ---------------------------------------------------------------------------
MODEL_PATH = Path(__file__).with_name("adaptive_model.pkl")
if not MODEL_PATH.is_file():
    raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

model = joblib.load(MODEL_PATH)  # type: ignore[arg-type]

# ---------------------------------------------------------------------------
# FastAPI app and request schema
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Adaptive Difficulty Gateway",
    description="Predicts the next difficulty tier for a programming student.",
    version="0.1.0",
)


class Telemetry(BaseModel):
    """Incoming payload from the backend.

    - ``past_accuracy``: proportion of correct past submissions (0‑1)
    - ``avg_runtime_ms``: average runtime in milliseconds
    - ``current_difficulty``: encoded as 0=Easy, 1=Medium, 2=Hard
    """

    past_accuracy: confloat(ge=0.0, le=1.0) = Field(
        ..., description="Proportion of past correct submissions"
    )
    avg_runtime_ms: confloat(ge=0.0) = Field(
        ..., description="Average runtime of previous submissions (ms)"
    )
    current_difficulty: conint(ge=0, le=2) = Field(
        ..., description="Current difficulty tier (0‑2)"
    )


class PredictionResponse(BaseModel):
    """Returned JSON format containing the recommendation."""

    recommended_difficulty: Literal[1, 2, 3] = Field(
        ..., description="1=Easy, 2=Medium, 3=Hard"
    )


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: Telemetry) -> PredictionResponse:
    """Run the RandomForest model and map its class (0‑2) to 1‑3.

    The model was trained with the feature order:
        [past_accuracy, avg_runtime_ms, current_difficulty]
    """
    X = [[payload.past_accuracy, payload.avg_runtime_ms, payload.current_difficulty]]
    try:
        pred_class = model.predict(X)[0]  # 0,1,2
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    # Convert 0‑2 → 1‑3 for the external API contract
    recommended = int(pred_class) + 1
    return PredictionResponse(recommended_difficulty=recommended)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
