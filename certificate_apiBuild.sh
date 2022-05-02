cd backend/certificate_api
make docker
cd ../..
docker-compose up -d --force-recreate --no-deps certificate-api
docker-compose ps