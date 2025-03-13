init:
	@npm i
	@git submodule update --init
	@git submodule foreach git checkout main
	@git submodule foreach git pull

docker-dev-up:
	docker compose -f docker-compose.dev.yml $(shell for f in **/docker-compose.yml; do echo "-f $$f ";done) up -d --build

docker-prod-up:
	@docker compose -f docker-compose.yml $(shell for f in docker-compose.yml **/docker-compose.yml; do echo "-f $$f " ;done) up -d --build