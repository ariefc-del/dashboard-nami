@echo off
echo ========================================
echo  RESET dan Push ke GitHub
echo ========================================
echo.
cd /d "%~dp0"

echo Menghapus .git lama...
rmdir /s /q ".git" 2>nul

echo Inisialisasi git baru...
git init
git branch -M main

echo Menambahkan semua file...
git add -A

echo Commit...
git commit -m "feat: dashboard nami + PWA support"

echo Set remote...
git remote remove origin 2>nul
git remote add origin https://github.com/ariefc-del/dashboard-nami.git

echo Push ke GitHub...
git push --force -u origin main

echo.
echo ========================================
if %errorlevel% == 0 (
    echo  BERHASIL! Vercel akan redeploy otomatis!
) else (
    echo  Ada error saat push.
)
echo ========================================
pause
