# Quick deployment script for Kubernetes
# Usage: .\deploy.ps1 -Environment production -Version 1.0.0

param(
    [Parameter(Mandatory=$true)]
    [string]$Environment,
    
    [Parameter(Mandatory=$true)]
    [string]$Version,
    
    [string]$Namespace = "production",
    [string]$Registry = "your-registry",
    [switch]$DryRun,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

Write-Host "Deploying Agence Immobiliere to Kubernetes" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Version: $Version" -ForegroundColor Yellow
Write-Host "Namespace: $Namespace" -ForegroundColor Yellow
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Cyan

$commands = @("kubectl", "helm", "docker")
foreach ($cmd in $commands) {
    if (!(Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Host "$cmd is not installed or not in PATH" -ForegroundColor Red
        exit 1
    }
    Write-Host "$cmd found" -ForegroundColor Green
}

# Check cluster connection
Write-Host ""
Write-Host "Checking Kubernetes cluster connection..." -ForegroundColor Cyan
try {
    $null = kubectl cluster-info 2>&1
    Write-Host "Connected to cluster" -ForegroundColor Green
}
catch {
    Write-Host "Cannot connect to Kubernetes cluster" -ForegroundColor Red
    exit 1
}

# Build and push images (if not skipped)
if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "Building Docker images..." -ForegroundColor Cyan
    
    # Backend
    Write-Host "Building backend image..." -ForegroundColor Yellow
    docker build -t "$Registry/agence-immobiliere-backend:$Version" -f backend/Dockerfile.production backend/
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Backend build failed" -ForegroundColor Red
        exit 1
    }
    
    # Frontend
    Write-Host "Building frontend image..." -ForegroundColor Yellow
    docker build -t "$Registry/agence-immobiliere-frontend:$Version" frontend/
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Frontend build failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Images built successfully" -ForegroundColor Green
    
    # Push images
    Write-Host ""
    Write-Host "Pushing images to registry..." -ForegroundColor Cyan
    docker push "$Registry/agence-immobiliere-backend:$Version"
    docker push "$Registry/agence-immobiliere-frontend:$Version"
    Write-Host "Images pushed successfully" -ForegroundColor Green
}

# Create namespace if it doesn't exist
Write-Host ""
Write-Host "Creating namespace if needed..." -ForegroundColor Cyan
kubectl create namespace $Namespace --dry-run=client -o yaml | kubectl apply -f -

# Check if secrets file exists
$secretsFile = "infrastructure/k8s/secrets-$Environment.yaml"
if (-not (Test-Path $secretsFile)) {
    Write-Host "Warning: Secrets file not found: $secretsFile" -ForegroundColor Yellow
    Write-Host "Using default values from values.yaml (not recommended for production)" -ForegroundColor Yellow
}

# Prepare Helm command
$helmArgs = @(
    "upgrade", "agence-immobiliere",
    "./infrastructure/k8s/helm/agence-immobiliere",
    "--install",
    "--namespace", $Namespace,
    "--set", "backend.image.repository=$Registry/agence-immobiliere-backend",
    "--set", "backend.image.tag=$Version",
    "--set", "frontend.image.repository=$Registry/agence-immobiliere-frontend",
    "--set", "frontend.image.tag=$Version",
    "--set", "global.environment=$Environment"
)

if (Test-Path $secretsFile) {
    $helmArgs += @("-f", $secretsFile)
}

if ($DryRun) {
    $helmArgs += @("--dry-run", "--debug")
    Write-Host ""
    Write-Host "Dry run mode - no changes will be made" -ForegroundColor Yellow
}

# Deploy with Helm
Write-Host ""
Write-Host "Deploying with Helm..." -ForegroundColor Cyan
& helm @helmArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed" -ForegroundColor Red
    exit 1
}

if (-not $DryRun) {
    Write-Host "Helm deployment successful" -ForegroundColor Green
    
    # Wait for rollout
    Write-Host ""
    Write-Host "Waiting for deployment rollout..." -ForegroundColor Cyan
    
    $deployments = @(
        "agence-immobiliere-backend",
        "agence-immobiliere-frontend"
    )
    
    foreach ($deploy in $deployments) {
        Write-Host "Waiting for $deploy..." -ForegroundColor Yellow
        kubectl rollout status deployment/$deploy -n $Namespace --timeout=5m
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Rollout failed for $deploy" -ForegroundColor Red
            Write-Host ""
            Write-Host "Showing recent events:" -ForegroundColor Yellow
            kubectl get events -n $Namespace --sort-by='.lastTimestamp' | Select-Object -Last 10
            exit 1
        }
    }
    
    Write-Host "All deployments rolled out successfully" -ForegroundColor Green
    
    # Show deployment status
    Write-Host ""
    Write-Host "Deployment Status:" -ForegroundColor Cyan
    kubectl get pods -n $Namespace -l app.kubernetes.io/name=agence-immobiliere
    
    Write-Host ""
    Write-Host "Services:" -ForegroundColor Cyan
    kubectl get svc -n $Namespace
    
    Write-Host ""
    Write-Host "Ingress:" -ForegroundColor Cyan
    kubectl get ingress -n $Namespace
    
    Write-Host ""
    Write-Host "HPA Status:" -ForegroundColor Cyan
    kubectl get hpa -n $Namespace
    
    # Test health endpoints
    Write-Host ""
    Write-Host "Testing health endpoints..." -ForegroundColor Cyan
    
    Write-Host "Setting up port-forward to test..." -ForegroundColor Yellow
    $backendJob = Start-Job -ScriptBlock {
        param($ns)
        kubectl port-forward -n $ns svc/agence-immobiliere-backend 5000:5000 2>&1 | Out-Null
    } -ArgumentList $Namespace
    
    Start-Sleep -Seconds 5
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "Backend health check passed" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "Backend health check failed: $_" -ForegroundColor Yellow
    }
    finally {
        Stop-Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job $backendJob -ErrorAction SilentlyContinue
    }
    
    Write-Host ""
    Write-Host "Deployment completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Configure DNS to point to the Ingress IP"
    Write-Host "2. Monitor the application: kubectl logs -n $Namespace -l app.kubernetes.io/name=agence-immobiliere --tail=50"
    Write-Host "3. Check metrics: kubectl port-forward -n $Namespace svc/agence-immobiliere-backend 5000:5000"
    Write-Host "4. View Grafana dashboards (if configured)"
}
