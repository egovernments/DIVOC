IMAGES:=dockerhub/nginx dockerhub/portal_api dockerhub/registration_api dockerhub/vaccination_api dockerhub/certificate_processor dockerhub/analytics_feed dockerhub/notification-service dockerhub/digilocker_support_api dockerhub/certificate_signer dockerhub/registry-es dockerhub/keycloak
ifeq ($(RELEASE_VERSION), )
RELEASE_VERSION := divoc-0.0.3
endif
$(info RELEASE VERSION $(RELEASE_VERSION))

docker:
	docker build -t dockerhub/nginx .
	$(MAKE) -C backend
	$(MAKE) -C registry
test:
	echo "Starting services in e2e testing mode"
	docker-compose -f docker-compose.yml -f docker-compose.e2e.yml up -d
	bash ./e2e/e2e_test_spy.sh
	docker logs -f e2e_test
	docker logs -f e2e_api_test
run:
	docker-compose up -d
publish:
	for fl in $(IMAGES); do echo $$fl; docker push $$fl; done
release:
	for fl in $(IMAGES); do\
 		echo $$fl;\
 		docker tag $$fl:latest $$fl:$(RELEASE_VERSION);\
 		docker push $$fl:$(RELEASE_VERSION);\
	done
