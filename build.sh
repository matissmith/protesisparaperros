#!/usr/bin/env bash

set -euo pipefail

test -f index.html
test -d assets

rm -rf -- dist
mkdir -- dist
cp -- index.html dist/
cp -R -- assets dist/

# Sacar del build público lo que no es parte de la web servida: docs internas,
# previews descartados, archivos ocultos/de sistema y scripts que no son frontend.
rm -rf -- dist/assets/img/_previas
find dist -type f \( \
    -name '*.txt' -o \
    -name '.DS_Store' -o \
    -name '.gitignore' -o \
    -name '*.md' -o \
    -name '*.gs' \
  \) -delete
find dist -type d -name '.*' -prune -exec rm -rf -- {} +
