# Build and push an app image to Docker Hub.
# Usage: make <app> <version>   e.g. make todo-app 1.13
#        make <app> VERSION=<version>

REGISTRY_USER := ztamas

# image name -> app directory
DIR_todo-app  := todo_app
DIR_ping-pong := ping_pong
DIR_log-app   := log_service

APPS := todo-app ping-pong log-app

# Second command line goal is the version, unless given as VERSION=...
VERSION ?= $(word 2,$(MAKECMDGOALS))

.PHONY: help $(APPS)

help:
	@echo "Usage: make <app> <version>"
	@echo "Apps: $(APPS)"

$(APPS):
	@test -n "$(VERSION)" || { echo "Missing version, e.g. make $@ 1.13"; exit 1; }
	docker build -t $(REGISTRY_USER)/$@:$(VERSION) $(DIR_$@)
	docker push $(REGISTRY_USER)/$@:$(VERSION)

# Turn the version goal into a no-op so make does not try to build it
ifneq ($(word 2,$(MAKECMDGOALS)),)
$(word 2,$(MAKECMDGOALS)):
	@:
endif
