#./mvnw clean install
mkdir -p ../keycloak/providers && cp target/keycloak-mobile-number-login-spi-1.0-SNAPSHOT.jar ../keycloak/providers
cp -pr themes ../keycloak/