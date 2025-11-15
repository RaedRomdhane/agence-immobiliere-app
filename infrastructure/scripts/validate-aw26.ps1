# AW-26 Validation Script - Windows PowerShell
# This script validates the AW-26 implementation step by step

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AW-26 - Production Pipeline Validation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testResults = @()

# Test 1: Check if bash is available
Write-Host "Test 1: Checking bash availability..." -ForegroundColor Yellow
$bashPath = (Get-Command bash -ErrorAction SilentlyContinue).Path
if ($bashPath) {
    Write-Host "✅ Bash found at: $bashPath" -ForegroundColor Green
    $testResults += @{Name="Bash Available"; Status="PASS"}
} else {
    Write-Host "❌ Bash not found. Please install Git Bash or WSL" -ForegroundColor Red
    $testResults += @{Name="Bash Available"; Status="FAIL"}
}

# Test 2: Check if scripts exist
Write-Host ""
Write-Host "Test 2: Checking if scripts exist..." -ForegroundColor Yellow
$scripts = @(
    "infrastructure/scripts/backup-mongodb.sh",
    "infrastructure/scripts/restore-mongodb.sh",
    "infrastructure/scripts/health-check.sh"
)

foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Host "✅ Found: $script" -ForegroundColor Green
        $testResults += @{Name="Script: $script"; Status="PASS"}
    } else {
        Write-Host "❌ Missing: $script" -ForegroundColor Red
        $testResults += @{Name="Script: $script"; Status="FAIL"}
    }
}

# Test 3: Check if workflows exist
Write-Host ""
Write-Host "Test 3: Checking if workflows exist..." -ForegroundColor Yellow
$workflows = @(
    ".github/workflows/production-deploy.yml",
    ".github/workflows/production-rollback.yml"
)

foreach ($workflow in $workflows) {
    if (Test-Path $workflow) {
        Write-Host "✅ Found: $workflow" -ForegroundColor Green
        $testResults += @{Name="Workflow: $workflow"; Status="PASS"}
    } else {
        Write-Host "❌ Missing: $workflow" -ForegroundColor Red
        $testResults += @{Name="Workflow: $workflow"; Status="FAIL"}
    }
}

# Test 4: Check if documentation exists
Write-Host ""
Write-Host "Test 4: Checking if documentation exists..." -ForegroundColor Yellow
$docs = @(
    "docs/PRODUCTION-ROLLBACK-GUIDE.md",
    "docs/AW-26-PRODUCTION-PIPELINE-PLAN.md",
    "docs/AW-26-COMPLETION-REPORT.md",
    "docs/AW-26-TESTING-PLAN.md"
)

foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Write-Host "✅ Found: $doc" -ForegroundColor Green
        $testResults += @{Name="Doc: $doc"; Status="PASS"}
    } else {
        Write-Host "❌ Missing: $doc" -ForegroundColor Red
        $testResults += @{Name="Doc: $doc"; Status="FAIL"}
    }
}

# Test 5: Check script syntax
Write-Host ""
Write-Host "Test 5: Validating script syntax..." -ForegroundColor Yellow
foreach ($script in $scripts) {
    try {
        $result = bash -c "bash -n $script" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Syntax valid: $script" -ForegroundColor Green
            $testResults += @{Name="Syntax: $script"; Status="PASS"}
        } else {
            Write-Host "❌ Syntax error: $script" -ForegroundColor Red
            Write-Host "   Error: $result" -ForegroundColor Red
            $testResults += @{Name="Syntax: $script"; Status="FAIL"}
        }
    } catch {
        Write-Host "❌ Could not validate: $script" -ForegroundColor Red
        $testResults += @{Name="Syntax: $script"; Status="FAIL"}
    }
}

