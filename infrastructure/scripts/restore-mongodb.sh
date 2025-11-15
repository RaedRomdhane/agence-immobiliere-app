#!/bin/bash

################################################################################
# MongoDB Restore Script
# Description: Restores MongoDB from a backup file
# Usage: ./restore-mongodb.sh <backup-file>
# Example: ./restore-mongodb.sh ./backups/mongodb-backup-20250107-143000.tar.gz
# Environment Variables:
#   - MONGODB_URI: MongoDB connection string (required)
#   - SKIP_BACKUP: Skip creating safety backup (default: false)
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

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         MongoDB Restore Script - Production Grade             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check arguments
if [ $# -lt 1 ]; then
    echo -e "${RED}❌ Usage: $0 <backup-file>${NC}"
    echo -e "${YELLOW}Example: $0 ./backups/mongodb-backup-20250107-143000.tar.gz${NC}"
    exit 1
fi

BACKUP_FILE="$1"
TEMP_DIR=$(mktemp -d)
TIMESTAMP=$(date +'%Y%m%d-%H%M%S')
SKIP_BACKUP=${SKIP_BACKUP:-false}

# Cleanup on exit
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up temporary files...${NC}"
    rm -rf "${TEMP_DIR}"
}
trap cleanup EXIT

# Check dependencies
check_dependencies() {
    echo -e "${YELLOW}🔍 Checking dependencies...${NC}"
    
    local missing_deps=()
    
    command -v mongorestore >/dev/null 2>&1 || missing_deps+=("mongorestore")
    command -v tar >/dev/null 2>&1 || missing_deps+=("tar")
    command -v jq >/dev/null 2>&1 || missing_deps+=("jq")
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing dependencies: ${missing_deps[*]}${NC}"
        echo -e "${YELLOW}Please install: ${missing_deps[*]}${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All dependencies found${NC}"
}

# Validate backup file
validate_backup_file() {
    echo -e "${YELLOW}🔍 Validating backup file...${NC}"
    
    if [ ! -f "${BACKUP_FILE}" ]; then
        echo -e "${RED}❌ Backup file not found: ${BACKUP_FILE}${NC}"
        exit 1
    fi
    
    # Check if it's a valid tar.gz file
    if ! tar -tzf "${BACKUP_FILE}" > /dev/null 2>&1; then
        echo -e "${RED}❌ Invalid backup file format${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Backup file is valid${NC}"
    
    # Show backup info
    local backup_size=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo -e "${BLUE}   File: ${BACKUP_FILE}${NC}"
    echo -e "${BLUE}   Size: ${backup_size}${NC}"
}

# Verify backup integrity
verify_integrity() {
    echo -e "${YELLOW}🔐 Verifying backup integrity...${NC}"
    
    # Look for metadata file
    local metadata_file="${BACKUP_FILE%.tar.gz}-metadata.json"
    
    if [ -f "${metadata_file}" ]; then
        echo -e "${BLUE}   Found metadata file${NC}"
        
        # Read expected hash from metadata
        local expected_hash=$(jq -r '.backup_hash_sha256' "${metadata_file}")
        
        # Calculate actual hash
        local actual_hash=$(sha256sum "${BACKUP_FILE}" | cut -d' ' -f1)
        
        if [ "${expected_hash}" != "${actual_hash}" ]; then
            echo -e "${RED}❌ Hash mismatch!${NC}"
            echo -e "${RED}   Expected: ${expected_hash}${NC}"
            echo -e "${RED}   Actual:   ${actual_hash}${NC}"
            echo -e "${RED}   Backup file may be corrupted!${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}✅ Hash verification passed${NC}"
        
        # Display backup metadata
        echo -e "${BLUE}📊 Backup metadata:${NC}"
        jq '.' "${metadata_file}" | sed 's/^/   /'
    else
        echo -e "${YELLOW}⚠️  No metadata file found, skipping hash verification${NC}"
    fi
}

# Validate MongoDB connection
validate_connection() {
    echo -e "${YELLOW}🔌 Validating MongoDB connection...${NC}"
    
    if [ -z "${MONGODB_URI:-}" ]; then
        echo -e "${RED}❌ MONGODB_URI environment variable not set${NC}"
        exit 1
    fi
    
    # Test connection
    if command -v mongosh >/dev/null 2>&1; then
        mongosh "${MONGODB_URI}" --eval "db.runCommand({ ping: 1 })" >/dev/null 2>&1 || {
            echo -e "${RED}❌ Cannot connect to MongoDB${NC}"
            exit 1
        }
    else
        echo -e "${YELLOW}⚠️  Cannot verify connection (mongosh not found), proceeding...${NC}"
    fi
    
    echo -e "${GREEN}✅ MongoDB connection validated${NC}"
}

