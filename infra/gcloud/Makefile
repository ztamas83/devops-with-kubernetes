PROJECT_ID := $(shell sed -n 's/^project_id *= *"\(.*\)"/\1/p' terraform.tfvars)
LOCATION   := global
POOL_ID    := github-pool
PROVIDER_ID := github-provider
CLUSTER    := dwk-cluster
ZONE       := europe-north2-a

POOL_RES     := google_iam_workload_identity_pool.dwk-gh-pool
PROVIDER_RES := google_iam_workload_identity_pool_provider.dwk-gh-provider

POOL_PATH     := projects/$(PROJECT_ID)/locations/$(LOCATION)/workloadIdentityPools/$(POOL_ID)
PROVIDER_PATH := $(POOL_PATH)/providers/$(PROVIDER_ID)

.PHONY: all init import plan apply destroy

all: apply

init:
	terraform init

# Imports the WIF pool and provider if they exist in GCP but not in the state.
# Soft-deleted (DELETED state) resources are restored first.
import: init
	@state=$$(gcloud iam workload-identity-pools describe $(POOL_ID) \
		--project=$(PROJECT_ID) --location=$(LOCATION) --format='value(state)' 2>/dev/null); \
	if [ -z "$$state" ]; then \
		echo "Pool $(POOL_ID) not found, terraform will create it"; \
	else \
		if [ "$$state" = "DELETED" ]; then \
			echo "Pool $(POOL_ID) is soft-deleted, undeleting"; \
			gcloud iam workload-identity-pools undelete $(POOL_ID) \
				--project=$(PROJECT_ID) --location=$(LOCATION) || exit 1; \
		fi; \
		if terraform state list $(POOL_RES) 2>/dev/null | grep -q .; then \
			echo "Pool $(POOL_ID) already in state"; \
		else \
			terraform import $(POOL_RES) $(POOL_PATH) || exit 1; \
		fi; \
	fi
	@state=$$(gcloud iam workload-identity-pools providers describe $(PROVIDER_ID) \
		--workload-identity-pool=$(POOL_ID) --project=$(PROJECT_ID) --location=$(LOCATION) \
		--format='value(state)' 2>/dev/null); \
	if [ -z "$$state" ]; then \
		echo "Provider $(PROVIDER_ID) not found, terraform will create it"; \
	else \
		if [ "$$state" = "DELETED" ]; then \
			echo "Provider $(PROVIDER_ID) is soft-deleted, undeleting"; \
			gcloud iam workload-identity-pools providers undelete $(PROVIDER_ID) \
				--workload-identity-pool=$(POOL_ID) --project=$(PROJECT_ID) --location=$(LOCATION) || exit 1; \
		fi; \
		if terraform state list $(PROVIDER_RES) 2>/dev/null | grep -q .; then \
			echo "Provider $(PROVIDER_ID) already in state"; \
		else \
			terraform import $(PROVIDER_RES) $(PROVIDER_PATH) || exit 1; \
		fi; \
	fi

plan: import
	terraform plan

apply: import
	terraform apply
	gcloud container clusters get-credentials $(CLUSTER) --zone=$(ZONE) --project=$(PROJECT_ID)

destroy: init
	terraform destroy
