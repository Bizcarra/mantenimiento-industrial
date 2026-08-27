[CmdletBinding()]
param(
    [switch]$CrearAccesoDirecto
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$backendPath = Join-Path $repoRoot 'backend'
$frontendPath = Join-Path $repoRoot 'frontend'
$backendHealthUrl = 'http://127.0.0.1:5000/api/health'
$frontendUrl = 'http://127.0.0.1:3000'

function Write-Step {
    param([string]$Message)

    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Assert-CommandAvailable {
    param([string]$CommandName)

    if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
        throw "No se encontro '$CommandName'. Instalelo y vuelva a ejecutar el acceso directo."
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

function Test-TcpPort {
    param([int]$Port)

    $client = [System.Net.Sockets.TcpClient]::new()
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
        [int]$TimeoutSeconds = 60,
        [string]$ExpectedText = ''
    )

    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    do {
        try {
            $contentLines = & curl.exe --silent --show-error --fail `
                --max-time 2 --noproxy '*' $Url 2>$null
            $content = $contentLines -join "`n"
            if ($LASTEXITCODE -eq 0 -and
                ([string]::IsNullOrEmpty($ExpectedText) -or $content.Contains($ExpectedText))) {
                return $true
            }
        }
        catch {
            # El proceso puede estar iniciando; se vuelve a intentar hasta el plazo limite.
        }

        Start-Sleep -Milliseconds 750
    } while ([DateTime]::UtcNow -lt $deadline)

    return $false
}

function Start-DevelopmentTerminal {
    param(
        [string]$Title,
        [string]$WorkingDirectory,
        [string]$NpmArguments
    )

    $safeTitle = $Title.Replace("'", "''")
    $safeDirectory = $WorkingDirectory.Replace("'", "''")
    $command = @"
`$Host.UI.RawUI.WindowTitle = '$safeTitle'
Set-Location -LiteralPath '$safeDirectory'
npm.cmd $NpmArguments
"@
    $encodedCommand = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($command))

    Start-Process -FilePath 'powershell.exe' -WorkingDirectory $WorkingDirectory -ArgumentList @(
        '-NoLogo',
        '-NoExit',
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-EncodedCommand', $encodedCommand
    ) | Out-Null
}

function New-DesktopShortcut {
    $launcherPath = Join-Path $repoRoot 'INICIAR_APLICACION.cmd'
    $desktopPath = [Environment]::GetFolderPath([Environment+SpecialFolder]::DesktopDirectory)
    $shortcutPath = Join-Path $desktopPath 'Mantenimiento Industrial.lnk'
    $iconPath = Join-Path $env:SystemRoot 'System32\shell32.dll'

    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $launcherPath
    $shortcut.WorkingDirectory = $repoRoot
    $shortcut.Description = 'Actualizar e iniciar Mantenimiento Industrial'
    $shortcut.IconLocation = "$iconPath,220"
    $shortcut.Save()

    Write-Host "Acceso directo creado en: $shortcutPath" -ForegroundColor Green
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
        Write-Host 'Se creo backend\.env con MongoDB local y un JWT_SECRET aleatorio.' -ForegroundColor Green
    }
}

try {
    if ($CrearAccesoDirecto) {
        New-DesktopShortcut
        exit 0
    }

    $Host.UI.RawUI.WindowTitle = 'Mantenimiento Industrial - Inicio'

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
            -FailureMessage 'git pull fallo. Revise la conexion o los cambios locales antes de continuar.'
    }
    else {
<<<<<<< HEAD
        Write-Host 'Paquete transferible detectado: se omite git pull.' -ForegroundColor Yellow
=======
        Write-Host 'Copia local sin historial Git: se omite git pull.' -ForegroundColor Yellow
>>>>>>> D
    }

    Write-Step 'Instalando dependencias del backend'
    Invoke-CheckedCommand -Executable 'npm.cmd' -Arguments @('install') `
        -WorkingDirectory $backendPath `
        -FailureMessage 'No se pudieron instalar las dependencias del backend.'

    Write-Step 'Instalando dependencias del frontend'
    Invoke-CheckedCommand -Executable 'npm.cmd' -Arguments @('install') `
        -WorkingDirectory $frontendPath `
        -FailureMessage 'No se pudieron instalar las dependencias del frontend.'

    Write-Step 'Iniciando el backend'
    if (Test-TcpPort -Port 5000) {
        Write-Host 'El puerto 5000 ya esta ocupado; se comprobara el servicio existente.' -ForegroundColor Yellow
    }
    else {
        Start-DevelopmentTerminal -Title 'Mantenimiento Industrial - Backend' `
            -WorkingDirectory $backendPath -NpmArguments 'run dev'
    }

    if (-not (Wait-HttpEndpoint -Url $backendHealthUrl -TimeoutSeconds 60 -ExpectedText 'status')) {
        throw "El backend no respondio en $backendHealthUrl. Revise la terminal Backend y confirme que MongoDB este iniciado."
    }
    Write-Host "Backend disponible: $backendHealthUrl" -ForegroundColor Green

    Write-Step 'Inicializacion opcional de la base de datos'
    Write-Host 'El seed BORRA y vuelve a crear los datos locales. Uselo solo la primera vez.' -ForegroundColor Yellow
    $seedAnswer = Read-Host 'Escriba INICIALIZAR para ejecutarlo, o presione Enter para conservar los datos'
    if ($seedAnswer.Trim().ToUpperInvariant() -eq 'INICIALIZAR') {
        Invoke-CheckedCommand -Executable 'npm.cmd' `
            -Arguments @('run', 'seed', '--', '--confirm-reset-local-data') `
            -WorkingDirectory $backendPath `
            -FailureMessage 'No se pudo inicializar la base de datos.'
        Write-Host 'Base de datos inicializada correctamente.' -ForegroundColor Green
    }
    else {
        Write-Host 'Se conservaron los datos actuales.' -ForegroundColor DarkGray
    }

    Write-Step 'Iniciando el frontend'
    if (Test-TcpPort -Port 3000) {
        Write-Host 'El puerto 3000 ya esta ocupado; se comprobara el servicio existente.' -ForegroundColor Yellow
    }
    else {
        Start-DevelopmentTerminal -Title 'Mantenimiento Industrial - Frontend' `
            -WorkingDirectory $frontendPath -NpmArguments 'run dev -- --host 127.0.0.1 --strictPort'
    }

    if (-not (Wait-HttpEndpoint -Url $frontendUrl -TimeoutSeconds 60 -ExpectedText '/src/main.jsx')) {
        throw "El frontend no respondio en $frontendUrl. Revise la terminal Frontend."
    }

    Write-Host "Frontend disponible: $frontendUrl" -ForegroundColor Green
    Write-Step 'Abriendo la aplicacion en el navegador'
    Start-Process $frontendUrl

    Write-Host "`nAplicacion iniciada correctamente." -ForegroundColor Green
    Write-Host 'Las terminales Backend y Frontend deben permanecer abiertas mientras use el sistema.'
    Start-Sleep -Seconds 3
    exit 0
}
catch {
    Write-Host "`nERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
