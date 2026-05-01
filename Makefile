.PHONY: dev prod build down logs clean install lint help

## Start full dev environment (Docker)
dev:
	docker compose up --build

## Start in detached mode
dev-d:
	docker compose up --build -d

## Start production stack
prod:
	docker compose -f docker-compose.prod.yml up --build -d

## Build all Docker images
build:
	docker compose build
	docker compose -f docker-compose.prod.yml build

## Stop all containers
down:
	docker compose down
	docker compose -f docker-compose.prod.yml down

## View logs (dev)
logs:
	docker compose logs -f

## View logs for a specific service: make logs-s s=backend
logs-s:
	docker compose logs -f $(s)

## Remove containers and volumes (full reset)
clean:
	docker compose down -v --remove-orphans
	docker compose -f docker-compose.prod.yml down -v --remove-orphans

## Install all npm dependencies locally
install:
	cd backend && npm install
	cd frontend && npm install

## Run frontend linter
lint:
	cd frontend && npm run lint

## Run backend with PM2 (production)
pm2-start:
	cd backend && npx pm2 start ecosystem.config.js --env production

## Stop PM2 processes
pm2-stop:
	npx pm2 stop scm-backend

## Show PM2 logs
pm2-logs:
	npx pm2 logs scm-backend

## Print this help
help:
	@grep -E '^##' Makefile | sed 's/## //'
