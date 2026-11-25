#!/usr/bin/env bash
# Build and start the Zerodebt Solution website (needs JDK 17+ only)
set -e
cd "$(dirname "$0")"
mkdir -p out
javac -d out src/in/zerodebt/*.java
echo "Starting on http://localhost:${PORT:-8080}  (admin: /admin.html)"
exec java -cp out in.zerodebt.Main
