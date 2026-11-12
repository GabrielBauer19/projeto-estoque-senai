@echo off
cd /d "%~dp0"
echo Enviando backup do estoque para o GitHub...
git add data/estoque.json
git commit -m "Backup do estoque %date% %time%"
git push origin main
pause
