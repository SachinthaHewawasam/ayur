# Safe Controller Replacement Script
Write-Host "Starting Safe Controller Replacement..." -ForegroundColor Cyan
Write-Host ""

$controllersPath = "src/controllers"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupSuffix = ".backup-$timestamp"

# Controllers to replace
$controllers = @(
    "patient.controller.js",
    "medicine.controller.js",
    "appointment.controller.js"
)

Write-Host "Controllers to replace:" -ForegroundColor Yellow
foreach ($ctrl in $controllers) {
    Write-Host "   - $ctrl" -ForegroundColor Gray
}
Write-Host ""

# Step 1: Backup
Write-Host "Step 1: Backing up old controllers..." -ForegroundColor Green
foreach ($ctrl in $controllers) {
    $oldFile = Join-Path $controllersPath $ctrl
    $backupFile = "$oldFile$backupSuffix"
    
    if (Test-Path $oldFile) {
        Copy-Item $oldFile $backupFile
        Write-Host "   Backed up: $ctrl" -ForegroundColor Green
    } else {
        Write-Host "   Not found: $ctrl" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 2: Replace
Write-Host "Step 2: Replacing with refactored versions..." -ForegroundColor Green
$replaced = 0
foreach ($ctrl in $controllers) {
    $baseName = $ctrl -replace "\.js$", ""
    $refactoredFile = Join-Path $controllersPath "$baseName.refactored.js"
    $targetFile = Join-Path $controllersPath $ctrl
    
    if (Test-Path $refactoredFile) {
        Copy-Item $refactoredFile $targetFile -Force
        Write-Host "   Replaced: $ctrl" -ForegroundColor Green
        $replaced++
    } else {
        Write-Host "   Refactored version not found: $refactoredFile" -ForegroundColor Red
    }
}
Write-Host ""

# Summary
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "   Controllers replaced: $replaced/$($controllers.Count)" -ForegroundColor White
Write-Host "   Backup suffix: $backupSuffix" -ForegroundColor White
Write-Host ""

if ($replaced -eq $controllers.Count) {
    Write-Host "All controllers successfully replaced!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Start server: npm run dev" -ForegroundColor Gray
    Write-Host "   2. Test endpoints" -ForegroundColor Gray
    Write-Host "   3. If issues: .\rollback-controllers.ps1" -ForegroundColor Gray
} else {
    Write-Host "Some controllers were not replaced." -ForegroundColor Yellow
}
Write-Host ""
