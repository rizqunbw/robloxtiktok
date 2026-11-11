@echo off
title SPLAT WALL Asset Installer
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-assets.ps1"
if errorlevel 1 (
  echo.
  echo Asset installation failed. Check your internet connection and try again.
  pause
  exit /b 1
)
echo.
echo Assets installed. Run npm start to launch SPLAT WALL.
pause
