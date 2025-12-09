# Monitoring Stack Health Check Script
# Tests all monitoring components are running and accessible

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  Monitoring Stack Health Check" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="Prometheus"; Port=9090; Path="/api/v1/targets"},
    @{Name="Alertmanager"; Port=9093; Path="/api/v2/status"},
    @{Name="Grafana"; Port=3000; Path="/api/health"},
    @{Name="Loki"; Port=3100; Path="/ready"}
)

$allHealthy = $true

foreach ($service in $services) {
    Write-Host "Checking $($service.Name)..." -NoNewline
    try {
        $url = "http://localhost:$($service.Port)$($service.Path)"
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host " ✅ HEALTHY" -ForegroundColor Green
            Write-Host "   URL: http://localhost:$($service.Port)" -ForegroundColor Gray
        } else {
            Write-Host " ⚠️  WARNING (Status: $($response.StatusCode))" -ForegroundColor Yellow
            $allHealthy = $false
        }
    } catch {
        Write-Host " ❌ FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        $allHealthy = $false
    }
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan

# Check Docker containers
Write-Host ""
Write-Host "Docker Container Status:" -ForegroundColor Cyan
docker ps --filter "name=prometheus|grafana|alertmanager|loki|promtail" --format "table {{.Names}}\t{{.Status}}"

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan

if ($allHealthy) {
    Write-Host "✅ All monitoring services are healthy!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Quick Access:" -ForegroundColor Cyan
    Write-Host "  • Grafana:       http://localhost:3000 (admin/admin)" -ForegroundColor White
    Write-Host "  • Prometheus:    http://localhost:9090" -ForegroundColor White
    Write-Host "  • Alertmanager:  http://localhost:9093" -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Access Grafana and import dashboards" -ForegroundColor White
    Write-Host "  2. Configure alerting credentials in .env" -ForegroundColor White
    Write-Host "  3. Test alert delivery (see docs/PRODUCTION-MONITORING-GUIDE.md)" -ForegroundColor White
} else {
    Write-Host "⚠️  Some services are not healthy. Check logs with:" -ForegroundColor Yellow
    Write-Host "   docker logs <service-name>" -ForegroundColor Gray
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
