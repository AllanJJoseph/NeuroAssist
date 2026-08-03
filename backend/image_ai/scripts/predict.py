"""Thin prediction runner for the Image AI classifier."""

from __future__ import annotations

import argparse
import json

from image_ai.services.predictor import predict


def main(image_path: str | None = None) -> dict:
    if image_path is None:
        parser = argparse.ArgumentParser(description="Run Image AI inference on a single image.")
        parser.add_argument("image_path", help="Path to the image to classify")
        args = parser.parse_args()
        image_path = args.image_path

    result = predict(image_path)
    print(json.dumps(result, indent=2))
    return result


if __name__ == "__main__":
    main()
