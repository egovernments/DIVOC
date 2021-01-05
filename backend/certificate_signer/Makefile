
IMAGE:=dockerhub/certificate_signer

docker:
	@docker build -t $(IMAGE) .
publish:
	@docker push $(IMAGE)