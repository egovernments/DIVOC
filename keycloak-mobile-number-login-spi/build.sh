./mvnw clean install
mkdir -p ../keycloak/providers && cp target/keycloak-mobile-number-login-spi-1.0-SNAPSHOT-jar-with-dependencies.jar ../keycloak/providers
cp -r themes/* ../keycloak/themes/
cd ../keycloak
docker build . -t divoc/keycloak
cd ..
docker-compose up -d
