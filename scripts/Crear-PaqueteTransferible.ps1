[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$packageDirectory = Join-Path $repoRoot 'paquetes'
$timestamp = Get-Date -Format 'yyyy-MM-dd_HHmm'
$zipPath = Join-Path $packageDirectory "Mantenimiento-Industrial-$timestamp.zip"
$temporaryRoot = Join-Path ([IO.Path]::GetTempPath()) "mantenimiento-paquete-$([Guid]::NewGuid())"
$stagingRoot = Join-Path $temporaryRoot 'mantenimiento-industrial'

try {
    New-Item -ItemType Directory -Path $packageDirectory -Force | Out-Null
    New-Item -ItemType Directory -Path $stagingRoot -Force | Out-Null

    Write-Host 'Copiando archivos seguros del proyecto...' -ForegroundColor Cyan
    & robocopy.exe $repoRoot $stagingRoot /E `
        /XD `
            (Join-Path $repoRoot '.git') `
            (Join-Path $repoRoot 'paquetes') `
            (Join-Path $repoRoot 'backend\node_modules') `
            (Join-Path $repoRoot 'frontend\node_modules') `
            (Join-Path $repoRoot 'frontend\dist') `
        /XF '.env' '*.log' `
        /R:1 /W:1 /NFL /NDL /NJH /NJS /NP | Out-Null

    if ($LASTEXITCODE -ge 8) {
        throw "Robocopy no pudo preparar el paquete (codigo $LASTEXITCODE)."
    }

    Write-Host 'Comprimiendo el paquete...' -ForegroundColor Cyan
    Compress-Archive -LiteralPath $stagingRoot -DestinationPath $zipPath -CompressionLevel Optimal

    Write-Host "`nPaquete creado:" -ForegroundColor Green
    Write-Host "  $zipPath"
    Write-Host 'No contiene .env, contrasenas, base de datos, node_modules ni historial Git.'
    Write-Host 'En la otra PC: descomprima y ejecute CREAR_ACCESO_DIRECTO.cmd.'
    exit 0
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    $resolvedTempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
    $resolvedTemporaryRoot = [IO.Path]::GetFullPath($temporaryRoot)
    if ($resolvedTemporaryRoot.StartsWith($resolvedTempBase, [StringComparison]::OrdinalIgnoreCase) -and
        (Test-Path -LiteralPath $resolvedTemporaryRoot)) {
        Remove-Item -LiteralPath $resolvedTemporaryRoot -Recurse -Force
    }
}
