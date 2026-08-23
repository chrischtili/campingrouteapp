#!/usr/bin/env bash
# ==============================================================================
# CampingRoute - Monthly Automated Open Data Sync Script
# Runs on the 1st of every month at 03:00 AM via Crontab
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="/tmp/campingroute_opendata_sync.log"

echo "==================================================" >> "$LOG_FILE"
echo "Starting Monthly Open Data Sync: $(date)" >> "$LOG_FILE"
echo "Backend Dir: $BACKEND_DIR" >> "$LOG_FILE"

cd "$BACKEND_DIR"

if command -v npm >/dev/null 2>&1; then
    npm run sync:opendata >> "$LOG_FILE" 2>&1
else
    echo "npm not found in PATH" >> "$LOG_FILE"
fi

echo "Finished Sync: $(date)" >> "$LOG_FILE"
echo "==================================================" >> "$LOG_FILE"
