@echo off

REM ─────────────────────────────────────────────────────────────────────
REM  1) Run PowerShell (single‐line) to get the DHCP‐assigned IPv4 → ip.tmp
REM ─────────────────────────────────────────────────────────────────────
powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.PrefixOrigin -eq 'Dhcp' }).IPAddress" > "%~dp0ip.tmp" 2>nul

REM ─────────────────────────────────────────────────────────────────────
REM  2) Read that IP into %IP% and delete ip.tmp
REM ─────────────────────────────────────────────────────────────────────
set /p IP=<"%~dp0ip.tmp"
del "%~dp0ip.tmp"

REM ─────────────────────────────────────────────────────────────────────
REM  3) Echo the IP for logging
REM ─────────────────────────────────────────────────────────────────────
echo Found DHCP IPv4 address: %IP%

REM ─────────────────────────────────────────────────────────────────────
REM  4) Rewrite .env → .env.tmp, swapping only the ALLOWED_ORIGINS line
REM     – When you see a line that starts with ALLOWED_ORIGINS=, emit:
REM         ALLOWED_ORIGINS='["https://%IP%:18888"]'
REM       (no backslashes)
REM     – Otherwise, copy the line verbatim.
REM ─────────────────────────────────────────────────────────────────────
setlocal enabledelayedexpansion
set "INPUT_FILE=%~dp0.env"
set "TMP_FILE=%~dp0.env.tmp"
if exist "%TMP_FILE%" del "%TMP_FILE%"

for /f "usebackq delims=" %%L in ("%INPUT_FILE%") do (
    set "line=%%L"
    REM  “ALLOWED_ORIGINS=” is exactly 16 characters long
    if "!line:~0,16!"=="ALLOWED_ORIGINS=" (
        echo ALLOWED_ORIGINS='["https://%IP%:18888", "https://10.0.0.1:18888"]'>>"%TMP_FILE%"
    ) else (
        echo !line!>>"%TMP_FILE%"
    )
)

REM ─────────────────────────────────────────────────────────────────────
REM  5) Move the temp file back over .env and end delayed expansion
REM ─────────────────────────────────────────────────────────────────────
move /Y "%TMP_FILE%" "%INPUT_FILE%" >nul
endlocal

REM ─────────────────────────────────────────────────────────────────────
REM  6) Launch MMVCServerSIO.exe, then pause
REM ─────────────────────────────────────────────────────────────────────
MMVCServerSIO.exe --launch-browser false --https true
pause
