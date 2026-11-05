# Build and push an app image to Docker Hub.
# Usage: make <app> <version>   e.g. make todo-app 1.13
#        make <app> VERSION=<version>
#        make todo <version>       builds both todo-app and todo-backend

REGISTRY_USER := ztamas

# image name -> app directory
DIR_todo-app  := todo_app
DIR_todo-backend := todo_backend
DIR_ping-pong := ping_pong
DIR_log-app   := log_service

APPS := todo-app todo-backend ping-pong log-app

# Second command line goal is the version, unless given as VERSION=...
VERSION ?= $(word 2,$(MAKECMDGOALS))

# Kubernetes manifests. Encrypted secrets are decrypted with sops at deploy time,
# the plain secrets.yaml is a local decrypted copy and is never applied.
# Postgres runs in INFRA_NAMESPACE; its config and secret are also copied to
# EXERCISE_NAMESPACE because pods can only reference them from their own namespace.
INFRA_SECRETS      := infra/secrets.enc.yaml
INFRA_CONFIG       := infra/infra-config.yaml
INFRA_MANIFESTS    := $(filter-out %.enc.yaml infra/secrets.yaml $(INFRA_CONFIG),$(wildcard infra/*.yaml))
EXERCISE_DIR       := infra/exercise
EXERCISE_MANIFESTS := $(filter-out $(EXERCISE_DIR)/logs-pvc.yaml,$(wildcard $(EXERCISE_DIR)/*.yaml))
PING_PONG_DIR      := $(DIR_ping-pong)/manifests
LOG_APP_DIR        := $(DIR_log-app)/manifests
INFRA_NAMESPACE    := default
EXERCISE_NAMESPACE := exercises

# Cluster add-ons installed by bootstrap. Argo Rollouts runs a master build for the
# Google Managed Prometheus authentication in AnalysisTemplates, pinned to a commit and image digest
ARGO_ROLLOUTS_REF   := c2c88ae64273e420cb5c01d92ee4bb71d3ae716a
ARGO_ROLLOUTS_IMAGE := quay.io/argoproj/argo-rollouts@sha256:894ee9f4bf2e9f7496fe63d3835409f71c6600a5401371fcf66b4e5f309b940a
NATS_CHART_VERSION  := 2.15.2
NATS_PODMONITORING  := infra/monitoring/nats-podmonitoring.yaml

# $(call apply-shared,<namespace>) applies the config and secret to a namespace
define apply-shared
sops --decrypt $(INFRA_SECRETS) | kubectl -n $(1) apply -f -
kubectl -n $(1) apply -f $(INFRA_CONFIG)
endef

.PHONY: help todo namespace exercise-deploy infra-deploy bootstrap $(APPS)

help:
	@echo "Usage: make <app> <version>"
	@echo "Apps: $(APPS)"
	@echo "Groups: todo (todo-app todo-backend)"
	@echo "Cluster: bootstrap (Argo Rollouts, NATS, NATS PodMonitoring), run after the cluster is created"
	@echo "Deploy: exercise-deploy (infra + $(EXERCISE_DIR) + ping-pong + log-app, postgres in $(INFRA_NAMESPACE), rest in $(EXERCISE_NAMESPACE))"

$(APPS):
	@test -n "$(VERSION)" || { echo "Missing version, e.g. make $@ 1.13"; exit 1; }
	docker build -t $(REGISTRY_USER)/$@:$(VERSION) $(DIR_$@)
	docker push $(REGISTRY_USER)/$@:$(VERSION)

# group -> apps built together with the same version
todo: todo-app todo-backend

namespace:
	kubectl create namespace $(EXERCISE_NAMESPACE) --dry-run=client -o yaml | kubectl apply -f -

infra-deploy:
	$(call apply-shared,$(INFRA_NAMESPACE))
	kubectl -n $(INFRA_NAMESPACE) apply $(addprefix -f ,$(INFRA_MANIFESTS))

exercise-deploy: infra-deploy namespace
	$(call apply-shared,$(EXERCISE_NAMESPACE))
	$(if $(EXERCISE_MANIFESTS),kubectl -n $(EXERCISE_NAMESPACE) apply $(addprefix -f ,$(EXERCISE_MANIFESTS)))
	kubectl -n $(EXERCISE_NAMESPACE) apply -f $(PING_PONG_DIR)
	kubectl -n $(EXERCISE_NAMESPACE) apply -f $(LOG_APP_DIR)

# Installs the cluster add-ons the exercises need on a fresh cluster. Safe to rerun.
# The PodMonitoring CRD comes with GKE managed collection, only the resource is applied.
# Server-side apply: the Argo Rollouts CRDs are too large for the client-side last-applied annotation.
bootstrap:
	kubectl create namespace argo-rollouts --dry-run=client -o yaml | kubectl apply -f -
	kubectl apply --server-side --force-conflicts -n argo-rollouts \
		-f https://raw.githubusercontent.com/argoproj/argo-rollouts/$(ARGO_ROLLOUTS_REF)/manifests/install.yaml
	kubectl -n argo-rollouts set image deploy/argo-rollouts argo-rollouts=$(ARGO_ROLLOUTS_IMAGE)
	kubectl -n argo-rollouts rollout status deploy/argo-rollouts --timeout=180s
	helm repo add nats https://nats-io.github.io/k8s/helm/charts/ --force-update
	helm upgrade --install my-nats nats/nats --version $(NATS_CHART_VERSION) \
		--namespace nats --create-namespace --set promExporter.enabled=true --wait
	kubectl apply -f $(NATS_PODMONITORING)

# Turn the version goal into a no-op so make does not try to build it
ifneq ($(word 2,$(MAKECMDGOALS)),)
$(word 2,$(MAKECMDGOALS)):
	@:
endif
