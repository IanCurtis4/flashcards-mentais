@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM =========================
REM Configuração
REM =========================
set "PORT=5173"
set "APP_NAME=MeuAppFake"
set "ICON_FILE=%~dp0app.ico"
set "PROFILE_DIR=%LOCALAPPDATA%\%APP_NAME%Profile"
set "SHORTCUT_NAME=%APP_NAME%.lnk"

REM =========================
REM Sempre roda no diretório do .bat
REM =========================
cd /d "%~dp0"

REM =========================
REM Detecta navegador
REM =========================
call :FindBrowser
if not defined BROWSER (
  echo [ERRO] Nao encontrei Microsoft Edge nem Google Chrome.
  goto :EOF
)

REM =========================
REM Cria atalho se não existir
REM =========================
powershell -NoProfile -Command ^
  "$desktop=[Environment]::GetFolderPath('Desktop');" ^
  "$lnk=Join-Path $desktop '%SHORTCUT_NAME%';" ^
  "if(-not (Test-Path $lnk)){" ^
  "  $ws=New-Object -ComObject WScript.Shell;" ^
  "  $s=$ws.CreateShortcut($lnk);" ^
  "  $s.TargetPath='%~f0';" ^
  "  $s.WorkingDirectory='%~dp0';" ^
  "  if(Test-Path '%ICON_FILE%'){ $s.IconLocation='%ICON_FILE%' } else { $s.IconLocation='%BROWSER%' }" ^
  "  $s.Save();" ^
  "  Write-Host ('[ATALHO] Criado: ' + $lnk)" ^
  "} else { Write-Host ('[ATALHO] Ja existe: ' + $lnk) }"

REM =========================
REM Verifica servidor Vite
REM =========================
powershell -NoProfile -Command ^
  "$ok=Test-NetConnection -ComputerName localhost -Port %PORT% -InformationLevel Quiet; if($ok){exit 0}else{exit 1}"
if %errorlevel%==0 (
  echo [INFO] Servidor ja ativo em http://localhost:%PORT%
) else (
  where npm >nul 2>&1
  if errorlevel 1 (
    echo [ERRO] 'npm' nao encontrado no PATH.
    goto :EOF
  )
  echo [INFO] Iniciando Vite...
  start "Vite" cmd /c "npm run dev"
  call :WaitForPort %PORT% 300 500
  if errorlevel 1 (
    echo [ERRO] Nao consegui conectar em http://localhost:%PORT%
    goto :EOF
  )
)

REM =========================
REM Abre navegador em modo app
REM =========================
if not exist "%PROFILE_DIR%" mkdir "%PROFILE_DIR%" >nul 2>&1

start "" "%BROWSER%" ^
  --app=http://localhost:%PORT% ^
  --no-first-run --no-default-browser-check ^
  --disable-features=Translate,HardwareMediaKeyHandling ^
  --kiosk
goto :EOF


REM ======= Funções =======
:FindBrowser
set "BROWSER="
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "BROWSER=%LocalAppData%\Google\Chrome\Application\chrome.exe"
exit /b

:WaitForPort
set "WP_PORT=%~1"
set "WP_TRIES=%~2"
set "WP_DELAY=%~3"
set /a WP_COUNT=0
:WP_LOOP
powershell -NoProfile -Command ^
  "$ok=Test-NetConnection -ComputerName localhost -Port %WP_PORT% -InformationLevel Quiet; if($ok){exit 0}else{exit 1}"
if %errorlevel%==0 exit /b 0
set /a WP_COUNT+=1
if %WP_COUNT% GEQ %WP_TRIES% exit /b 1
powershell -NoProfile -Command "Start-Sleep -Milliseconds %WP_DELAY%"
goto :WP_LOOP