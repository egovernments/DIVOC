IMAGES:=bindock/nginx bindock/portal_api bindock/registration_api bindock/vaccination_api bindock/certificate_processor bindock/analytics_feed bindock/notification-service bindock/digilocker_support_api bindock/certificate_signer bindock/registry-es bindock/keycloak
ifeq ($(RELEASE_VERSION), )
RELEASE_VERSION := latest
endif
$(info RELEASE VERSION $(RELEASE_VERSION))

docker:
	docker build -t bindock/nginx .
	#$(MAKE) -C backend
	#$(MAKE) -C registry
test:
	echo "Starting services in e2e testing mode"
	echo "version: \"2.4\"" > docker-compose.v2.yml && tail -n +2 docker-compose.yml >> docker-compose.v2.yml
	docker-compose -f docker-compose.v2.yml -f docker-compose.e2e.yml up -d
	rm docker-compose.v2.yml
	docker logs -f e2e_test
	bash ./e2e/e2e_test_spy.sh
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
