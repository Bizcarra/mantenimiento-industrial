[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ruleName = 'MantenimientoIndustrialRedLocal'
$displayName = 'Mantenimiento Industrial - Red local privada'

try {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = [Security.Principal.WindowsPrincipal]::new($identity)
    $isAdministrator = $principal.IsInRole(
        [Security.Principal.WindowsBuiltInRole]::Administrator
    )
    if (-not $isAdministrator) {
        throw 'Esta configuracion requiere permisos de administrador.'
    }

    $nodePath = (Get-Command node.exe -ErrorAction Stop).Source
    $existingRule = Get-NetFirewallRule -Name $ruleName -ErrorAction SilentlyContinue

    if ($existingRule) {
        Remove-NetFirewallRule -Name $ruleName
    }

    New-NetFirewallRule -Name $ruleName -DisplayName $displayName `
        -Description 'Permite la aplicacion solo desde la subred local privada.' `
        -Direction Inbound -Action Allow -Enabled True -Protocol TCP `
        -LocalPort 5050 -Program $nodePath -Profile Private `
        -RemoteAddress LocalSubnet | Out-Null
    Write-Host 'Regla de Firewall creada o actualizada correctamente.' -ForegroundColor Green

    Write-Host 'Puerto permitido: TCP 5050'
    Write-Host 'Origen permitido: solamente la subred local'
    Write-Host 'Perfil permitido: solamente redes privadas'
    exit 0
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