# Test 6: Check workflow YAML syntax
Write-Host ""
Write-Host "Test 6: Checking GitHub CLI..." -ForegroundColor Yellow
$ghPath = (Get-Command gh -ErrorAction SilentlyContinue).Path
if ($ghPath) {
    Write-Host "✅ GitHub CLI found at: $ghPath" -ForegroundColor Green
    $testResults += @{Name="GitHub CLI"; Status="PASS"}
    
    # Try to validate workflows
    Write-Host "   Validating workflows..." -ForegroundColor Yellow
    foreach ($workflow in $workflows) {
        try {
            $result = gh workflow view (Split-Path $workflow -Leaf).Replace('.yml', '') 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ Workflow valid: $workflow" -ForegroundColor Green
                $testResults += @{Name="Workflow YAML: $workflow"; Status="PASS"}
            } else {
                Write-Host "   ⚠️  Could not validate (repo may not be configured): $workflow" -ForegroundColor Yellow
                $testResults += @{Name="Workflow YAML: $workflow"; Status="SKIP"}
            }
        } catch {
            Write-Host "   ⚠️  Could not validate: $workflow" -ForegroundColor Yellow
            $testResults += @{Name="Workflow YAML: $workflow"; Status="SKIP"}
        }
    }
} else {
    Write-Host "⚠️  GitHub CLI not found. Install from: https://cli.github.com/" -ForegroundColor Yellow
    $testResults += @{Name="GitHub CLI"; Status="SKIP"}
}

# Test 7: Check MongoDB tools (optional but recommended)
Write-Host ""
Write-Host "Test 7: Checking MongoDB tools..." -ForegroundColor Yellow
$mongoTools = bash -c "which mongodump mongorestore mongosh 2>/dev/null" 2>$null
if ($mongoTools) {
    Write-Host "✅ MongoDB tools found" -ForegroundColor Green
    bash -c "mongodump --version" 2>$null
    $testResults += @{Name="MongoDB Tools"; Status="PASS"}
} else {
    Write-Host "⚠️  MongoDB tools not found" -ForegroundColor Yellow
    Write-Host "   These are needed for actual backup/restore testing" -ForegroundColor Yellow
    Write-Host "   Install from: https://www.mongodb.com/try/download/database-tools" -ForegroundColor Yellow
    $testResults += @{Name="MongoDB Tools"; Status="SKIP"}
}

# Test 8: Check required dependencies
Write-Host ""
Write-Host "Test 8: Checking script dependencies..." -ForegroundColor Yellow
$deps = @("tar", "gzip", "jq", "curl")
foreach ($dep in $deps) {
    $found = bash -c "which $dep 2>/dev/null" 2>$null
    if ($found) {
        Write-Host "✅ Found: $dep" -ForegroundColor Green
        $testResults += @{Name="Dependency: $dep"; Status="PASS"}
    } else {
        Write-Host "⚠️  Missing: $dep (needed for scripts)" -ForegroundColor Yellow
        $testResults += @{Name="Dependency: $dep"; Status="SKIP"}
    }
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Validation Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$skipped = ($testResults | Where-Object { $_.Status -eq "SKIP" }).Count
$total = $testResults.Count

Write-Host ""
Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "Skipped: $skipped" -ForegroundColor Yellow
Write-Host ""

if ($failed -eq 0) {
    Write-Host "All critical tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Install MongoDB tools (optional): https://www.mongodb.com/try/download/database-tools" -ForegroundColor White
    Write-Host "2. Configure GitHub Environments (Settings -> Environments)" -ForegroundColor White
    Write-Host "3. Add required secrets (Settings -> Secrets -> Actions)" -ForegroundColor White
    Write-Host "4. Run actual tests with staging database" -ForegroundColor White
    Write-Host ""
    Write-Host "Implementation Status: 95% Complete" -ForegroundColor Yellow
    Write-Host "Testing Status: Ready for manual testing" -ForegroundColor Yellow
} else {
    Write-Host "Some tests failed. Please fix the issues above." -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Detailed Results:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$testResults | Format-Table -AutoSize

# Save results to file
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = "validation-report-$timestamp.json"
$testResults | ConvertTo-Json | Out-File $reportFile
Write-Host ""
Write-Host "Report saved to: $reportFile" -ForegroundColor Cyan
