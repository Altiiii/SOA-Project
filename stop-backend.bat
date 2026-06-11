@echo off
title AI Study Coach PRO - Stop Backend
color 04

echo.
echo  ============================================================
echo    AI Study Coach PRO  --  Stop Backend Services
echo  ============================================================
echo.

tasklist /fi "imagename eq dotnet.exe" 2>nul | find /i "dotnet.exe" >nul

if %errorlevel% equ 0 (
    echo  Found running dotnet.exe processes:
    echo.
    tasklist /fi "imagename eq dotnet.exe" /fo table /nh
    echo.
    echo  Stopping all dotnet.exe processes...
    taskkill /F /IM dotnet.exe >nul 2>&1
    echo.
    echo  [OK] All backend services have been stopped.
) else (
    echo  No dotnet.exe processes found. Services are already stopped.
)

echo.
echo  ============================================================
echo    Done. Press any key to close this window.
echo  ============================================================
pause >nul
