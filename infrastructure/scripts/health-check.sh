#!/bin/bash

################################################################################
# Health Check Script
# Description: Performs comprehensive health checks on the deployed application
# Usage: ./health-check.sh
# Environment Variables:
#   - BACKEND_URL: Backend API URL (required)
#   - FRONTEND_URL: Frontend URL (optional)
#   - HEALTH_CHECK_TIMEOUT: Timeout in seconds (default: 30)
################################################################################

set -e
set -u
set -o pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║            Health Check - Production Environment              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
BACKEND_URL="${BACKEND_URL:-}"
FRONTEND_URL="${FRONTEND_URL:-}"
TIMEOUT="${HEALTH_CHECK_TIMEOUT:-30}"
REPORT_FILE="health-check-report-$(date +'%Y%m%d-%H%M%S').json"

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Results array
declare -a RESULTS

# Add result
add_result() {
    local check_name="$1"
    local status="$2"  # PASS, FAIL, WARNING
    local message="$3"
    local duration="${4:-0}"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    case $status in
        PASS)
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
            echo -e "${GREEN}✅ ${check_name}: ${message}${NC}"
            ;;
        FAIL)
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            echo -e "${RED}❌ ${check_name}: ${message}${NC}"
            ;;
        WARNING)
            WARNING_CHECKS=$((WARNING_CHECKS + 1))
            echo -e "${YELLOW}⚠️  ${check_name}: ${message}${NC}"
            ;;
    esac
    
    # Store result
    RESULTS+=("{\"check\":\"${check_name}\",\"status\":\"${status}\",\"message\":\"${message}\",\"duration_ms\":${duration}}")
}

# Check HTTP endpoint
check_http_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    echo -e "${YELLOW}🔍 Checking: ${name}${NC}"
    
    local start_time=$(date +%s%3N)
    local response=$(curl -s -o /dev/null -w "%{http_code},%{time_total}" --max-time ${TIMEOUT} "${url}" 2>/dev/null || echo "000,0")
    local end_time=$(date +%s%3N)
    
    local status_code=$(echo $response | cut -d',' -f1)
    local response_time=$(echo $response | cut -d',' -f2)
    local duration=$((end_time - start_time))
    
    if [ "${status_code}" = "${expected_status}" ]; then
        add_result "${name}" "PASS" "Status ${status_code}, Response time: ${response_time}s" "${duration}"
    else
        add_result "${name}" "FAIL" "Expected ${expected_status}, got ${status_code}" "${duration}"
    fi
}

# Check API endpoint with JSON response
check_api_endpoint() {
    local name="$1"
    local url="$2"
    local expected_field="$3"
    
    echo -e "${YELLOW}🔍 Checking: ${name}${NC}"
    
    local start_time=$(date +%s%3N)
    local response=$(curl -s --max-time ${TIMEOUT} "${url}" 2>/dev/null || echo "{}")
    local end_time=$(date +%s%3N)
    local duration=$((end_time - start_time))
    
    # Check if response contains expected field
    if echo "${response}" | jq -e ".${expected_field}" >/dev/null 2>&1; then
        local field_value=$(echo "${response}" | jq -r ".${expected_field}")
        add_result "${name}" "PASS" "API responding, ${expected_field}: ${field_value}" "${duration}"
    else
        add_result "${name}" "FAIL" "API not responding correctly" "${duration}"
    fi
}

# Check database connectivity
check_database() {
    local name="Database Connectivity"
    
    if [ -z "${BACKEND_URL}" ]; then
        add_result "${name}" "WARNING" "Cannot check (BACKEND_URL not set)" "0"
        return
    fi
    
    echo -e "${YELLOW}🔍 Checking: ${name}${NC}"
    
    local url="${BACKEND_URL}/api/health"
    local start_time=$(date +%s%3N)
    local response=$(curl -s --max-time ${TIMEOUT} "${url}" 2>/dev/null || echo "{}")
    local end_time=$(date +%s%3N)
    local duration=$((end_time - start_time))
    
    # Check database status in health response
    if echo "${response}" | jq -e '.database' >/dev/null 2>&1; then
        local db_status=$(echo "${response}" | jq -r '.database')
        if [ "${db_status}" = "connected" ] || [ "${db_status}" = "healthy" ]; then
            add_result "${name}" "PASS" "Database is ${db_status}" "${duration}"
        else
            add_result "${name}" "FAIL" "Database status: ${db_status}" "${duration}"
        fi
    else
        add_result "${name}" "WARNING" "Cannot determine database status" "${duration}"
    fi
}

