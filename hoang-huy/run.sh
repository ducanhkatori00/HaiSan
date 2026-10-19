#!/bin/sh
set -eu
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  export PATH="$PWD/.runtime/node-v22.23.3-darwin-arm64/bin:$PATH"
fi
if ! command -v node >/dev/null 2>&1; then
  echo 'Vui lòng cài Node.js 22 trở lên.'
  exit 1
fi
if [ ! -d node_modules ]; then npm install; fi
if [ "${1:-}" = dev ]; then
  npm run dev
else
  npm run build
  npm start
fi
