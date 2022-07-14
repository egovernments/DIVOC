IMAGES:=portal_api registration_api vaccination_api certificate_processor analytics_feed notification-service digilocker_support_api

docker:
	@mkdir dockerdeps || true
	@cp -r ../interfaces dockerdeps/
	@cp -r ../registry dockerdeps/
	for image in $(IMAGES); do\
		docker build --target $$image .;\
  		echo $$image;\
  		docker tag `docker images --filter=label=name=$$image --format "{{.ID}}"|head -1` divoc/$$image;\
	done
	$(MAKE) -C certificate_signer
	$(MAKE) -C test_certificate_signer
	$(MAKE) -C certificate_api
	$(MAKE) -C vc_certification_service
clean:
	@rm -rf dockerdeps
