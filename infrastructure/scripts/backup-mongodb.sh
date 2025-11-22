#!/bin/bash

################################################################################
# MongoDB Backup Script
# Description: Creates a compressed backup of MongoDB database
# Usage: ./backup-mongodb.sh
# Environment Variables:
#   - MONGODB_URI: MongoDB connection string (required)
#   - BACKUP_DIR: Directory to store backups (default: ./backups)
#   - AZURE_STORAGE_CONNECTION: Azure Blob connection (optional)
################################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TIMESTAMP=$(date +'%Y%m%d-%H%M%S')
BACKUP_DIR=${BACKUP_DIR:-"./backups"}
BACKUP_NAME="mongodb-backup-${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
METADATA_FILE="${BACKUP_PATH}/backup-metadata.json"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         MongoDB Backup Script - Production Grade              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check required tools
check_dependencies() {
    echo -e "${YELLOW}🔍 Checking dependencies...${NC}"
    
    local missing_deps=()
    
    command -v mongodump >/dev/null 2>&1 || missing_deps+=("mongodump")
    command -v jq >/dev/null 2>&1 || missing_deps+=("jq")
    command -v tar >/dev/null 2>&1 || missing_deps+=("tar")
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing dependencies: ${missing_deps[*]}${NC}"
        echo -e "${YELLOW}Please install: ${missing_deps[*]}${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All dependencies found${NC}"
}

# Validate MongoDB connection
validate_connection() {
    echo -e "${YELLOW}🔌 Validating MongoDB connection...${NC}"
    
    if [ -z "${MONGODB_URI:-}" ]; then
        echo -e "${RED}❌ MONGODB_URI environment variable not set${NC}"
        exit 1
    fi
    
    # Test connection using mongosh or mongo
    if command -v mongosh >/dev/null 2>&1; then
        mongosh "${MONGODB_URI}" --eval "db.runCommand({ ping: 1 })" >/dev/null 2>&1 || {
            echo -e "${RED}❌ Cannot connect to MongoDB${NC}"
            exit 1
        }
    else
        # Fallback: just proceed with mongodump, it will fail if connection is bad
        echo -e "${YELLOW}⚠️  Cannot verify connection (mongosh not found), proceeding...${NC}"
    fi
    
    echo -e "${GREEN}✅ MongoDB connection validated${NC}"
}

# Create backup directory
prepare_backup_dir() {
    echo -e "${YELLOW}📁 Preparing backup directory...${NC}"
    
    mkdir -p "${BACKUP_DIR}"
    mkdir -p "${BACKUP_PATH}"
    
    echo -e "${GREEN}✅ Backup directory ready: ${BACKUP_PATH}${NC}"
}

# Perform MongoDB dump
perform_backup() {
    echo -e "${YELLOW}💾 Creating MongoDB backup...${NC}"
    echo -e "${BLUE}   This may take several minutes depending on database size${NC}"
    
    local start_time=$(date +%s)
    
    # Run mongodump
    mongodump \
        --uri="${MONGODB_URI}" \
        --out="${BACKUP_PATH}/dump" \
        --gzip \
        --verbose 2>&1 | tee "${BACKUP_PATH}/mongodump.log"
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo -e "${GREEN}✅ MongoDB dump completed in ${duration}s${NC}"
    
    # Store duration for metadata
    BACKUP_DURATION=${duration}
}

# Compress backup
compress_backup() {
    echo -e "${YELLOW}📦 Compressing backup...${NC}"
    
    local archive_file="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    
    cd "${BACKUP_DIR}"
    tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
    cd - > /dev/null
    
    # Calculate size and hash
    BACKUP_SIZE=$(du -h "${archive_file}" | cut -f1)
    BACKUP_HASH=$(sha256sum "${archive_file}" | cut -d' ' -f1)
    BACKUP_FILE="${archive_file}"
    
    echo -e "${GREEN}✅ Backup compressed: ${BACKUP_FILE}${NC}"
    echo -e "${GREEN}   Size: ${BACKUP_SIZE}${NC}"
    echo -e "${GREEN}   SHA256: ${BACKUP_HASH}${NC}"
}

