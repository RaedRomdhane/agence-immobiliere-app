#!/bin/bash

##############################################################################
# MongoDB Restore Script
# Description: Restores MongoDB from backup archive
# Usage: ./restore-mongodb.sh <backup_file>
##############################################################################

set -euo pipefail

# Configuration
MONGODB_URI="${MONGODB_URI:-mongodb://mongodb:27017}"
MONGODB_DATABASE="${MONGODB_DATABASE:-agence-immobiliere}"
BACKUP_DIR="${BACKUP_DIR:-/app/backups/mongodb}"
RESTORE_TEMP="/tmp/mongodb_restore_$$"
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
    ls -lh "$BACKUP_DIR"/mongodb_*.tar.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [[ ! -f "$BACKUP_FILE" ]]; then
    # Try to find in backup directory
    if [[ -f "${BACKUP_DIR}/${BACKUP_FILE}" ]]; then
        BACKUP_FILE="${BACKUP_DIR}/${BACKUP_FILE}"
    else
        error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi
fi

log "Starting MongoDB restore from: $BACKUP_FILE"

# Check if mongorestore is available
if ! command -v mongorestore &> /dev/null; then
    error "mongorestore not found. Please install mongodb-database-tools"
    exit 1
fi

# Ask for confirmation
warning "⚠️  WARNING: This will replace the current database: $MONGODB_DATABASE"
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    info "Restore cancelled by user"
    exit 0
fi

# Create pre-restore backup
PRE_RESTORE_BACKUP="${BACKUP_DIR}/pre_restore_$(date +%Y%m%d_%H%M%S).tar.gz"
info "Creating pre-restore backup: $PRE_RESTORE_BACKUP"
if mongodump --uri="$MONGODB_URI" --db="$MONGODB_DATABASE" --archive="$PRE_RESTORE_BACKUP" --gzip; then
    log "Pre-restore backup created successfully"
else
    warning "Failed to create pre-restore backup, continuing anyway..."
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

# Find the database directory
DB_DIR=$(find "$RESTORE_TEMP" -type d -name "$MONGODB_DATABASE" | head -n 1)

if [[ -z "$DB_DIR" || ! -d "$DB_DIR" ]]; then
    error "Database directory not found in backup"
    exit 1
fi

log "Found database directory: $DB_DIR"

# Restore database
log "Restoring database..."
if mongorestore --uri="$MONGODB_URI" --db="$MONGODB_DATABASE" --gzip --drop "$DB_DIR"; then
    log "✅ Database restored successfully!"
else
    error "Database restore failed"
    warning "You can restore from pre-restore backup: $PRE_RESTORE_BACKUP"
    exit 1
fi

# Verify restore
log "Verifying restore..."
if mongosh "$MONGODB_URI/$MONGODB_DATABASE" --quiet --eval "db.stats()" &> /dev/null; then
    COLLECTION_COUNT=$(mongosh "$MONGODB_URI/$MONGODB_DATABASE" --quiet --eval "db.getCollectionNames().length")
    log "✅ Verification successful! Collections restored: $COLLECTION_COUNT"
else
    warning "Could not verify restore automatically"
fi

# Generate restore report
cat > "${BACKUP_DIR}/latest_restore.json" <<EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "backup_file": "$BACKUP_FILE",
  "database": "$MONGODB_DATABASE",
  "status": "success",
  "pre_restore_backup": "$PRE_RESTORE_BACKUP"
}
EOF

log "Restore completed successfully"
info "Pre-restore backup available at: $PRE_RESTORE_BACKUP"

# Send notification
if command -v curl &> /dev/null && [[ -n "${WEBHOOK_URL:-}" ]]; then
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"✅ MongoDB restored from: $(basename "$BACKUP_FILE")\"}" \
        || warning "Failed to send notification"
fi

exit 0
