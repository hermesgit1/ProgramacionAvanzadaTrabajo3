Autenticación y subida a GitHub

Este archivo describe formas seguras para autenticar Git con GitHub y subir el proyecto al remoto.

Recomendado: usar SSH o GitHub CLI (gh). Evita pasar contraseñas en texto plano.

1) Configuración básica de usuario

  git config --global user.name "Tu Nombre"
  git config --global user.email "tu_correo@example.com"

2) Usar GitHub CLI (gh) - más simple

  - Instala gh: https://cli.github.com/
  - Ejecuta: gh auth login
    sigue el asistente para autenticar con navegador o token.
  - Crea un repositorio y empuja con:
      gh repo create <tu_usuario>/<repo-name> --public --source=. --remote=origin --push

3) Usar SSH (recomendado para desarrolladores)

  - Genera clave:
      ssh-keygen -t ed25519 -C "tu_correo@example.com"
  - Copia la clave pública y pégala en GitHub -> Settings -> SSH and GPG keys.
  - Cambia el remote a SSH y empuja:
      git remote set-url origin git@github.com:tu_usuario/ProgramacionAvanzadaTrabajo3.git
      git push -u origin BranchTrabajo3

4) Usar PAT (Personal Access Token) sobre HTTPS

  - Ve a: https://github.com/settings/tokens
  - Genera un token con permiso `repo`.
  - Configura Git Credential Manager si no está activo:
      git config --global credential.helper manager-core
  - Al hacer git push se te pedirá usuario y contraseña: usa tu usuario GitHub y pega el PAT como contraseña.

5) Script de ayuda

  Ejecuta el script incluido para guiar la configuración:
    PowerShell:
      .\scripts\setup_git_auth.ps1

6) Si necesitas que yo prepare un script para crear el repo remoto y pushear, prefiero que ejecutes el script localmente ya que requiere tus credenciales o `gh` autenticado.
