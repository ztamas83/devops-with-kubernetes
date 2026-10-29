resource "google_container_cluster" "dwk-cluster" {
  name     = "dwk-cluster"
  location = "europe-north2-a"
  deletion_protection = false
}

resource "google_container_node_pool" "dwk-pool" {
  name       = "dwk-pool"
  location   = "europe-north2-a"
  cluster    = google_container_cluster.dwk-cluster.name
  autoscaling {
    min_node_count = 1
    max_node_count = 4
  }

  node_config {
    preemptible  = true
    machine_type = "e2-small"

    # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
    service_account = google_service_account.cluster-sa.email
    oauth_scopes    = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
    disk_size_gb = 24

  }
}


# resource "google_container_node_pool" "extra-pool" {
#   name       = "dwk-pool-med"
#   location   = "europe-north2-a"
#   cluster    = google_container_cluster.dwk-cluster.name
#   node_count = 1
#   autoscaling {
#     min_node_count = 0
#     max_node_count = 1
#   }

#   node_config {
#     preemptible  = true
#     machine_type = "e2-medium"

#     # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
#     service_account = google_service_account.cluster-sa.email
#     oauth_scopes    = [
#       "https://www.googleapis.com/auth/cloud-platform"
#     ]
#     disk_size_gb = 24
#   }
# }
