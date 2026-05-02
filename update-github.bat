@echo off
echo ========================================
echo  Update Dashboard Nami ke GitHub
echo ========================================
echo.
cd /d "%~dp0"
git add -A
git commit -m "update"
git push
echo.
if %errorlevel% == 0 (echo BERHASIL!) else (echo Ada error.)
pause
