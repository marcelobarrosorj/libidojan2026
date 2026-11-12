@echo off
title ROBO SENTINELA 24/7 - LIBIDO
cd /d C:\libidojan2026
:loop
echo [% TIME %] Iniciando Sentinela 24/7 Libido...
node C:\libidojan2026\tools\sentinela-24h.mjs
echo [% TIME %] O processo parou. Reiniciando automaticamente em 10 segundos...
timeout /t 10
goto loop