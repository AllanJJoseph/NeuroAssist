#!/usr/bin/env bash
set -e

python -m pip install --upgrade pip

# Install CPU-only PyTorch first
python -m pip install \
  torch torchvision \
  --index-url https://download.pytorch.org/whl/cpu

# Install the rest of the dependencies
python -m pip install -r requirements.txt