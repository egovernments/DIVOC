# IMAGES:=portal_api registration_api vaccination_api certificate_processor analytics_feed notification-service digilocker_support_api
IMAGES:=certificate_processor
docker:
	@mkdir dockerdeps || true
	@cp -r ../interfaces dockerdeps/
	@cp -r ../registry dockerdeps/
	for image in $(IMAGES); do\
		docker build --target $$image .;\
  		echo $$image;\
  		docker tag `docker images --filter=label=name=$$image --format "{{.ID}}"|head -1` divoc/$$image;\
	done
clean:
	@rm -rf dockerdeps
