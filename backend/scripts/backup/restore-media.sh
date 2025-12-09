#!/bin/bash

##############################################################################
# Media Files Restore Script
# Description: Restores media files from backup archive
# Usage: ./restore-media.sh <backup_file>
##############################################################################

set -euo pipefail

# Configuration
MEDIA_DIR="${MEDIA_DIR:-/app/uploads}"
BACKUP_DIR="${BACKUP_DIR:-/app/backups/media}"
RESTORE_TEMP="/tmp/media_restore_$$"
LOG_FILE="${BACKUP_DIR}/restore.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

# Cleanup function
cleanup() {
    if [[ -d "$RESTORE_TEMP" ]]; then
        rm -rf "$RESTORE_TEMP"
        log "Cleaned up temporary files"
    fi
}

trap cleanup EXIT

# Check if backup file is provided
if [[ $# -eq 0 ]]; then
    error "Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/media_*.tar.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [[ ! -f "$BACKUP_FILE" ]]; then
    if [[ -f "${BACKUP_DIR}/${BACKUP_FILE}" ]]; then
        BACKUP_FILE="${BACKUP_DIR}/${BACKUP_FILE}"
    else
        error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi
fi

log "Starting media restore from: $BACKUP_FILE"

# Ask for confirmation
warning "⚠️  WARNING: This will replace current media files in: $MEDIA_DIR"
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    info "Restore cancelled by user"
    exit 0
fi

# Create pre-restore backup
if [[ -d "$MEDIA_DIR" ]]; then
    PRE_RESTORE_BACKUP="${BACKUP_DIR}/pre_restore_$(date +%Y%m%d_%H%M%S).tar.gz"
    info "Creating pre-restore backup: $PRE_RESTORE_BACKUP"
    if tar -czf "$PRE_RESTORE_BACKUP" -C "$(dirname "$MEDIA_DIR")" "$(basename "$MEDIA_DIR")"; then
        log "Pre-restore backup created successfully"
    else
        warning "Failed to create pre-restore backup, continuing anyway..."
    fi
fi

# Extract backup
mkdir -p "$RESTORE_TEMP"
log "Extracting backup archive..."
if tar -xzf "$BACKUP_FILE" -C "$RESTORE_TEMP"; then
    log "Backup extracted successfully"
else
    error "Failed to extract backup archive"
    exit 1
fi

# Find the uploads directory
UPLOADS_DIR=$(find "$RESTORE_TEMP" -type d -name "uploads" | head -n 1)

if [[ -z "$UPLOADS_DIR" || ! -d "$UPLOADS_DIR" ]]; then
    error "Uploads directory not found in backup"
    exit 1
fi

log "Found uploads directory: $UPLOADS_DIR"

# Count files
FILE_COUNT=$(find "$UPLOADS_DIR" -type f | wc -l)
log "Files to restore: $FILE_COUNT"

# Restore files
log "Restoring media files..."
mkdir -p "$(dirname "$MEDIA_DIR")"

if rsync -av --delete "$UPLOADS_DIR/" "$MEDIA_DIR/"; then
    log "✅ Media files restored successfully!"
else
    error "Media restore failed"
    warning "You can restore from pre-restore backup: ${PRE_RESTORE_BACKUP:-none}"
    exit 1
fi

# Verify restore
RESTORED_COUNT=$(find "$MEDIA_DIR" -type f | wc -l)
log "Files restored: $RESTORED_COUNT"

if [[ $RESTORED_COUNT -ne $FILE_COUNT ]]; then
    warning "File count mismatch! Expected: $FILE_COUNT, Got: $RESTORED_COUNT"
fi

# Generate restore report
cat > "${BACKUP_DIR}/latest_restore.json" <<EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "backup_file": "$BACKUP_FILE",
  "media_dir": "$MEDIA_DIR",
  "files_restored": $RESTORED_COUNT,
  "status": "success",
  "pre_restore_backup": "${PRE_RESTORE_BACKUP:-none}"
}
EOF

log "Restore completed successfully"
info "Pre-restore backup available at: ${PRE_RESTORE_BACKUP:-none}"

# Send notification
if command -v curl &> /dev/null && [[ -n "${WEBHOOK_URL:-}" ]]; then
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"✅ Media restored from: $(basename "$BACKUP_FILE") ($RESTORED_COUNT files)\"}" \
        || warning "Failed to send notification"
fi

exit 0
