#!/usr/bin/env pwsh

# Smart Academic Management - Local Deployment Script
# Requiere: Docker, Docker Compose, Node.js 18+

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Smart Academic Management - Local Setup              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Verifications
Write-Host "`n[1/5] Verificando requisitos..." -ForegroundColor Yellow

# Check Docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker no está instalado" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker instalado" -ForegroundColor Green

# Check Docker Compose
if (!(docker compose version 2>&1 | Select-String -Pattern "Docker Compose" -Quiet)) {
    Write-Host "❌ Docker Compose no está instalado" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker Compose instalado" -ForegroundColor Green

# Step 2: Create .env files
Write-Host "`n[2/5] Creando archivos .env..." -ForegroundColor Yellow

$services = @("auth-service", "enrollment-service", "subject-service")
foreach ($service in $services) {
    $envPath = "backend/$service/.env"
    $envExamplePath = "backend/$service/.env.example"
    
    if (!(Test-Path $envPath)) {
        Copy-Item -Path $envExamplePath -Destination $envPath
        Write-Host "✓ Creado $service/.env" -ForegroundColor Green
    }
    else {
        Write-Host "✓ $service/.env ya existe" -ForegroundColor Green
    }
}

# Step 3: Start Docker Compose
Write-Host "`n[3/5] Iniciando contenedores Docker..." -ForegroundColor Yellow

docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al iniciar contenedores" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Contenedores iniciados" -ForegroundColor Green

# Step 4: Wait for services
Write-Host "`n[4/5] Esperando a que los servicios estén listos..." -ForegroundColor Yellow

$maxRetries = 30
$retries = 0
$allHealthy = $false

while ($retries -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/profile" -Method Options -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 404) {
            $allHealthy = $true
            break
        }
    }
    catch {
        # Continue waiting
    }
    
    Start-Sleep -Seconds 1
    $retries++
}

if ($allHealthy) {
    Write-Host "✓ Servicios están listos" -ForegroundColor Green
}
else {
    Write-Host "⚠ Servicios aún iniciándose, verifica logs con: docker-compose logs -f" -ForegroundColor Yellow
}

# Step 5: Display URLs
Write-Host "`n[5/5] Configuración completada" -ForegroundColor Yellow

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║      Smart Campus - Desarrollo Local Iniciado         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`nURLs de Servicios:" -ForegroundColor Cyan
Write-Host "  • Auth Service:       http://localhost:3000" -ForegroundColor Gray
Write-Host "  • Enrollment Service: http://localhost:3001" -ForegroundColor Gray
Write-Host "  • Subject Service:    http://localhost:3002" -ForegroundColor Gray

Write-Host "`nBasas de Datos:" -ForegroundColor Cyan
Write-Host "  • PostgreSQL Auth:       localhost:5432" -ForegroundColor Gray
Write-Host "  • PostgreSQL Enrollment: localhost:5433" -ForegroundColor Gray
Write-Host "  • PostgreSQL Subject:    localhost:5434" -ForegroundColor Gray
Write-Host "  • Redis:                 localhost:6379" -ForegroundColor Gray

Write-Host "`nComandos útiles:" -ForegroundColor Cyan
Write-Host "  • Ver logs:    docker-compose logs -f" -ForegroundColor Gray
Write-Host "  • Detener:     docker-compose down" -ForegroundColor Gray
Write-Host "  • Restart:     docker-compose restart" -ForegroundColor Gray
Write-Host "  • Status:      docker-compose ps" -ForegroundColor Gray

Write-Host "`n"
