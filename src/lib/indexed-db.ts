import { openDB, type DBSchema } from 'idb';

const DB_NAME = 'codbbitDB';
const DB_VERSION = 1;
const PROBLEMS_STORE_NAME = 'problems';
const PROBLEMS_KEY = 'all-problems';

interface CodbbitDB extends DBSchema {
  [PROBLEMS_STORE_NAME]: {
    key: string;
    value: any[];
  };
}

const dbPromise = openDB<CodbbitDB>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(PROBLEMS_STORE_NAME)) {
      db.createObjectStore(PROBLEMS_STORE_NAME);
    }
  },
});

export async function getProblemsFromDB(): Promise<any[] | null> {
  try {
    const db = await dbPromise;
    const problems = await db.get(PROBLEMS_STORE_NAME, PROBLEMS_KEY);
    return problems || null;
  } catch (error) {
    console.error("Failed to get problems from IndexedDB:", error);
    return null;
  }
}

export async function saveProblemsToDB(problems: any[]): Promise<void> {
  try {
    const db = await dbPromise;
    await db.put(PROBLEMS_STORE_NAME, problems, PROBLEMS_KEY);
  } catch (error) {
    console.error("Failed to save problems to IndexedDB:", error);
  }
}
