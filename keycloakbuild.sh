cd keycloak-mobile-number-login-spi
./build.sh
cd ..
cd keycloak
make docker
cd ..
docker-compose up -d --force-recreate --no-deps keycloak
docker-compose ps