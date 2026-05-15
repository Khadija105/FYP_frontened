# Backend Startup Script for Windows PowerShell
# Usage: .\start_backend.ps1

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ART MARKETPLACE - BACKEND SERVER STARTUP" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path ".\.venv\Scripts\Activate.ps1")) {
    Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run: python -m venv .venv" -ForegroundColor Yellow
    exit 1
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1

# Check if requirements are installed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
pip show pymongo > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will be available at:" -ForegroundColor Cyan
Write-Host "  API:           http://localhost:8000" -ForegroundColor Green
Write-Host "  API Docs:      http://localhost:8000/docs" -ForegroundColor Green
Write-Host "  Alternative:   http://localhost:8000/redoc" -ForegroundColor Green
Write-Host "  Health Check:  http://localhost:8000/health" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
