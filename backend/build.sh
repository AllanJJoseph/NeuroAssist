#!/usr/bin/env bash
set -e

pip install --upgrade pip

pip install \
  torch==2.8.0 \
  torchvision==0.23.0 \
  --index-url https://download.pytorch.org/whl/cpu

pip install -r requirements.txt