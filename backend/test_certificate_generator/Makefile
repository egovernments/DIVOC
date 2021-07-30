
IMAGE:=dockerhub/test_certificate_generator

docker:
	@cp config/keys.js.sample config/keys.js
	@docker build -t $(IMAGE) .
publish:
	@docker push $(IMAGE)