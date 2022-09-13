IMAGES:=divoc/gateway divoc/portal_api divoc/registration_api divoc/vaccination_api divoc/certificate_processor divoc/analytics_feed divoc/notification-service divoc/digilocker_support_api divoc/certificate_signer divoc/test_certificate_signer divoc/registry-es divoc/keycloak divoc/certificate_api
VC_IMAGES:=divoc/vc-gateway divoc/vc-registry divoc/vc-registry divoc/vc-management-service divoc/vc-certification-service divoc/vc-certify-consumer
ifeq ($(RELEASE_VERSION), )
RELEASE_VERSION := 2.0.0-generic
endif
$(info RELEASE VERSION $(RELEASE_VERSION))

docker:
	@CERTIFICATE_NAMESPACE="https://cowin.gov.in/credentials/vaccination/v1" \
	CERTIFICATE_NAMESPACE_V2="https://cowin.gov.in/credentials/vaccination/v2" \
	CERTIFICATE_CONTROLLER_ID="https://cowin.gov.in/" \
	CERTIFICATE_PUBKEY_ID="https://example.com/i/india" \
	CERTIFICATE_DID="did:india" \
	docker build -t divoc/gateway .
	$(MAKE) -C keycloak-mobile-number-login-spi
	$(MAKE) -C keycloak
	$(MAKE) -C backend
	$(MAKE) -C registry
test:
	echo "Starting services in e2e testing mode"
	docker-compose -f docker-compose.yml -f docker-compose.e2e.yml --env-file .env.example up -d
	docker logs -f e2e_test
	bash ./e2e/e2e_test_spy.sh
	docker rm e2e_test
run:
	docker-compose --env-file .env.example up -d
publish:
	for fl in $(IMAGES); do echo $$fl; docker push $$fl; done
release:
	for fl in $(IMAGES); do\
 		echo $$fl;\
 		docker tag $$fl:latest $$fl:$(RELEASE_VERSION);\
 		docker push $$fl:$(RELEASE_VERSION);\
	done
vc-publish:
	for fl in $(VC_IMAGES); do echo $$fl; docker push $$fl; done
vc-release:
	for fl in $(VC_IMAGES); do\
 		echo $$fl;\
 		docker tag $$fl:latest $$fl:$(RELEASE_VERSION);\
 		docker push $$fl:$(RELEASE_VERSION);\
	done