// MongoDB Atlas connection, cached across serverless invocations.
import { MongoClient } from 'mongodb';

export const normalizeEmail = (e) => String(e || '').trim().toLowerCase();
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let dbPromise;
export function getDb() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI env var is missing');
  if (!dbPromise) {
    dbPromise = new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 5, serverSelectionTimeoutMS: 8000 })
      .connect()
      .then(async (client) => {
        const db = client.db(process.env.MONGODB_DB || 'placementtwin');
        // TTL indexes: Mongo auto-deletes expired docs (checked roughly every minute).
        await Promise.all(['pending', 'otps', 'loginfails'].map((c) =>
          db.collection(c).createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })));
        return db;
      })
      .catch((err) => { dbPromise = null; throw err; });
  }
  return dbPromise;
}
