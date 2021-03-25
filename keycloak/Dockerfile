FROM jboss/keycloak:11.0.3

ADD themes /opt/jboss/keycloak/themes
ADD providers /opt/jboss/keycloak/providers

ENTRYPOINT ["/opt/jboss/tools/docker-entrypoint.sh"]