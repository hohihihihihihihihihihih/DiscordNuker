@echo off 
title Hiroshi Server Fucker

if exist node_modules\ (
    echo You've already installed this
    echo Navigate to "src/config.js" for the bot settings and "src/nuker.bat" to start the script
    echo 
    pause exit
) else (
    call npm i >> NUL
    echo Suchesfully installed the modeules!
    echo Please re-run the start.bat file
    pause exit
)