
resource "google_service_account" "cluster-sa" {
    account_id = "gke-cluster-sa"
    display_name = "GKE cluster SA"
}

resource "google_project_iam_member" "obj-creator" {
  project = var.project_id
  role    = "roles/storage.objectCreator"
  member  = google_service_account.cluster-sa.member
}

resource "google_project_iam_member" "obj-viewer" {
  project = var.project_id
  role    = "roles/storage.objectViewer"
  member  = google_service_account.cluster-sa.member
}