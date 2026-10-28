
resource "google_service_account" "storage-sa" {
    account_id = "gke-storage-sa"
    display_name = "GKE Storage SA"
}

resource "google_project_iam_member" "obj-creator" {
  project = var.project_id
  role    = "roles/storage.objectCreator"
  member  = google_service_account.storage-sa.member
}

resource "google_project_iam_member" "obj-creator" {
  project = var.project_id
  role    = "roles/storage.objectViewer"
  member  = google_service_account.storage-sa.member
}