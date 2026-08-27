[CmdletBinding()]
param(
    [switch]$CrearAccesoDirecto
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$backendPath = Join-Path $repoRoot 'backend'
$frontendPath = Join-Path $repoRoot 'frontend'
$port = 5050

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Assert-CommandAvailable {
    param([string]$CommandName)
    if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
        throw "No se encontro '$CommandName'. Instalelo y vuelva a intentarlo."
    }
}

function Invoke-CheckedCommand {
    param(
        [string]$Executable,
        [string[]]$Arguments,
        [string]$WorkingDirectory,
        [string]$FailureMessage
    )

    Push-Location $WorkingDirectory
    try {
        & $Executable @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw $FailureMessage
        }
    }
    finally {
        Pop-Location
    }
}

function New-LocalEnvironment {
    $environmentPath = Join-Path $backendPath '.env'
    $examplePath = Join-Path $backendPath '.env.example'
    $environmentExists = Test-Path -LiteralPath $environmentPath

    if ($environmentExists) {
        $content = [IO.File]::ReadAllText($environmentPath)
        $secretMatch = [Text.RegularExpressions.Regex]::Match(
            $content,
            '(?m)^JWT_SECRET=(.*)$'
        )
        if ($secretMatch.Success -and $secretMatch.Groups[1].Value.Trim().Length -ge 32) {
            return
        }
    }
    else {
        if (-not (Test-Path -LiteralPath $examplePath)) {
            throw 'No se encontro backend\.env.example para generar la configuracion local.'
        }
        $content = [IO.File]::ReadAllText($examplePath)
    }

    $randomBytes = [byte[]]::new(48)
    $generator = [Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $generator.GetBytes($randomBytes)
    }
    finally {
        $generator.Dispose()
    }

    $secret = [Convert]::ToBase64String($randomBytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
    if ($content -match '(?m)^JWT_SECRET=.*$') {
        $content = [Text.RegularExpressions.Regex]::Replace(
            $content,
            '(?m)^JWT_SECRET=.*$',
            "JWT_SECRET=$secret"
        )
    }
    else {
        $content = "$content`r`nJWT_SECRET=$secret`r`n"
    }
    [IO.File]::WriteAllText(
        $environmentPath,
        $content,
        [Text.UTF8Encoding]::new($false)
    )
    if ($environmentExists) {
        Write-Host 'Se reforzo JWT_SECRET; las sesiones anteriores deberan iniciar nuevamente.' -ForegroundColor Green
    }
    else {
        Write-Host 'Se creo backend\.env con una clave JWT aleatoria.' -ForegroundColor Green
    }
}

function Test-TcpPort {
    param([int]$Port)

    $client = [Net.Sockets.TcpClient]::new()
    try {
        $connection = $client.ConnectAsync('127.0.0.1', $Port)
        return $connection.Wait(500) -and $client.Connected
    }
    catch {
        return $false
    }
    finally {
        $client.Dispose()
    }
}

function Wait-HttpEndpoint {
    param(
        [string]$Url,
        [string]$ExpectedText,
        [int]$TimeoutSeconds = 60
    )

    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    do {
        try {
            $contentLines = & curl.exe --silent --show-error --fail `
                --max-time 2 --noproxy '*' $Url 2>$null
            $content = $contentLines -join "`n"
            if ($LASTEXITCODE -eq 0 -and $content.Contains($ExpectedText)) {
                return $true
            }
        }
        catch {
            # El servidor puede seguir iniciando.
        }

        Start-Sleep -Milliseconds 750
    } while ([DateTime]::UtcNow -lt $deadline)

    return $false
}

function Get-LanIPv4 {
    $candidates = @()
    try {
        $candidates = @(
            Get-NetIPConfiguration -ErrorAction Stop |
                Where-Object { $_.IPv4DefaultGateway -and $_.NetAdapter.Status -eq 'Up' } |
                ForEach-Object { $_.IPv4Address.IPAddress }
        )
    }
    catch {
        # Se usa el metodo alternativo cuando NetTCPIP no esta disponible.
    }

    if ($candidates.Count -eq 0) {
        $candidates = @(
            [Net.Dns]::GetHostAddresses([Net.Dns]::GetHostName()) |
                Where-Object { $_.AddressFamily -eq [Net.Sockets.AddressFamily]::InterNetwork } |
                ForEach-Object { $_.IPAddressToString }
        )
    }

    $usable = $candidates | Where-Object {
        $_ -and $_ -ne '127.0.0.1' -and -not $_.StartsWith('169.254.')
    }
    $private = $usable | Where-Object {
        $_ -match '^10\.' -or
        $_ -match '^192\.168\.' -or
        $_ -match '^172\.(1[6-9]|2[0-9]|3[01])\.'
    }

    $selected = $private | Select-Object -First 1
    if (-not $selected) {
        $selected = $usable | Select-Object -First 1
    }
    if (-not $selected) {
        throw 'No se encontro una direccion IPv4 de red local. Confirme que el Wi-Fi este conectado.'
    }

    return $selected
}

function Start-LanBackend {
    param(
        [string]$LanIp,
        [string]$LanUrl
    )

    $safeDirectory = $backendPath.Replace("'", "''")
    $allowedHosts = "localhost,127.0.0.1,$LanIp"
    $allowedOrigins = "http://localhost:$port,http://127.0.0.1:$port,$LanUrl"
    $command = @"
`$Host.UI.RawUI.WindowTitle = 'Mantenimiento Industrial - Red Local'
[Environment]::SetEnvironmentVariable('HOST', '0.0.0.0', 'Process')
[Environment]::SetEnvironmentVariable('PORT', '$port', 'Process')
[Environment]::SetEnvironmentVariable('SERVE_FRONTEND', 'true', 'Process')
[Environment]::SetEnvironmentVariable('ALLOWED_HOSTS', '$allowedHosts', 'Process')
[Environment]::SetEnvironmentVariable('CORS_ORIGINS', '$allowedOrigins', 'Process')
[Environment]::SetEnvironmentVariable('ENFORCE_HTTPS', 'false', 'Process')
Set-Location -LiteralPath '$safeDirectory'
npm.cmd start
"@
    $encodedCommand = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($command))

    Start-Process -FilePath 'powershell.exe' -WorkingDirectory $backendPath -ArgumentList @(
        '-NoLogo',
        '-NoExit',
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-EncodedCommand', $encodedCommand
    ) | Out-Null
}

function New-LanDesktopShortcut {
    $launcherPath = Join-Path $repoRoot 'INICIAR_RED_LOCAL.cmd'
    $desktopPath = [Environment]::GetFolderPath([Environment+SpecialFolder]::DesktopDirectory)
    $shortcutPath = Join-Path $desktopPath 'Mantenimiento Industrial - Red Local.lnk'
    $iconPath = Join-Path $env:SystemRoot 'System32\shell32.dll'

    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $launcherPath
    $shortcut.WorkingDirectory = $repoRoot
    $shortcut.Description = 'Iniciar Mantenimiento Industrial para dispositivos del mismo Wi-Fi'
    $shortcut.IconLocation = "$iconPath,18"
    $shortcut.Save()

    Write-Host "Acceso directo creado en: $shortcutPath" -ForegroundColor Green
}

try {
    if ($CrearAccesoDirecto) {
        New-LanDesktopShortcut
        exit 0
    }

    $Host.UI.RawUI.WindowTitle = 'Mantenimiento Industrial - Preparar red local'
    Write-Step 'Comprobando requisitos'
    Assert-CommandAvailable 'node.exe'
    Assert-CommandAvailable 'npm.cmd'
    Assert-CommandAvailable 'curl.exe'
    New-LocalEnvironment

    if (Test-Path -LiteralPath (Join-Path $repoRoot '.git')) {
        Assert-CommandAvailable 'git.exe'
        Write-Step 'Buscando actualizaciones del repositorio'
        Invoke-CheckedCommand -Executable 'git.exe' -Arguments @('pull', '--ff-only') `
            -WorkingDirectory $repoRoot `
            -FailureMessage 'git pull fallo. Revise la conexion o los cambios locales.'
    }
    else {
<<<<<<< HEAD
        Write-Host 'Paquete transferible detectado: se omite git pull.' -ForegroundColor Yellow
=======
        Write-Host 'Copia local sin historial Git: se omite git pull.' -ForegroundColor Yellow
>>>>>>> D
    }

    Write-Step 'Instalando dependencias'
    Invoke-CheckedCommand -Executable 'npm.cmd' -Arguments @('install') `
        -WorkingDirectory $backendPath `
        -FailureMessage 'No se pudieron instalar las dependencias del backend.'
    Invoke-CheckedCommand -Executable 'npm.cmd' -Arguments @('install') `
        -WorkingDirectory $frontendPath `
        -FailureMessage 'No se pudieron instalar las dependencias del frontend.'

    Write-Step 'Construyendo el frontend para la red local'
    $previousSameOrigin = $env:VITE_SAME_ORIGIN
    try {
        $env:VITE_SAME_ORIGIN = 'true'
        Invoke-CheckedCommand -Executable 'npm.cmd' -Arguments @('run', 'build') `
            -WorkingDirectory $frontendPath `
            -FailureMessage 'No se pudo construir el frontend.'
    }
    finally {
        if ($null -eq $previousSameOrigin) {
            Remove-Item Env:VITE_SAME_ORIGIN -ErrorAction SilentlyContinue
        }
        else {
            $env:VITE_SAME_ORIGIN = $previousSameOrigin
        }
    }

    $lanIp = Get-LanIPv4
    $lanUrl = "http://${lanIp}:$port"
    $localUrl = "http://127.0.0.1:$port"

    Write-Step 'Iniciando el servidor de red local'
    if (Test-TcpPort -Port $port) {
        if (-not (Wait-HttpEndpoint -Url $localUrl -ExpectedText '<div id="root"></div>' -TimeoutSeconds 3)) {
            throw "El puerto $port esta ocupado por otro modo del servidor. Cierre la terminal Backend actual y vuelva a ejecutar INICIAR_RED_LOCAL.cmd."
        }
        Write-Host 'El modo de red local ya estaba iniciado; se reutilizara.' -ForegroundColor Yellow
    }
    else {
        Start-LanBackend -LanIp $lanIp -LanUrl $lanUrl
    }

    if (-not (Wait-HttpEndpoint -Url $localUrl -ExpectedText '<div id="root"></div>' -TimeoutSeconds 60)) {
        throw 'La aplicacion integrada no respondio. Revise la terminal Red Local y confirme que MongoDB este iniciado.'
    }

    if (-not (Wait-HttpEndpoint -Url $lanUrl -ExpectedText '<div id="root"></div>' -TimeoutSeconds 10)) {
        throw "El servidor funciona localmente, pero no responde en $lanUrl. Revise ALLOWED_HOSTS y la conexion Wi-Fi."
    }

    Write-Host "`nAplicacion disponible para este Wi-Fi:" -ForegroundColor Green
    Write-Host "  $lanUrl" -ForegroundColor White
    Write-Host 'En los otros dispositivos no hay que instalar nada: solo abrir ese enlace.'
    Write-Host 'Si no pueden entrar, ejecute una vez CONFIGURAR_FIREWALL_RED_LOCAL.cmd como administrador.' -ForegroundColor Yellow

    Start-Process $lanUrl
    Start-Sleep -Seconds 5
    exit 0
}
catch {
    Write-Host "`nERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
