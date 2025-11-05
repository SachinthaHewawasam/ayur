# Test Refactored Endpoints Script
# This script tests the refactored controllers

param(
    [string]$Token = "",
    [string]$BaseUrl = "http://localhost:5000"
)

Write-Host "🧪 Testing Refactored Endpoints..." -ForegroundColor Cyan
Write-Host ""

if ($Token -eq "") {
    Write-Host "⚠️  No auth token provided. Some tests will fail." -ForegroundColor Yellow
    Write-Host "   Usage: .\test-endpoints.ps1 -Token 'YOUR_JWT_TOKEN'" -ForegroundColor Gray
    Write-Host ""
}

$headers = @{
    "Content-Type" = "application/json"
}

if ($Token -ne "") {
    $headers["Authorization"] = "Bearer $Token"
}

$passed = 0
$failed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers,
        [string]$Body = $null
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    Write-Host "  $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params["Body"] = $Body
        }
        
        $response = Invoke-WebRequest @params -UseBasicParsing
        
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
            Write-Host "  ✓ PASSED (Status: $($response.StatusCode))" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ✗ FAILED (Status: $($response.StatusCode))" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  ✗ FAILED (Error: $($_.Exception.Message))" -ForegroundColor Red
        return $false
    }
}

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "1. Testing Health Check" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if (Test-Endpoint -Name "Health Check" -Method "GET" -Url "$BaseUrl/health" -Headers @{}) {
    $passed++
} else {
    $failed++
}
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "2. Testing Patient Endpoints" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if (Test-Endpoint -Name "Get Patients" -Method "GET" -Url "$BaseUrl/api/patients" -Headers $headers) {
    $passed++
} else {
    $failed++
}
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "3. Testing Medicine Endpoints" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if (Test-Endpoint -Name "Get Medicines" -Method "GET" -Url "$BaseUrl/api/medicines" -Headers $headers) {
    $passed++
} else {
    $failed++
}
Write-Host ""

if (Test-Endpoint -Name "Get Low Stock Alerts" -Method "GET" -Url "$BaseUrl/api/medicines/alerts/low-stock" -Headers $headers) {
    $passed++
} else {
    $failed++
}
Write-Host ""

if (Test-Endpoint -Name "Get Inventory Stats" -Method "GET" -Url "$BaseUrl/api/medicines/stats" -Headers $headers) {
    $passed++
} else {
    $failed++
}
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "4. Testing Appointment Endpoints" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if (Test-Endpoint -Name "Get Appointments" -Method "GET" -Url "$BaseUrl/api/appointments" -Headers $headers) {
    $passed++
} else {
    $failed++
}
Write-Host ""

if (Test-Endpoint -Name "Get Today's Appointments" -Method "GET" -Url "$BaseUrl/api/appointments/today" -Headers $headers) {
    $passed++
} else {
    $failed++
}
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Total Tests: $($passed + $failed)" -ForegroundColor White
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Check the output above." -ForegroundColor Yellow
    if ($Token -eq "") {
        Write-Host "   Note: Tests may fail without authentication token." -ForegroundColor Gray
    }
}
Write-Host ""
