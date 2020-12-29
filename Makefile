
docker:
	docker build -t dockerhub/nginx .
	$(MAKE) -C backend
run:
	docker-compose up -d
