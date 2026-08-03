#!/usr/bin/env bash
set -e

python -m pip install --upgrade pip

# Install CPU-only PyTorch
python -m pip install torch torchvision \
    --index-url https://download.pytorch.org/whl/cpu

# Install the remaining requirements
python -m pip install -r requirements.txt