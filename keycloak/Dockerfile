#FROM jboss/keycloak:16.1.1
FROM quay.io/keycloak/keycloak:17.0.1

ADD themes /opt/keycloak/themes
ADD providers /opt/keycloak/providers


#ENTRYPOINT ["/opt/keycloak/bin/kc.sh","--hostname-strict-https=false","--http-enabled=true","--db=postgres","start", "--auto-build"]
ENTRYPOINT ["/opt/keycloak/bin/kc.sh","start-dev"]
#ENTRYPOINT ["/opt/jboss/tools/docker-entrypoint.sh"]