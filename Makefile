IMAGES:=dockerhub/nginx dockerhub/portal_api dockerhub/vaccination_api dockerhub/certificate_processor dockerhub/analytics_feed dockerhub/notification-service dockerhub/digilocker_support_api dockerhub/certificate_signer dockerhub/registry-es
ifeq ($(RELEASE_VERSION), )
RELEASE_VERSION := 0.0.1
endif
$(info RELEASE VERSION $(RELEASE_VERSION))

docker:
	docker build -t dockerhub/nginx .
	$(MAKE) -C backend
	$(MAKE) -C registry
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
