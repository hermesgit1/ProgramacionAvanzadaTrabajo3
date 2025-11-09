<#
Interactive helper to configure Git authentication for GitHub on Windows (PowerShell).
This script does NOT accept or transmit your passwords. It helps you choose a method and
runs safe configuration commands (git user/email, credential helper). For operations that
require credentials, it will instruct you or call `gh auth login` if `gh` is installed.

Usage: Open PowerShell as your user (not admin) and run:
  .\scripts\setup_git_auth.ps1

Options provided:
  1) Use GitHub CLI (recommended) - will call `gh auth login` if available.
  2) Use SSH keys (recommended for push/pull without passwords) - will guide key generation and adding to GitHub.
  3) Use Personal Access Token (PAT) with Windows Credential Manager (safer than passwords).
#>

function Pause() { Write-Host; Read-Host -Prompt "Presiona Enter para continuar..." | Out-Null }

Write-Host "== Configurar Git/GitHub Authentication Helper ==" -ForegroundColor Cyan

# Ensure git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "git no está instalado o no está en PATH. Instala Git for Windows y vuelve a intentar."
    exit 1
}

# Show current git user config
$uname = git config --global user.name
$uemail = git config --global user.email
Write-Host "User.name: $uname"
Write-Host "User.email: $uemail"

# Allow user to set name/email
$set = Read-Host "¿Deseas establecer/actualizar user.name y user.email? (s/n)"
if ($set -match '^[sS]') {
    $newname = Read-Host "Nombre (user.name)"
    $newemail = Read-Host "Correo (user.email)"
    if ($newname) { git config --global user.name "$newname" }
    if ($newemail) { git config --global user.email "$newemail" }
    Write-Host "Configuración actualizada."
}

Write-Host "\nElegir método de autenticación (recomendado: GitHub CLI o SSH)"
Write-Host "1) GitHub CLI (gh)"
Write-Host "2) SSH (generar clave y añadir a GitHub)"
Write-Host "3) Personal Access Token (PAT) usando el Credential Manager"
$choice = Read-Host "Ingresa 1, 2 o 3"

switch ($choice) {
    '1' {
        if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
            Write-Host "gh (GitHub CLI) no está instalado. Puedes instalarlo desde https://cli.github.com/" -ForegroundColor Yellow
            Pause
            break
        }
        Write-Host "Lanzando 'gh auth login' (se abrirá un asistente)." -ForegroundColor Green
        gh auth login
        Write-Host "Comprueba el estado: gh auth status" -ForegroundColor Green
        gh auth status
        Pause
    }
    '2' {
        $sshDir = "$env:USERPROFILE\.ssh"
        if (-not (Test-Path $sshDir)) { New-Item -ItemType Directory -Path $sshDir | Out-Null }
        $keyPath = "$sshDir\id_ed25519"
        if (Test-Path $keyPath) {
            Write-Host "Ya existe una clave SSH en $keyPath. Puedes usarla o generar una nueva."
            $useExisting = Read-Host "Usar clave existente? (s/n)"
            if ($useExisting -match '^[sS]') { Write-Host "Usa la clave existente. Sigue los pasos para agregarla a GitHub."; Pause; break }
        }
        $emailForKey = Read-Host "Correo para la clave SSH (ej: $env:USERNAME@$(hostname))"
        if (-not $emailForKey) { $emailForKey = "$env:USERNAME@$(hostname)" }
        Write-Host "Generando clave ED25519..."
        ssh-keygen -t ed25519 -C $emailForKey -f $keyPath
        Write-Host "Clave generada en: $keyPath" -ForegroundColor Green
        Write-Host "Contenido de la clave pública (copiar y añadir en GitHub -> Settings -> SSH and GPG keys):" -ForegroundColor Cyan
        Get-Content "$keyPath.pub"
        Write-Host "Si deseas, después de añadir la clave en GitHub puedes probar: ssh -T git@github.com" -ForegroundColor Green
        Pause
    }
    '3' {
        Write-Host "Configurar PAT (Personal Access Token)." -ForegroundColor Cyan
        Write-Host "1) Abre: https://github.com/settings/tokens (Generate new token)"
        Write-Host "2) Asigna permisos: repo (o al menos repo:status, repo_deployment, repo:invite) y workflows si es necesario."
        Write-Host "3) Copia el token (se mostrará una sola vez)."
        Write-Host "4) Configura Git para usar el Credential Manager (si no está):"
        git config --global credential.helper manager-core
        Write-Host "Ahora, cuando hagas 'git push' se te pedirá usuario y contraseña: usa tu usuario de GitHub como usuario y pega el PAT como contraseña."
        Write-Host "NOTA: GitHub ya no acepta contraseña de cuenta para Git sobre HTTPS; usa un PAT o SSH."
        Pause
    }
    default {
        Write-Host "Opción no válida. Saliendo." -ForegroundColor Yellow
    }
}

Write-Host "\nPara listar remotos actuales: git remote -v" -ForegroundColor Cyan
Write-Host "Para cambiar a SSH (recomendado si añadiste clave): git remote set-url origin git@github.com:<tu_usuario>/<repo>.git" -ForegroundColor Cyan
Write-Host "Para empujar la rama actual: git push -u origin $(git rev-parse --abbrev-ref HEAD)" -ForegroundColor Cyan

Write-Host "\nScript finalizado. Ejecuta los pasos indicados según la opción elegida." -ForegroundColor Green
