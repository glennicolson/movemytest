#!/bin/bash
# MoveMyTest ↔ DTC Bidirectional Sync Cron Job
# Runs every 5 minutes via Hostinger cron
#
# Setup:
#   1. Upload this script to /home/u385361430/scripts/sync.sh
#   2. Make executable: chmod +x /home/u385361430/scripts/sync.sh
#   3. Add cron job in Hostinger hPanel:
#      */5 * * * * /home/u385361430/scripts/sync.sh
#
# Logs: /home/u385361430/logs/sync.log

LOCK_FILE="/tmp/mmt-dtc-sync.lock"
LOG_FILE="/home/u385361430/logs/sync.log"
MMT_APP_DIR="/home/u385361430/domains/movemytest.co.uk/nodejs"
DTC_APP_DIR="/home/u385361430/domains/thedtc.co.uk/nodejs"

mkdir -p "$(dirname "$LOG_FILE")"

# Prevent overlapping runs
if [ -f "$LOCK_FILE" ]; then
  PID=$(cat "$LOCK_FILE" 2>/dev/null)
  if kill -0 "$PID" 2>/dev/null; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sync already running (PID $PID), skipping" >> "$LOG_FILE"
    exit 0
  else
    rm -f "$LOCK_FILE"
  fi
fi

echo $$ > "$LOCK_FILE"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting bidirectional sync" >> "$LOG_FILE"

# ── Sync DTC → MMT ──
echo "[$(date '+%Y-%m-%d %H:%M:%S')] DTC→MMT sync starting..." >> "$LOG_FILE"
cd "$MMT_APP_DIR"
DTC_TO_MMT=$(npx tsx src/scripts/sync-production.ts --live 2>&1)
EXIT_DTC=$?
echo "$DTC_TO_MMT" >> "$LOG_FILE"
if [ $EXIT_DTC -eq 0 ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] DTC→MMT sync: SUCCESS" >> "$LOG_FILE"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] DTC→MMT sync: FAILED (exit $EXIT_DTC)" >> "$LOG_FILE"
fi

# ── Sync MMT → DTC ──
echo "[$(date '+%Y-%m-%d %H:%M:%S')] MMT→DTC sync starting..." >> "$LOG_FILE"
cd "$DTC_APP_DIR"
MMT_TO_DTC=$(npx tsx src/scripts/sync-mmt-to-dtc.ts --live 2>&1)
EXIT_MMT=$?
echo "$MMT_TO_DTC" >> "$LOG_FILE"
if [ $EXIT_MMT -eq 0 ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] MMT→DTC sync: SUCCESS" >> "$LOG_FILE"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] MMT→DTC sync: FAILED (exit $EXIT_MMT)" >> "$LOG_FILE"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Bidirectional sync complete" >> "$LOG_FILE"
echo "---" >> "$LOG_FILE"

rm -f "$LOCK_FILE"

exit 0
