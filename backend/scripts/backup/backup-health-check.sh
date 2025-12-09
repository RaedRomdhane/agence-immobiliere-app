#!/bin/bash

##############################################################################
# Backup Health Check Script
# Description: Monitors backup status and sends alerts
# Schedule: Daily at 8 AM
##############################################################################

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/app/backups}"
MONGODB_BACKUP_DIR="${BACKUP_DIR}/mongodb"
MEDIA_BACKUP_DIR="${BACKUP_DIR}/media"
MAX_AGE_HOURS=8  # Alert if no backup in last 8 hours
MIN_BACKUPS=2    # Alert if less than 2 backups exist
LOG_FILE="${BACKUP_DIR}/health-check.log"

# Alert channels
WEBHOOK_URL="${WEBHOOK_URL:-}"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"
EMAIL_TO="${EMAIL_TO:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ALERTS=()
WARNINGS=()
SUCCESS=()

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE" >&2
    ALERTS+=("$1")
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
    WARNINGS+=("$1")
}

success() {
    log "✅ $1"
    SUCCESS+=("$1")
}

# Check MongoDB backups
check_mongodb_backups() {
    log "Checking MongoDB backups..."
    
    if [[ ! -d "$MONGODB_BACKUP_DIR" ]]; then
        error "MongoDB backup directory not found: $MONGODB_BACKUP_DIR"
        return 1
    fi
    
    # Count backups
    BACKUP_COUNT=$(find "$MONGODB_BACKUP_DIR" -name "mongodb_*.tar.gz" -type f | wc -l)
    
    if [[ $BACKUP_COUNT -lt $MIN_BACKUPS ]]; then
        error "Too few MongoDB backups found: $BACKUP_COUNT (minimum: $MIN_BACKUPS)"
    else
        success "MongoDB backups: $BACKUP_COUNT files"
    fi
    
    # Check latest backup age
    LATEST_BACKUP=$(find "$MONGODB_BACKUP_DIR" -name "mongodb_*.tar.gz" -type f -printf '%T@ %p\n' | sort -nr | head -1 | cut -d' ' -f2-)
    
    if [[ -n "$LATEST_BACKUP" ]]; then
        BACKUP_AGE_SECONDS=$(( $(date +%s) - $(stat -c %Y "$LATEST_BACKUP") ))
        BACKUP_AGE_HOURS=$(( BACKUP_AGE_SECONDS / 3600 ))
        
        if [[ $BACKUP_AGE_HOURS -gt $MAX_AGE_HOURS ]]; then
            error "Latest MongoDB backup is too old: ${BACKUP_AGE_HOURS}h (max: ${MAX_AGE_HOURS}h)"
        else
            success "Latest MongoDB backup: ${BACKUP_AGE_HOURS}h ago"
        fi
        
        # Check backup size
        BACKUP_SIZE=$(du -h "$LATEST_BACKUP" | cut -f1)
        log "Latest backup size: $BACKUP_SIZE"
        
        # Alert if backup is suspiciously small (< 1MB)
        BACKUP_SIZE_BYTES=$(stat -c %s "$LATEST_BACKUP")
        if [[ $BACKUP_SIZE_BYTES -lt 1048576 ]]; then
            warning "Latest MongoDB backup seems too small: $BACKUP_SIZE"
        fi
    else
        error "No MongoDB backups found"
    fi
}

# Check media backups
check_media_backups() {
    log "Checking media backups..."
    
    if [[ ! -d "$MEDIA_BACKUP_DIR" ]]; then
        error "Media backup directory not found: $MEDIA_BACKUP_DIR"
        return 1
    fi
    
    BACKUP_COUNT=$(find "$MEDIA_BACKUP_DIR" -name "media_*.tar.gz" -type f | wc -l)
    
    if [[ $BACKUP_COUNT -lt $MIN_BACKUPS ]]; then
        error "Too few media backups found: $BACKUP_COUNT (minimum: $MIN_BACKUPS)"
    else
        success "Media backups: $BACKUP_COUNT files"
    fi
    
    LATEST_BACKUP=$(find "$MEDIA_BACKUP_DIR" -name "media_*.tar.gz" -type f -printf '%T@ %p\n' | sort -nr | head -1 | cut -d' ' -f2-)
    
    if [[ -n "$LATEST_BACKUP" ]]; then
        BACKUP_AGE_SECONDS=$(( $(date +%s) - $(stat -c %Y "$LATEST_BACKUP") ))
        BACKUP_AGE_HOURS=$(( BACKUP_AGE_SECONDS / 3600 ))
        
        if [[ $BACKUP_AGE_HOURS -gt $MAX_AGE_HOURS ]]; then
            error "Latest media backup is too old: ${BACKUP_AGE_HOURS}h (max: ${MAX_AGE_HOURS}h)"
        else
            success "Latest media backup: ${BACKUP_AGE_HOURS}h ago"
        fi
        
        BACKUP_SIZE=$(du -h "$LATEST_BACKUP" | cut -f1)
        log "Latest backup size: $BACKUP_SIZE"
    else
        error "No media backups found"
    fi
}

