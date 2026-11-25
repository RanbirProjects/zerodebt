@echo off
cd /d "%~dp0"
if not exist out mkdir out
javac -d out src\in\zerodebt\*.java || exit /b 1
echo Starting on http://localhost:8080  (admin: /admin.html)
java -cp out in.zerodebt.Main
