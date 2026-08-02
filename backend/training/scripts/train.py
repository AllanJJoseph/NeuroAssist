"""End-to-end training entry point for the NeuroAssist stroke predictor."""

from __future__ import annotations

import logging
from pathlib import Path
import sys
from typing import Any

import joblib
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

TRAINING_ROOT = Path(__file__).resolve().parents[1]
if str(TRAINING_ROOT) not in sys.path:
    sys.path.insert(0, str(TRAINING_ROOT))

from scripts.evaluate import EvaluationResult, build_comparison_dataframe, evaluate_model
from scripts.preprocess import build_preprocessor, split_features_target
from utils.data_loader import load_dataset
from utils.paths import MODEL_PATH, MODELS_DIR, PLOTS_DIR, REPORTS_DIR, ensure_directories
from utils.visualization import plot_feature_importance, plot_roc_curves


LOGGER = logging.getLogger(__name__)
RANDOM_STATE = 42
TEST_SIZE = 0.2
ROC_AUC_TIE_TOLERANCE = 0.01


def build_model_definitions() -> dict[str, Any]:
    """Create the model candidates used during training."""

    return {
        "Logistic Regression": LogisticRegression(
            class_weight="balanced",
            max_iter=1000,
            random_state=RANDOM_STATE,
            solver="liblinear",
        ),
        "Random Forest": RandomForestClassifier(
            class_weight="balanced",
            n_estimators=300,
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),
        "XGBoost": XGBClassifier(
            objective="binary:logistic",
            eval_metric="logloss",
            n_estimators=300,
            learning_rate=0.05,
            max_depth=4,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),
    }


def build_training_pipeline(estimator: Any, features) -> ImbPipeline:
    """Build a preprocessing, SMOTE, and estimator pipeline."""

    return ImbPipeline(
        steps=[
            ("preprocessor", build_preprocessor(features)),
            ("smote", SMOTE(random_state=RANDOM_STATE)),
            ("model", estimator),
        ]
    )


def train_models(
    x_train,
    y_train,
    x_test,
    y_test,
) -> tuple[list[EvaluationResult], dict[str, ImbPipeline]]:
    """Train every candidate model and collect evaluation artifacts."""

    results: list[EvaluationResult] = []
    fitted_pipelines: dict[str, ImbPipeline] = {}

    for model_name, estimator in build_model_definitions().items():
        LOGGER.info("Training %s", model_name)
        pipeline = build_training_pipeline(estimator, x_train)
        pipeline.fit(x_train, y_train)
        fitted_pipelines[model_name] = pipeline

        result = evaluate_model(
            model_name=model_name,
            model=pipeline,
            features=x_test,
            target=y_test,
            plots_dir=PLOTS_DIR,
            reports_dir=REPORTS_DIR,
        )
        results.append(result)

        if model_name in {"Random Forest", "XGBoost"}:
            model = pipeline.named_steps["model"]
            preprocessor = pipeline.named_steps["preprocessor"]
            feature_names = preprocessor.get_feature_names_out()
            importances = getattr(model, "feature_importances_", None)
            if importances is not None:
                plot_feature_importance(
                    feature_names=feature_names,
                    importances=importances,
                    output_path=PLOTS_DIR / f"feature_importance_{model_name.lower().replace(' ', '_')}.png",
                    title=f"Feature Importance - {model_name}",
                )

    plot_roc_curves([result.roc_curve for result in results], PLOTS_DIR / "roc_curve_comparison.png")
    return results, fitted_pipelines


def select_best_model(results: list[EvaluationResult], tolerance: float = ROC_AUC_TIE_TOLERANCE) -> EvaluationResult:
    """Choose the best model using ROC-AUC first and F1 score as the tie-breaker."""

    if not results:
        raise ValueError("No evaluation results were produced.")

    best_roc_auc = max(result.metrics["roc_auc"] for result in results)
    close_candidates = [
        result
        for result in results
        if best_roc_auc - result.metrics["roc_auc"] <= tolerance
    ]

    return max(
        close_candidates,
        key=lambda result: (
            result.metrics["f1_score"],
            result.metrics["roc_auc"],
            result.metrics["recall"],
            result.metrics["precision"],
        ),
    )


def save_comparison_reports(comparison_frame, output_dir: Path) -> None:
    """Save the model comparison table in both CSV and text form."""

    csv_path = output_dir / "model_comparison.csv"
    text_path = output_dir / "model_comparison.txt"
    comparison_frame.to_csv(csv_path, index=False)
    text_path.write_text(comparison_frame.to_string(index=False), encoding="utf-8")


def save_final_summary(best_result: EvaluationResult, comparison_frame) -> str:
    """Create a human-readable summary of the selected best model."""

    summary_lines = [
        "NeuroAssist Stroke Prediction Training Summary",
        f"Selected model: {best_result.model_name}",
        f"Accuracy: {best_result.metrics['accuracy']:.4f}",
        f"Precision: {best_result.metrics['precision']:.4f}",
        f"Recall: {best_result.metrics['recall']:.4f}",
        f"F1 Score: {best_result.metrics['f1_score']:.4f}",
        f"ROC-AUC: {best_result.metrics['roc_auc']:.4f}",
        "",
        "Comparison table:",
        comparison_frame.to_string(index=False),
    ]
    summary = "\n".join(summary_lines)
    (REPORTS_DIR / "final_summary.txt").write_text(summary, encoding="utf-8")
    return summary


def save_best_model(model: ImbPipeline) -> None:
    """Persist only the selected best model pipeline."""

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)


def run_training_pipeline() -> str:
    """Run the complete training, evaluation, and selection workflow."""

    ensure_directories()
    dataframe = load_dataset()
    features, target = split_features_target(dataframe)

    x_train, x_test, y_train, y_test = train_test_split(
        features,
        target,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=target,
    )

    results, fitted_pipelines = train_models(x_train, y_train, x_test, y_test)
    comparison_frame = build_comparison_dataframe(results)
    save_comparison_reports(comparison_frame, REPORTS_DIR)

    best_result = select_best_model(results)
    best_model = fitted_pipelines[best_result.model_name]
    save_best_model(best_model)

    summary = save_final_summary(best_result, comparison_frame)
    LOGGER.info("Best model selected: %s", best_result.model_name)
    LOGGER.info("Best model saved to %s", MODEL_PATH)
    return summary


def main() -> None:
    """Execute the full training pipeline from the command line."""

    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
    summary = run_training_pipeline()
    print(summary)


if __name__ == "__main__":
    main()