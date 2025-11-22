# PowerShell script to run all backend test files sequentially to avoid port conflicts

$testFiles = @(
    "tests/unit/sample.test.js",
    "tests/integration/authApi.test.js",
    "tests/integration/featureFlags.test.js",
    "tests/integration/monitoring.test.js",
    "tests/integration/passwordReset.test.js",
    "tests/integration/userApi.test.js"
)

foreach ($file in $testFiles) {
    Write-Host "Running test: $file"
    npm test -- --forceExit $file
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Test exited with code $LASTEXITCODE for $file" -ForegroundColor Yellow
    }
}
Write-Host "All tests completed sequentially! (Check above for any failures or warnings)" -ForegroundColor Green
