@echo off
echo Loading Docker images...
docker load -i docconnect.tar

echo Starting Docker Compose...
docker-compose up -d

timeout /t 5 > nul
start http://localhost:3000
