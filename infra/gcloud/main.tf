
resource "google_service_account" "gh-actions" {
    account_id = "github-actions-sa"
    display_name = "GitHub Actions SA"
}

# resource "google_project_iam_custom_role" "dwk-deployer-role" {
#   role_id     = "dwkDeployer"
#   title       = "DevOps With Kubernetes deployer"
#   permissions = ["roles/artifactregistry.writer", "iam.roles.create", "iam.roles.delete"]
# }

resource "google_project_iam_member" "ar_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = google_service_account.gh-actions.member
}

resource "google_project_iam_member" "gke_admin" {
  project = var.project_id
  role    = "roles/container.admin"
  member  = google_service_account.gh-actions.member
}

# resource "google_iam_workload_identity_pool" "dwk-gh-pool" {
#   workload_identity_pool_id = "github-pool"
#   display_name              = "GitHub actions pool"
#   disabled                  = false
#   mode                      = "FEDERATION_ONLY"
  
# }

# resource "google_iam_workload_identity_pool_provider" "dwk-gh-provider" {
#   workload_identity_pool_id          = google_iam_workload_identity_pool.dwk-gh-pool.workload_identity_pool_id
#   workload_identity_pool_provider_id = "github-provider"
#   attribute_mapping = {
#     "google.subject"="assertion.sub"
#     "attribute.repository"="assertion.repository"
#   }

#   attribute_condition = "assertion.repository=='ztamas83/devops-with-kubernetes'"
#   oidc {
#     issuer_uri = "https://token.actions.githubusercontent.com"
#   }
# }

# resource "google_service_account_iam_member" "deployer_access" {
#     service_account_id = google_service_account.gh-actions.name
#     role = "roles/iam.workloadIdentityUser"
#     member = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.dwk-gh-pool.name}/attribute.repository/ztamas83/devops-with-kubernetes"
# }