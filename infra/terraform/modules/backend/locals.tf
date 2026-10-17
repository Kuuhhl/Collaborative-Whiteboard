locals {
  name = "collaborative-whiteboard"

  mongo_db_name = "whiteboard"
  mongo_db_user = "whiteboard"

  # inject the generated credentials into the Atlas SRV connection string.
  mongo_db_url = "mongodb+srv://${local.mongo_db_user}:${random_password.mongo_password.result}@${replace(mongodbatlas_advanced_cluster.cluster.connection_strings.standard_srv, "mongodb+srv://", "")}"
}

resource "random_password" "mongo_password" {
  length  = 32
  special = false
}
