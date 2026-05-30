#!/bin/sh
# MoveMyTest ↔ DTC Sync Cron Job for Hostinger
# 
# Setup in Hostinger hPanel:
# 1. Upload this file to /home/u385361430/scripts/sync.sh
# 2. Make executable: chmod +x /home/u385361430/scripts/sync.sh
# 3. In hPanel → Cron Jobs → Add:
#    Type: Custom
#    Command: /bin/sh /home/u385361430/scripts/sync.sh
#    Schedule: Every 5 minutes (*/5 * * * *)
#
# PHP path for Hostinger: /usr/bin/php

LOG_FILE="/home/u385361430/logs/sync.log"
MMT_DIR="/home/u385361430/domains/movemytest.co.uk/nodejs"
DTC_DIR="/home/u385361430/domains/thedtc.co.uk/nodejs"
PHP_BIN="/usr/bin/php"

mkdir -p "$(dirname "$LOG_FILE")"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting bidirectional sync" >> "$LOG_FILE"

# ── Sync DTC → MMT ──
echo "[$(date '+%Y-%m-%d %H:%M:%S')] DTC→MMT sync..." >> "$LOG_FILE"
cd "$MMT_DIR"
$PHP_BIN src/scripts/sync-dtc-to-mmt.php >> "$LOG_FILE" 2>&1
echo "[$(date '+%Y-%m-%d %H:%M:%S')] DTC→MMT done" >> "$LOG_FILE"

# ── Sync MMT → DTC ──
echo "[$(date '+%Y-%m-%d %H:%M:%S')] MMT→DTC sync..." >> "$LOG_FILE"
cd "$DTC_DIR"
$PHP_BIN src/scripts/sync-mmt-to-dtc.php >> "$LOG_FILE" 2>&1
echo "[$(date '+%Y-%m-%d %H:%M:%S')] MMT→DTC done" >> "$LOG_FILE"

echo "---" >> "$LOG_FILE"