# Check disk space
check_disk_space() {
    log "Checking disk space..."
    
    DISK_USAGE=$(df -h "$BACKUP_DIR" | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [[ $DISK_USAGE -gt 90 ]]; then
        error "Disk space critical: ${DISK_USAGE}% used"
    elif [[ $DISK_USAGE -gt 80 ]]; then
        warning "Disk space high: ${DISK_USAGE}% used"
    else
        success "Disk space: ${DISK_USAGE}% used"
    fi
}

# Check Azure connectivity (if configured)
check_azure_connectivity() {
    if [[ -n "${AZURE_STORAGE_ACCOUNT:-}" ]]; then
        log "Checking Azure Blob Storage connectivity..."
        
        if command -v az &> /dev/null; then
            if az storage container exists \
                --account-name "${AZURE_STORAGE_ACCOUNT}" \
                --name "${AZURE_CONTAINER:-backups}" &> /dev/null; then
                success "Azure Blob Storage: Connected"
            else
                warning "Azure Blob Storage: Cannot verify connection"
            fi
        else
            warning "Azure CLI not installed, skipping cloud check"
        fi
    fi
}

# Send alerts
send_alerts() {
    local alert_count=${#ALERTS[@]}
    local warning_count=${#WARNINGS[@]}
    local success_count=${#SUCCESS[@]}
    
    if [[ $alert_count -gt 0 ]]; then
        STATUS="🚨 CRITICAL"
        COLOR="#FF0000"
    elif [[ $warning_count -gt 0 ]]; then
        STATUS="⚠️ WARNING"
        COLOR="#FFA500"
    else
        STATUS="✅ HEALTHY"
        COLOR="#00FF00"
    fi
    
    # Slack notification
    if [[ -n "$SLACK_WEBHOOK" ]]; then
        curl -X POST "$SLACK_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{
                \"text\": \"$STATUS - Backup Health Check\",
                \"attachments\": [{
                    \"color\": \"$COLOR\",
                    \"fields\": [
                        {\"title\": \"Alerts\", \"value\": \"$alert_count\", \"short\": true},
                        {\"title\": \"Warnings\", \"value\": \"$warning_count\", \"short\": true},
                        {\"title\": \"Timestamp\", \"value\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}
                    ]
                }]
            }" || warning "Failed to send Slack notification"
    fi
    
    # Generic webhook
    if [[ -n "$WEBHOOK_URL" ]]; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"status\": \"$STATUS\",
                \"alerts\": $alert_count,
                \"warnings\": $warning_count,
                \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"
            }" || warning "Failed to send webhook notification"
    fi
}

# Generate report
generate_report() {
    cat > "${BACKUP_DIR}/health-check-report.json" <<EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "${STATUS:-UNKNOWN}",
  "alerts": ${#ALERTS[@]},
  "warnings": ${#WARNINGS[@]},
  "successes": ${#SUCCESS[@]},
  "alert_messages": $(printf '%s\n' "${ALERTS[@]}" | jq -R . | jq -s .),
  "warning_messages": $(printf '%s\n' "${WARNINGS[@]}" | jq -R . | jq -s .),
  "success_messages": $(printf '%s\n' "${SUCCESS[@]}" | jq -R . | jq -s .)
}
EOF
}

# Main execution
log "===== Backup Health Check Started ====="

check_mongodb_backups
check_media_backups
check_disk_space
check_azure_connectivity

log "===== Health Check Complete ====="
log "Alerts: ${#ALERTS[@]}, Warnings: ${#WARNINGS[@]}, Successes: ${#SUCCESS[@]}"

send_alerts
generate_report

if [[ ${#ALERTS[@]} -gt 0 ]]; then
    exit 1
elif [[ ${#WARNINGS[@]} -gt 0 ]]; then
    exit 2
else
    exit 0
fi