# Check authentication endpoints
check_auth_endpoints() {
    if [ -z "${BACKEND_URL}" ]; then
        return
    fi
    
    # Check login endpoint exists
    check_http_endpoint "Auth - Login Endpoint" "${BACKEND_URL}/api/auth/login" "405"
    
    # Check register endpoint exists (might be disabled)
    check_http_endpoint "Auth - Register Endpoint" "${BACKEND_URL}/api/auth/register" "405"
}

# Check critical API endpoints
check_critical_endpoints() {
    if [ -z "${BACKEND_URL}" ]; then
        add_result "Critical API Endpoints" "WARNING" "Cannot check (BACKEND_URL not set)" "0"
        return
    fi
    
    # Properties endpoint
    check_http_endpoint "Properties Endpoint" "${BACKEND_URL}/api/properties" "200"
    
    # Users endpoint (should require auth)
    check_http_endpoint "Users Endpoint" "${BACKEND_URL}/api/users" "401"
}

# Check response times
check_response_times() {
    if [ -z "${BACKEND_URL}" ]; then
        return
    fi
    
    echo -e "${YELLOW}🔍 Checking: Response Times${NC}"
    
    local url="${BACKEND_URL}/api/health"
    local total_time=0
    local checks=5
    
    for i in $(seq 1 ${checks}); do
        local response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time ${TIMEOUT} "${url}" 2>/dev/null || echo "0")
        total_time=$(echo "${total_time} + ${response_time}" | bc)
        sleep 0.5
    done
    
    local avg_time=$(echo "scale=3; ${total_time} / ${checks}" | bc)
    local threshold=2.0
    
    if (( $(echo "${avg_time} < ${threshold}" | bc -l) )); then
        add_result "Average Response Time" "PASS" "Average: ${avg_time}s (threshold: ${threshold}s)" "0"
    else
        add_result "Average Response Time" "WARNING" "Average: ${avg_time}s (exceeds threshold: ${threshold}s)" "0"
    fi
}

# Check frontend
check_frontend() {
    if [ -z "${FRONTEND_URL}" ]; then
        add_result "Frontend" "WARNING" "Cannot check (FRONTEND_URL not set)" "0"
        return
    fi
    
    check_http_endpoint "Frontend - Home Page" "${FRONTEND_URL}" "200"
    check_http_endpoint "Frontend - About Page" "${FRONTEND_URL}/about" "200"
}

