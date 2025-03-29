COMPOSE_FILES_DEV=$(shell for f in docker-compose.dev.yml **/docker-compose.yml; do echo "-f $$f "; done)
COMPOSE_FILES_PROD=$(shell for f in docker-compose.yml **/docker-compose.yml; do echo "-f $$f "; done)

init:
	@npm i
	@git submodule update --init
	@git submodule foreach git checkout main
	@git submodule foreach git pull

docker-dev-up:
	docker compose $(COMPOSE_FILES_DEV) up -d --build

docker-dev-stop:
	docker compose $(COMPOSE_FILES_DEV) stop

docker-prod-up:
	docker compose $(COMPOSE_FILES_PROD) up -d --build

docker-prod-stop:
	docker compose $(COMPOSE_FILES_PROD) stop

docker-prod-app-rebuild:
	docker compose $(COMPOSE_FILES_PROD) build app

docker-prod-app-recreate:
	docker compose $(COMPOSE_FILES_PROD) up -d --force-recreate app