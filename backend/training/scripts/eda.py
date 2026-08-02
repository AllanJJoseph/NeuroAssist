"""Exploratory data analysis for the NeuroAssist stroke dataset."""

from __future__ import annotations

import logging
from pathlib import Path
import sys

import pandas as pd

TRAINING_ROOT = Path(__file__).resolve().parents[1]
if str(TRAINING_ROOT) not in sys.path:
    sys.path.insert(0, str(TRAINING_ROOT))

from scripts.preprocess import identify_feature_columns, split_features_target
from utils.data_loader import load_dataset
from utils.paths import PLOTS_DIR, REPORTS_DIR, ensure_directories
from utils.visualization import (
    plot_categorical_distributions,
    plot_class_distribution,
    plot_correlation_heatmap,
    plot_missing_values,
    plot_numerical_distributions,
)


LOGGER = logging.getLogger(__name__)


def generate_missing_value_report(dataframe: pd.DataFrame, output_path: Path) -> pd.DataFrame:
    """Create and persist a missing-value report."""

    missing_counts = dataframe.isna().sum()
    report = pd.DataFrame(
        {
            "missing_count": missing_counts,
            "missing_percentage": (missing_counts / len(dataframe)) * 100.0,
        }
    ).sort_values(by="missing_count", ascending=False)
    report.to_csv(output_path)
    return report


def run_eda(dataframe: pd.DataFrame) -> dict[str, list[Path]]:
    """Generate the EDA artifacts required for the project."""

    ensure_directories()

    outputs: dict[str, list[Path]] = {
        "plots": [],
        "reports": [],
    }

    missing_report_path = REPORTS_DIR / "missing_values_report.csv"
    generate_missing_value_report(dataframe, missing_report_path)
    outputs["reports"].append(missing_report_path)
    plot_missing_values(dataframe.isna().sum(), PLOTS_DIR / "missing_values.png")
    outputs["plots"].append(PLOTS_DIR / "missing_values.png")

    class_distribution_path = PLOTS_DIR / "class_distribution.png"
    plot_class_distribution(dataframe, "stroke", class_distribution_path)
    outputs["plots"].append(class_distribution_path)

    features, _ = split_features_target(dataframe)
    categorical_columns, numerical_columns = identify_feature_columns(features)

    numeric_features = features[numerical_columns] if numerical_columns else pd.DataFrame(index=features.index)
    if not numeric_features.empty:
        correlation_path = PLOTS_DIR / "correlation_heatmap.png"
        correlation_features = pd.concat([numeric_features, dataframe[["stroke"]]], axis=1)
        plot_correlation_heatmap(correlation_features, correlation_path)
        outputs["plots"].append(correlation_path)

        outputs["plots"].extend(
            plot_numerical_distributions(features, PLOTS_DIR / "numerical_distributions", numerical_columns)
        )

    if categorical_columns:
        outputs["plots"].extend(
            plot_categorical_distributions(features, PLOTS_DIR / "categorical_distributions", categorical_columns)
        )

    LOGGER.info("EDA artifacts generated successfully.")
    LOGGER.info("Missing-value report saved to %s", missing_report_path)
    return outputs


def main() -> None:
    """Run the EDA pipeline from the command line."""

    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
    dataframe = load_dataset()
    run_eda(dataframe)


if __name__ == "__main__":
    main()