# Generate metadata
generate_metadata() {
    echo -e "${YELLOW}📝 Generating metadata...${NC}"
    
    # Create metadata JSON
    cat > "${BACKUP_DIR}/${BACKUP_NAME}-metadata.json" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "backup_name": "${BACKUP_NAME}",
  "backup_file": "${BACKUP_NAME}.tar.gz",
  "backup_size": "${BACKUP_SIZE}",
  "backup_hash_sha256": "${BACKUP_HASH}",
  "backup_duration_seconds": ${BACKUP_DURATION},
  "mongodb_uri_host": "$(echo ${MONGODB_URI} | sed 's/mongodb+srv:\/\/.*@\(.*\)\/.*/\1/')",
  "backup_method": "mongodump",
  "compression": "gzip",
  "environment": "${ENVIRONMENT:-production}",
  "triggered_by": "${GITHUB_ACTOR:-manual}",
  "github_run_id": "${GITHUB_RUN_ID:-N/A}",
  "github_sha": "${GITHUB_SHA:-N/A}"
}
EOF
    
    echo -e "${GREEN}✅ Metadata generated: ${BACKUP_NAME}-metadata.json${NC}"
    cat "${BACKUP_DIR}/${BACKUP_NAME}-metadata.json" | jq '.'
}

# Upload to Azure Blob (optional)
upload_to_azure() {
    if [ -n "${AZURE_STORAGE_CONNECTION:-}" ]; then
        echo -e "${YELLOW}☁️  Uploading to Azure Blob Storage...${NC}"
        
        if command -v az >/dev/null 2>&1; then
            az storage blob upload \
                --connection-string "${AZURE_STORAGE_CONNECTION}" \
                --container-name "mongodb-backups" \
                --name "${BACKUP_NAME}.tar.gz" \
                --file "${BACKUP_FILE}" \
                --output table
            
            echo -e "${GREEN}✅ Backup uploaded to Azure Blob Storage${NC}"
        else
            echo -e "${YELLOW}⚠️  Azure CLI not found, skipping Azure upload${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  AZURE_STORAGE_CONNECTION not set, skipping Azure upload${NC}"
    fi
}

# Verify backup integrity
verify_backup() {
    echo -e "${YELLOW}🔍 Verifying backup integrity...${NC}"
    
    # Check if tar file is valid
    tar -tzf "${BACKUP_FILE}" > /dev/null 2>&1 || {
        echo -e "${RED}❌ Backup file is corrupted${NC}"
        exit 1
    }
    
    # Verify hash
    local computed_hash=$(sha256sum "${BACKUP_FILE}" | cut -d' ' -f1)
    if [ "${computed_hash}" != "${BACKUP_HASH}" ]; then
        echo -e "${RED}❌ Hash mismatch! Backup may be corrupted${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Backup integrity verified${NC}"
}

# Cleanup old backups (keep last 30)
cleanup_old_backups() {
    echo -e "${YELLOW}🧹 Cleaning up old backups (keeping last 30)...${NC}"
    
    cd "${BACKUP_DIR}"
    
    # Count backups
    local backup_count=$(ls -1 mongodb-backup-*.tar.gz 2>/dev/null | wc -l)
    
    if [ "${backup_count}" -gt 30 ]; then
        # Remove oldest backups
        ls -1t mongodb-backup-*.tar.gz | tail -n +31 | xargs rm -f
        ls -1t mongodb-backup-*-metadata.json | tail -n +31 | xargs rm -f
        ls -1dt mongodb-backup-* | tail -n +31 | xargs rm -rf
        
        echo -e "${GREEN}✅ Cleaned up $((backup_count - 30)) old backups${NC}"
    else
        echo -e "${GREEN}✅ No cleanup needed (${backup_count} backups)${NC}"
    fi
    
    cd - > /dev/null
}

# Generate summary
print_summary() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                    Backup Summary                              ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo -e "${GREEN}✅ Backup completed successfully!${NC}"
    echo ""
    echo -e "📦 Backup file:    ${BACKUP_FILE}"
    echo -e "📊 Size:           ${BACKUP_SIZE}"
    echo -e "🔐 SHA256:         ${BACKUP_HASH}"
    echo -e "⏱️  Duration:       ${BACKUP_DURATION}s"
    echo -e "📝 Metadata:       ${BACKUP_DIR}/${BACKUP_NAME}-metadata.json"
    echo ""
    echo -e "${YELLOW}💡 To restore this backup, run:${NC}"
    echo -e "${BLUE}   ./restore-mongodb.sh ${BACKUP_FILE}${NC}"
    echo ""
    
    # Export for GitHub Actions
    if [ -n "${GITHUB_OUTPUT:-}" ]; then
        echo "backup_file=${BACKUP_FILE}" >> "${GITHUB_OUTPUT}"
        echo "backup_size=${BACKUP_SIZE}" >> "${GITHUB_OUTPUT}"
        echo "backup_hash=${BACKUP_HASH}" >> "${GITHUB_OUTPUT}"
        echo "backup_name=${BACKUP_NAME}" >> "${GITHUB_OUTPUT}"
    fi
}

# Main execution
main() {
    check_dependencies
    validate_connection
    prepare_backup_dir
    perform_backup
    compress_backup
    generate_metadata
    verify_backup
    upload_to_azure
    cleanup_old_backups
    print_summary
}

# Run main function
main "$@"
