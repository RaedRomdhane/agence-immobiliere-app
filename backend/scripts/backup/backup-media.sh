#!/bin/bash

##############################################################################
# Media Files Backup Script
# Description: Backs up uploaded media files to Azure Blob Storage
# Schedule: Every 6 hours via cron
# Includes: Images, documents, user uploads
##############################################################################

set -euo pipefail

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
MEDIA_DIR="${MEDIA_DIR:-/app/uploads}"
BACKUP_DIR="${BACKUP_DIR:-/app/backups/media}"
LOCAL_RETENTION_DAYS="${LOCAL_RETENTION_DAYS:-7}"
BACKUP_NAME="media_${TIMESTAMP}"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Azure Blob Storage
AZURE_STORAGE_ACCOUNT="${AZURE_STORAGE_ACCOUNT:-}"
AZURE_STORAGE_KEY="${AZURE_STORAGE_KEY:-}"
AZURE_CONTAINER="${AZURE_CONTAINER:-backups}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE" >&2
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check if media directory exists
if [[ ! -d "$MEDIA_DIR" ]]; then
    error "Media directory not found: $MEDIA_DIR"
    exit 1
fi

log "Starting media files backup: $BACKUP_NAME"

# Count files
FILE_COUNT=$(find "$MEDIA_DIR" -type f | wc -l)
log "Files to backup: $FILE_COUNT"

if [[ $FILE_COUNT -eq 0 ]]; then
    warning "No files to backup"
    exit 0
fi

# Create compressed archive
ARCHIVE_NAME="${BACKUP_NAME}.tar.gz"
ARCHIVE_PATH="${BACKUP_DIR}/${ARCHIVE_NAME}"

log "Compressing media files..."
if tar -czf "$ARCHIVE_PATH" -C "$(dirname "$MEDIA_DIR")" "$(basename "$MEDIA_DIR")"; then
    BACKUP_SIZE=$(du -h "$ARCHIVE_PATH" | cut -f1)
    log "Backup compressed: $ARCHIVE_NAME (Size: $BACKUP_SIZE)"
else
    error "Compression failed"
    exit 1
fi

# Upload to Azure Blob Storage
if [[ -n "$AZURE_STORAGE_ACCOUNT" && -n "$AZURE_STORAGE_KEY" ]]; then
    log "Uploading to Azure Blob Storage..."
    
    if command -v az &> /dev/null; then
        if az storage blob upload \
            --account-name "$AZURE_STORAGE_ACCOUNT" \
            --account-key "$AZURE_STORAGE_KEY" \
            --container-name "$AZURE_CONTAINER" \
            --name "media/${ARCHIVE_NAME}" \
            --file "$ARCHIVE_PATH" \
            --overwrite; then
            log "Upload to Azure successful"
        else
            warning "Azure upload failed, backup saved locally only"
        fi
    else
        warning "Azure CLI not found, skipping cloud upload"
    fi
else
    warning "Azure credentials not configured, skipping cloud upload"
fi

# Cleanup old local backups
log "Cleaning up old backups (keeping last $LOCAL_RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "media_*.tar.gz" -type f -mtime +$LOCAL_RETENTION_DAYS -delete

REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "media_*.tar.gz" -type f | wc -l)
log "Local backups remaining: $REMAINING_BACKUPS"

# Generate backup report
cat > "${BACKUP_DIR}/latest_backup.json" <<EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "backup_name": "$ARCHIVE_NAME",
  "backup_size": "$BACKUP_SIZE",
  "file_count": $FILE_COUNT,
  "status": "success",
  "local_path": "$ARCHIVE_PATH",
  "retention_days": $LOCAL_RETENTION_DAYS,
  "remaining_backups": $REMAINING_BACKUPS
}
EOF

log "Media backup completed successfully: $ARCHIVE_NAME"

# Send notification
if command -v curl &> /dev/null && [[ -n "${WEBHOOK_URL:-}" ]]; then
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"✅ Media backup completed: $ARCHIVE_NAME ($FILE_COUNT files, $BACKUP_SIZE)\"}" \
        || warning "Failed to send notification"
fi

exit 0
