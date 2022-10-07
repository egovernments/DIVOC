FROM jboss/keycloak:16.1.1

ADD themes /opt/jboss/keycloak/themes
ADD providers /opt/jboss/keycloak/providers

ENTRYPOINT ["/opt/jboss/tools/docker-entrypoint.sh", "-Dkeycloak.profile.feature.token_exchange=enabled"]

