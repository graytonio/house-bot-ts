import { MongoClient } from "mongodb";
import { Database } from "./global";

async function connect({ uri, db_name }: { uri: string; db_name: string }): Promise<Database | null> {
  if (!uri || !db_name) return null;

  console.log("Connecting to DB...");
  const client = new MongoClient(uri);
  await client.connect();
  console.log("DB connection successful");

  const db = client.db(db_name);
  const choreCollection = db.collection("chores");
  const membersCollection = db.collection("members");
  const choreLogCollection = db.collection("chores_log");

  const DB: Database = {
    db: db,
    choreCollection: choreCollection,
    membersCollection: membersCollection,
    choreLogCollection: choreLogCollection,
  };

  await createDBIndexes({ db: DB });
  return DB;
}

async function createDBIndexes({ db }: { db: Database }) {
  console.log("Creating DB Indexes...");
  await db.choreCollection.createIndex({ name: 1 }, { unique: true });
  await db.membersCollection.createIndex({ id: 1 }, { unique: true });
  console.log("DB Indexes Created");
}

export default connect;
