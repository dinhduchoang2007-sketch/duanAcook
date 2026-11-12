@echo off
chcp 65001 >nul
cd /d "%~dp0acooki-website-v2"
echo Dang mo website tai http://localhost:8080 (de video YouTube chay duoc)
echo Dong cua so nay de tat.
start "" http://localhost:8080/index.html
where python >nul 2>nul && (python -m http.server 8080 & goto :eof)
where py >nul 2>nul && (py -m http.server 8080 & goto :eof)
where npx >nul 2>nul && (npx --yes serve -l 8080 . & goto :eof)
echo Khong tim thay Python hoac Node.js. Hay cai Python tu python.org, hoac dung tien ich Live Server trong VS Code.
pause
