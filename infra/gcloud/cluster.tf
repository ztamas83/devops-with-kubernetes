resource "google_container_cluster" "dwk-cluster" {
  name     = "dwk-cluster"
  location = "europe-north2-a"

  # Required prior to GKE 1.36.4-gke.1469000 to use separately managed node pools
  # remove_default_node_pool = true
  #initial_node_count       = 0

}

resource "google_container_node_pool" "dwk-pool" {
  name       = "dwk-pool"
  location   = "europe-north2-a"
  cluster    = google_container_cluster.dwk-cluster.name
  node_count = 4

  node_config {
    preemptible  = true
    machine_type = "e2-small"

    # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
    service_account = google_service_account.cluster-sa.email
    oauth_scopes    = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
    disk_size_gb = 32
  }
}
