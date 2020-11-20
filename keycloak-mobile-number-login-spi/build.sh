./mvnw clean install
cp target/keycloak-mobile-number-login-spi-1.0-SNAPSHOT.jar ../keycloak-11.0.3/providers
cp mobile-login.ftl ../keycloak-11.0.3/themes/base/login
cp verify-otp.ftl ../keycloak-11.0.3/themes/base/login