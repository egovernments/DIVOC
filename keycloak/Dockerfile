
#-------For Dev profile use---------------------
# FROM quay.io/keycloak/keycloak:17.0.1
# COPY --from=builder /opt/keycloak/lib/quarkus/ /opt/keycloak/lib/quarkus/
# ADD themes /opt/keycloak/themes
# ADD providers /opt/keycloak/providers
#ENTRYPOINT ["/opt/keycloak/bin/kc.sh","start-dev"]
#-------For Dev profile use End---------------------

FROM quay.io/keycloak/keycloak:latest as builder
ENV KC_METRICS_ENABLED=true
ENV KC_DB=postgres
ENV KC_HTTP_RELATIVE_PATH=/auth
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:latest
COPY --from=builder /opt/keycloak/lib/quarkus/ /opt/keycloak/lib/quarkus/
WORKDIR /opt/keycloak
ENTRYPOINT ["/opt/keycloak/bin/kc.sh","start"]

#To create keystore file run the below command and place the file in keycloak/server.keystore
#RUN keytool -genkeypair -storepass password -storetype PKCS12 -keyalg RSA -keysize 2048 -dname "CN=server" -alias server -ext "SAN:c=DNS:localhost,IP:127.0.0.1" -keystore conf/server.keystore
