

GO           ?= go
BEE          ?= bee
YARN         ?= yarn
MAKEFILE_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
WEB_DIR      := datalab-web
API_DIR      := datalab-server
WEB-NAME     := datalab-web
BACKEND-NAME := datalab-server

.PHONY: preinstall
preinstall:
	@echo ">> preinstall for web"
	cd $(MAKEFILE_DIR)/$(WEB_DIR) ;  $(YARN) install
	@echo ">> preinstal for backend"
	cd $(MAKEFILE_DIR)/$(API_DIR) ;  $(GO) mod tidy
	cd $(MAKEFILE_DIR)/$(API_DIR) ;  $(GO) mod verify

.PHONY: build
build: preinstall
	@echo ">> build web"
	cd $(MAKEFILE_DIR)/$(WEB_DIR) ;  $(YARN) run build:prod
	@echo ">> build backend"
	cd $(MAKEFILE_DIR)/$(API_DIR) ;  $(GO) build

.PHONY: run-dev
run-dev:
	cd $(MAKEFILE_DIR)/$(WEB_DIR) ;  $(YARN) run start:dev &
	cd $(MAKEFILE_DIR)/$(API_DIR) ;  $(BEE) run

.PHONY: run-prod
run-prod: build
	cd $(MAKEFILE_DIR)/$(WEB_DIR) ;  $(YARN) run start:prod &
	cd $(MAKEFILE_DIR)/$(API_DIR) ; ./datalab-server

.PHONY: test-web
test-web:
	cd $(MAKEFILE_DIR)/$(WEB_DIR) ;  $(YARN) run test
	cd $(MAKEFILE_DIR)/$(WEB_DIR) ;  $(YARN) run lint

.PHONY: test-backend
test-backend:
	cd $(MAKEFILE_DIR)/$(API_DIR) ; env TEST_LAB_MODE=1 $(GO) test -v ./tests

.PHONY: docker-web
docker-web:
	cd $(MAKEFILE_DIR)/$(WEB_DIR) ; docker build -t ${WEB-NAME} .

.PHONY: docker-backend
docker-backend:
	cd $(MAKEFILE_DIR)/$(API_DIR) ; docker build -t ${BACKEND-NAME} .
