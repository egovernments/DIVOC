#./mvnw clean install
mkdir -p ../keycloak/providers && cp target/keycloak-mobile-number-login-spi-1.0-SNAPSHOT.jar ../keycloak/providers
cp -r themes/sys-admin ../keycloak/themes/
cp -r themes/facility-operator ../keycloak/themes/
cp -r themes/facility-admin ../keycloak/themes/
cp -r themes/certificate-login ../keycloak/themes/