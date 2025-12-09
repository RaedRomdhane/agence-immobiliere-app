#!/bin/bash

##############################################################################
# MongoDB Backup Script
# Description: Creates compressed MongoDB backups with rotation
# Schedule: Every 6 hours via cron
# Retention: 7 daily, 4 weekly, 12 monthly backups
##############################################################################

set -euo pipefail

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_DIR:-/app/backups/mongodb}"
LOCAL_RETENTION_DAYS="${LOCAL_RETENTION_DAYS:-7}"
MONGODB_URI="${MONGODB_URI:-mongodb://mongodb:27017}"
MONGODB_DATABASE="${MONGODB_DATABASE:-agence-immobiliere}"
BACKUP_NAME="mongodb_${MONGODB_DATABASE}_${TIMESTAMP}"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Azure Blob Storage (optional)
AZURE_STORAGE_ACCOUNT="${AZURE_STORAGE_ACCOUNT:-}"
AZURE_STORAGE_KEY="${AZURE_STORAGE_KEY:-}"
AZURE_CONTAINER="${AZURE_CONTAINER:-backups}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE" >&2
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if mongodump is available
if ! command -v mongodump &> /dev/null; then
    error "mongodump not found. Please install mongodb-database-tools"
    exit 1
fi

log "Starting MongoDB backup: $BACKUP_NAME"

# Create backup
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
mkdir -p "$BACKUP_PATH"

if mongodump --uri="$MONGODB_URI" --db="$MONGODB_DATABASE" --out="$BACKUP_PATH" --gzip; then
    log "MongoDB dump completed successfully"
else
    error "MongoDB dump failed"
    rm -rf "$BACKUP_PATH"
    exit 1
fi

# Create compressed archive
ARCHIVE_NAME="${BACKUP_NAME}.tar.gz"
ARCHIVE_PATH="${BACKUP_DIR}/${ARCHIVE_NAME}"

log "Compressing backup..."
if tar -czf "$ARCHIVE_PATH" -C "$BACKUP_DIR" "${BACKUP_NAME}"; then
    log "Backup compressed: $ARCHIVE_NAME"
    rm -rf "$BACKUP_PATH"
else
    error "Compression failed"
    exit 1
fi

# Get backup size
BACKUP_SIZE=$(du -h "$ARCHIVE_PATH" | cut -f1)
log "Backup size: $BACKUP_SIZE"

# Upload to Azure Blob Storage (if configured)
if [[ -n "$AZURE_STORAGE_ACCOUNT" && -n "$AZURE_STORAGE_KEY" ]]; then
    log "Uploading to Azure Blob Storage..."
    
    if command -v az &> /dev/null; then
        # Using Azure CLI
        if az storage blob upload \
            --account-name "$AZURE_STORAGE_ACCOUNT" \
            --account-key "$AZURE_STORAGE_KEY" \
            --container-name "$AZURE_CONTAINER" \
            --name "mongodb/${ARCHIVE_NAME}" \
            --file "$ARCHIVE_PATH" \
            --overwrite; then
            log "Upload to Azure successful"
        else
            warning "Azure upload failed, backup saved locally only"
        fi
    else
        warning "Azure CLI not found, skipping cloud upload"
    fi
fi

# Cleanup old local backups (keep last N days)
log "Cleaning up old backups (keeping last $LOCAL_RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "mongodb_*.tar.gz" -type f -mtime +$LOCAL_RETENTION_DAYS -delete

REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "mongodb_*.tar.gz" -type f | wc -l)
log "Local backups remaining: $REMAINING_BACKUPS"

# Generate backup report
cat > "${BACKUP_DIR}/latest_backup.json" <<EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "backup_name": "$ARCHIVE_NAME",
  "backup_size": "$BACKUP_SIZE",
  "database": "$MONGODB_DATABASE",
  "status": "success",
  "local_path": "$ARCHIVE_PATH",
  "retention_days": $LOCAL_RETENTION_DAYS,
  "remaining_backups": $REMAINING_BACKUPS
}
EOF

log "Backup completed successfully: $ARCHIVE_NAME"

# Send notification (optional - integrate with your notification system)
if command -v curl &> /dev/null && [[ -n "${WEBHOOK_URL:-}" ]]; then
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"✅ MongoDB backup completed: $ARCHIVE_NAME ($BACKUP_SIZE)\"}" \
        || warning "Failed to send notification"
fi

exit 0
