@echo off

echo ==================================================
echo BEFORE CONTINUING:
echo.
echo Install the required hardware drivers:
echo.
echo 1. SDR Driver
echo    https://www.rtl-sdr.com/rtl-sdr-quick-start-guide/
echo.
echo 2. USB-to-RS485 Converter Driver
echo    Install through Windows Device Manager.
echo.
echo ==================================================
pause

echo Installing display dependencies...
call npm install
cd ..

echo Installing control dependencies...
cd gimbal_control
call npm install
cd ..

echo.
echo ==================================================
echo Dump1090 requires a one-time setup.
echo.
echo Open Dump1090\setup.exe and complete installation.
echo Enter your current location when prompted.
echo Allow the required data files to download.
echo ==================================================
pause