db = db.getSiblingDB("${MONGO_INITDB_DATABASE}");
db.createCollection('annotations');
db.createCollection('annotations_temp');
db.createUser(
  {
    user: "${MONGO_INITDB_USERNAME}",
    pwd: "${MONGO_INITDB_PASSWORD}",
    roles: [
      {
        role: "readWrite",
        db: "${MONGO_INITDB_DATABASE}"
      }
    ]
  }
);
