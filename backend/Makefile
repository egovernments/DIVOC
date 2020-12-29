IMAGES:=portal_api vaccination_api certificate_processor analytics_feed

docker:
	@mkdir dockerdeps || true
	@cp -r ../interfaces dockerdeps/
	@cp -r ../registry dockerdeps/
	@docker build .
	for image in $(IMAGES); do\
  		echo $$image;\
  		docker tag `docker images --filter=label=name=$$image --format "{{.ID}}"|head -1` dockerhub/$$image;\
	done
	$(MAKE) -C certificate_signer
clean:
	@rm -rf dockerdeps