# Create safety backup of current state
create_safety_backup() {
    if [ "${SKIP_BACKUP}" = "true" ]; then
        echo -e "${YELLOW}⚠️  Skipping safety backup (SKIP_BACKUP=true)${NC}"
        return
    fi
    
    echo -e "${YELLOW}💾 Creating safety backup of current state...${NC}"
    echo -e "${BLUE}   This allows rollback if restore fails${NC}"
    
    local safety_backup_dir="./backups/safety-backup-${TIMESTAMP}"
    mkdir -p "${safety_backup_dir}"
    
    mongodump \
        --uri="${MONGODB_URI}" \
        --out="${safety_backup_dir}/dump" \
        --gzip \
        >/dev/null 2>&1 || {
        echo -e "${YELLOW}⚠️  Safety backup failed, but continuing...${NC}"
        return
    }
    
    # Compress
    tar -czf "${safety_backup_dir}.tar.gz" -C "./backups" "safety-backup-${TIMESTAMP}" 2>/dev/null
    rm -rf "${safety_backup_dir}"
    
    SAFETY_BACKUP_FILE="${safety_backup_dir}.tar.gz"
    
    echo -e "${GREEN}✅ Safety backup created: ${SAFETY_BACKUP_FILE}${NC}"
}

# Extract backup
extract_backup() {
    echo -e "${YELLOW}📦 Extracting backup...${NC}"
    
    tar -xzf "${BACKUP_FILE}" -C "${TEMP_DIR}"
    
    # Find the dump directory
    DUMP_DIR=$(find "${TEMP_DIR}" -type d -name "dump" | head -n 1)
    
    if [ -z "${DUMP_DIR}" ]; then
        echo -e "${RED}❌ Cannot find dump directory in backup${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Backup extracted to: ${DUMP_DIR}${NC}"
}

# Confirm restore action
confirm_restore() {
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                        ⚠️  WARNING  ⚠️                          ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo -e "${RED}This will REPLACE the current database with the backup!${NC}"
    echo -e "${YELLOW}Current data will be LOST unless you've created a backup.${NC}"
    echo ""
    
    # Check if running in CI
    if [ -n "${CI:-}" ] || [ -n "${GITHUB_ACTIONS:-}" ]; then
        echo -e "${BLUE}Running in CI/CD environment, auto-confirming...${NC}"
        return
    fi
    
    read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirmation
    
    if [ "${confirmation}" != "yes" ]; then
        echo -e "${YELLOW}❌ Restore cancelled by user${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Restore confirmed${NC}"
}

# Perform restore
perform_restore() {
    echo -e "${YELLOW}🔄 Restoring MongoDB from backup...${NC}"
    echo -e "${BLUE}   This may take several minutes depending on database size${NC}"
    
    local start_time=$(date +%s)
    
    # Drop existing database first (optional, controlled by --drop flag)
    mongorestore \
        --uri="${MONGODB_URI}" \
        --dir="${DUMP_DIR}" \
        --gzip \
        --drop \
        --verbose 2>&1 | tee "${TEMP_DIR}/mongorestore.log"
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    RESTORE_DURATION=${duration}
    
    echo -e "${GREEN}✅ Restore completed in ${duration}s${NC}"
}

# Verify restore
verify_restore() {
    echo -e "${YELLOW}🔍 Verifying restore...${NC}"
    
    # Try to connect and run a simple query
    if command -v mongosh >/dev/null 2>&1; then
        local doc_count=$(mongosh "${MONGODB_URI}" --quiet --eval "db.users.countDocuments({})" 2>/dev/null || echo "0")
        
        if [ "${doc_count}" -gt 0 ]; then
            echo -e "${GREEN}✅ Database restored successfully (found ${doc_count} users)${NC}"
        else
            echo -e "${YELLOW}⚠️  Database restored but appears empty${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Cannot verify restore (mongosh not found)${NC}"
    fi
}

# Generate restore report
generate_report() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                    Restore Summary                             ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo -e "${GREEN}✅ Database restored successfully!${NC}"
    echo ""
    echo -e "📦 Backup file:      ${BACKUP_FILE}"
    echo -e "⏱️  Restore time:     ${RESTORE_DURATION}s"
    echo -e "💾 Safety backup:    ${SAFETY_BACKUP_FILE:-N/A}"
    echo -e "📝 Restore log:      ${TEMP_DIR}/mongorestore.log"
    echo ""
    
    if [ -n "${SAFETY_BACKUP_FILE:-}" ]; then
        echo -e "${YELLOW}💡 If you need to rollback this restore, run:${NC}"
        echo -e "${BLUE}   ./restore-mongodb.sh ${SAFETY_BACKUP_FILE}${NC}"
        echo ""
    fi
    
    # Export for GitHub Actions
    if [ -n "${GITHUB_OUTPUT:-}" ]; then
        echo "restore_duration=${RESTORE_DURATION}" >> "${GITHUB_OUTPUT}"
        echo "safety_backup=${SAFETY_BACKUP_FILE:-N/A}" >> "${GITHUB_OUTPUT}"
    fi
}

# Main execution
main() {
    check_dependencies
    validate_backup_file
    verify_integrity
    validate_connection
    create_safety_backup
    extract_backup
    confirm_restore
    perform_restore
    verify_restore
    generate_report
}

# Run main function
main "$@"
