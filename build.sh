#!/usr/bin/env bash

set -euo pipefail

test -f index.html
test -d assets

rm -rf -- dist
mkdir -- dist
cp -- index.html dist/
cp -R -- assets dist/
