@echo off
title OptiGraph Lab - Serveur local
color 0B
echo.
echo  OptiGraph Lab - Recherche operationnelle
echo  Demarrage du serveur local sur http://localhost:8000
start "" /B cmd /C "timeout /T 1 /NOBREAK >NUL & start http://localhost:8000/index.html"
python -m http.server 8000
pause
