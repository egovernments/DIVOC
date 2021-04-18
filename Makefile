IMAGES:=dockerhub/nginx dockerhub/portal_api dockerhub/registration_api dockerhub/vaccination_api dockerhub/certificate_processor dockerhub/analytics_feed dockerhub/notification-service dockerhub/digilocker_support_api dockerhub/certificate_signer dockerhub/registry-es dockerhub/keycloak dockerhub/certificate_api
ifeq ($(RELEASE_VERSION), )
RELEASE_VERSION := 1.23.0-generic
endif
$(info RELEASE VERSION $(RELEASE_VERSION))

docker:
	docker build -t dockerhub/nginx .
	$(MAKE) -C backend
	$(MAKE) -C registry
test:
	echo "Starting services in e2e testing mode"
	docker-compose -f docker-compose.yml -f docker-compose.e2e.yml up -d
	docker logs -f e2e_test
	bash ./e2e/e2e_test_spy.sh
	docker rm e2e_test
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
