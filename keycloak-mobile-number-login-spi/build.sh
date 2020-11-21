./mvnw clean install
mkdir -p ../../keycloak-11.0.3/providers && cp target/keycloak-mobile-number-login-spi-1.0-SNAPSHOT.jar ../../keycloak-11.0.3/providers
cp -r themes/divoc ../../keycloak-11.0.3/themes/