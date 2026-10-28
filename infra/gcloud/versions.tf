terraform {
  required_version = ">= 1.6"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 8.9"
    }
  }

  backend "gcs" {
    bucket = "dwk-tfstate"
    prefix = "gcloud"
  }
}
