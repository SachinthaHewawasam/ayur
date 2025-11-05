# Rollback Controller Replacement Script
# This script restores the most recent backup of controllers

Write-Host "⏮️  Starting Controller Rollback..." -ForegroundColor Cyan
Write-Host ""

$controllersPath = "src/controllers"

# Find the most recent backup
$backupFiles = Get-ChildItem -Path $controllersPath -Filter "*.backup-*" | Sort-Object LastWriteTime -Descending

if ($backupFiles.Count -eq 0) {
    Write-Host "❌ No backup files found!" -ForegroundColor Red
    Write-Host "   Cannot rollback without backups." -ForegroundColor Yellow
    exit 1
}

# Get the backup timestamp from the first file
$firstBackup = $backupFiles[0].Name
$backupTimestamp = $firstBackup -replace '.*\.backup-(\d{8}-\d{6}).*', '$1'

Write-Host "📦 Found backup from: $backupTimestamp" -ForegroundColor Green
Write-Host ""

# Get all backups with this timestamp
$backupsToRestore = $backupFiles | Where-Object { $_.Name -like "*$backupTimestamp*" }

Write-Host "🔄 Restoring $($backupsToRestore.Count) controllers..." -ForegroundColor Yellow
Write-Host ""

$restored = 0
foreach ($backup in $backupsToRestore) {
    $originalName = $backup.Name -replace "\.backup-$backupTimestamp", ""
    $targetFile = Join-Path $controllersPath $originalName
    
    Copy-Item $backup.FullName $targetFile -Force
    Write-Host "   ✓ Restored: $originalName" -ForegroundColor Green
    $restored++
}

Write-Host ""
Write-Host "✅ Rollback complete!" -ForegroundColor Green
Write-Host "   Restored $restored controllers from backup $backupTimestamp" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Restart the server: npm run dev" -ForegroundColor Gray
Write-Host "   2. Verify everything works" -ForegroundColor Gray
Write-Host ""
