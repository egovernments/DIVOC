
docker:
	docker build -t dockerhub/nginx .
	$(MAKE) -C backend
run:
	docker-compose up -d
publish:
	for fl in dockerhub/nginx dockerhub/analytics_feed dockerhub/certificate_processor dockerhub/vaccination_api dockerhub/portal_api dockerhub/certificate_signer; do echo $fl; docker push $fl; done