# Check SSL certificate
check_ssl() {
    if [ -z "${BACKEND_URL}" ]; then
        return
    fi
    
    # Only check if URL is HTTPS
    if [[ "${BACKEND_URL}" != https://* ]]; then
        add_result "SSL Certificate" "WARNING" "URL is not HTTPS" "0"
        return
    fi
    
    echo -e "${YELLOW}🔍 Checking: SSL Certificate${NC}"
    
    local domain=$(echo "${BACKEND_URL}" | sed -e 's|^https://||' -e 's|/.*||')
    local expiry=$(echo | openssl s_client -servername "${domain}" -connect "${domain}:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
    
    if [ -n "${expiry}" ]; then
        local expiry_epoch=$(date -d "${expiry}" +%s 2>/dev/null || echo "0")
        local now_epoch=$(date +%s)
        local days_until_expiry=$(( (expiry_epoch - now_epoch) / 86400 ))
        
        if [ ${days_until_expiry} -gt 30 ]; then
            add_result "SSL Certificate" "PASS" "Valid, expires in ${days_until_expiry} days" "0"
        elif [ ${days_until_expiry} -gt 0 ]; then
            add_result "SSL Certificate" "WARNING" "Expires soon (${days_until_expiry} days)" "0"
        else
            add_result "SSL Certificate" "FAIL" "Certificate expired" "0"
        fi
    else
        add_result "SSL Certificate" "WARNING" "Cannot verify certificate" "0"
    fi
}

# Generate JSON report
generate_report() {
    local timestamp=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
    local health_status="HEALTHY"
    
    if [ ${FAILED_CHECKS} -gt 0 ]; then
        health_status="UNHEALTHY"
    elif [ ${WARNING_CHECKS} -gt 0 ]; then
        health_status="DEGRADED"
    fi
    
    # Build JSON array from results
    local results_json=$(printf '%s\n' "${RESULTS[@]}" | jq -s '.')
    
    # Create report
    cat > "${REPORT_FILE}" <<EOF
{
  "timestamp": "${timestamp}",
  "health_status": "${health_status}",
  "summary": {
    "total_checks": ${TOTAL_CHECKS},
    "passed": ${PASSED_CHECKS},
    "failed": ${FAILED_CHECKS},
    "warnings": ${WARNING_CHECKS}
  },
  "environment": {
    "backend_url": "${BACKEND_URL:-N/A}",
    "frontend_url": "${FRONTEND_URL:-N/A}"
  },
  "checks": ${results_json}
}
EOF
    
    echo ""
    echo -e "${BLUE}📊 Report saved to: ${REPORT_FILE}${NC}"
}

# Print summary
print_summary() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                     Health Check Summary                       ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    
    echo -e "Total Checks:    ${TOTAL_CHECKS}"
    echo -e "${GREEN}✅ Passed:        ${PASSED_CHECKS}${NC}"
    echo -e "${RED}❌ Failed:        ${FAILED_CHECKS}${NC}"
    echo -e "${YELLOW}⚠️  Warnings:      ${WARNING_CHECKS}${NC}"
    echo ""
    
    local health_status="HEALTHY"
    local status_color="${GREEN}"
    
    if [ ${FAILED_CHECKS} -gt 0 ]; then
        health_status="UNHEALTHY"
        status_color="${RED}"
    elif [ ${WARNING_CHECKS} -gt 0 ]; then
        health_status="DEGRADED"
        status_color="${YELLOW}"
    fi
    
    echo -e "${status_color}Overall Status: ${health_status}${NC}"
    echo ""
    
    # Export for GitHub Actions
    if [ -n "${GITHUB_OUTPUT:-}" ]; then
        echo "health_status=${health_status}" >> "${GITHUB_OUTPUT}"
        echo "passed_checks=${PASSED_CHECKS}" >> "${GITHUB_OUTPUT}"
        echo "failed_checks=${FAILED_CHECKS}" >> "${GITHUB_OUTPUT}"
        echo "warning_checks=${WARNING_CHECKS}" >> "${GITHUB_OUTPUT}"
        echo "report_file=${REPORT_FILE}" >> "${GITHUB_OUTPUT}"
    fi
}

# Main execution
main() {
    # Validate required variables
    if [ -z "${BACKEND_URL}" ]; then
        echo -e "${RED}❌ BACKEND_URL environment variable not set${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}Backend URL:  ${BACKEND_URL}${NC}"
    echo -e "${BLUE}Frontend URL: ${FRONTEND_URL:-Not set}${NC}"
    echo -e "${BLUE}Timeout:      ${TIMEOUT}s${NC}"
    echo ""
    
    # Run all checks
    check_api_endpoint "Health Endpoint" "${BACKEND_URL}/api/health" "status"
    check_database
    check_auth_endpoints
    check_critical_endpoints
    check_response_times
    check_frontend
    check_ssl
    
    # Generate report and summary
    generate_report
    print_summary
    
    # Exit with appropriate code
    if [ ${FAILED_CHECKS} -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

# Run main
main "$@"
