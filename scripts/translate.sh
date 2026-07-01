#!/usr/bin/env bash
set -e

echo "Setting up temporary translation environment..."
python3 -m venv .venv-translate
.venv-translate/bin/pip install --quiet polib deep-translator

echo "Running translation script..."
.venv-translate/bin/python scripts/translate.py

echo "Cleaning up..."
rm -rf .venv-translate

echo "Translation complete."
