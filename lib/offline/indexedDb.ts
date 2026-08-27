/**
 * Spendy Offline-First Database Engine (IndexedDB)
 * Adheres to Section 2, 4 & 5 of Offline-First Specification.
 */

const DB_NAME = 'spendy_offline_db';
const DB_VERSION = 1;

export interface SyncQueueItem {
  id: string;
  user_id: string;
  entity_type: 'accounts' | 'categories' | 'transactions' | 'transfers' | 'budgets' | 'savings_goals' | 'recurring_transactions';
  entity_id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  created_at: string;
  attempt_count: number;
  last_attempt_at?: string;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  error?: string;
}

let dbInstance: IDBDatabase | null = null;

export function getIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('IndexedDB is only available in browser environments'));
    }

    if (dbInstance) {
      return resolve(dbInstance);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Entity Stores
      const stores = [
        'accounts',
        'categories',
        'transactions',
        'transfers',
        'budgets',
        'savings_goals',
        'recurring_transactions',
      ];

      for (const storeName of stores) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      }

      // Dedicated Sync Queue Store
      if (!db.objectStoreNames.contains('sync_queue')) {
        const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
        syncStore.createIndex('status', 'status', { unique: false });
        syncStore.createIndex('created_at', 'created_at', { unique: false });
        syncStore.createIndex('user_id', 'user_id', { unique: false });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open Spendy IndexedDB'));
    };
  });
}

// Generic Store Operations
export async function getStoreAll<T>(storeName: string): Promise<T[]> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn(`[IndexedDB] Error reading store ${storeName}:`, e);
    return [];
  }
}

export async function putStoreItem<T extends { id: string }>(storeName: string, item: T): Promise<void> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn(`[IndexedDB] Error saving to ${storeName}:`, e);
  }
}

export async function putStoreAll<T extends { id: string }>(storeName: string, items: T[]): Promise<void> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      for (const item of items) {
        store.put(item);
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (e) {
    console.warn(`[IndexedDB] Error batch saving to ${storeName}:`, e);
  }
}

export async function deleteStoreItem(storeName: string, id: string): Promise<void> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn(`[IndexedDB] Error deleting from ${storeName}:`, e);
  }
}

// Sync Queue Operations
export async function enqueueSync(item: SyncQueueItem): Promise<void> {
  await putStoreItem('sync_queue', item);
}

export async function getPendingSyncQueue(userId?: string): Promise<SyncQueueItem[]> {
  try {
    const all = await getStoreAll<SyncQueueItem>('sync_queue');
    return all.filter((i) => {
      const matchesUser = !userId || i.user_id === userId;
      const isPending = i.status === 'PENDING' || i.status === 'FAILED';
      return matchesUser && isPending;
    });
  } catch {
    return [];
  }
}

export async function getFullSyncQueue(userId?: string): Promise<SyncQueueItem[]> {
  try {
    const all = await getStoreAll<SyncQueueItem>('sync_queue');
    return userId ? all.filter((i) => i.user_id === userId) : all;
  } catch {
    return [];
  }
}

export async function updateSyncItemStatus(
  id: string,
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED',
  error?: string
): Promise<void> {
  try {
    const db = await getIndexedDB();
    const transaction = db.transaction('sync_queue', 'readwrite');
    const store = transaction.objectStore('sync_queue');
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const item = getReq.result as SyncQueueItem | undefined;
      if (item) {
        item.status = status;
        item.last_attempt_at = new Date().toISOString();
        if (status === 'SYNCING') {
          item.attempt_count = (item.attempt_count || 0) + 1;
        }
        if (error !== undefined) {
          item.error = error;
        }
        store.put(item);
      }
    };
  } catch (e) {
    console.warn('[IndexedDB] Error updating sync item status:', e);
  }
}

export async function removeSyncQueueItem(id: string): Promise<void> {
  await deleteStoreItem('sync_queue', id);
}

export async function clearAllOfflineStores(): Promise<void> {
  try {
    const db = await getIndexedDB();
    const stores = [
      'accounts',
      'categories',
      'transactions',
      'transfers',
      'budgets',
      'savings_goals',
      'recurring_transactions',
      'sync_queue',
    ];

    const transaction = db.transaction(stores, 'readwrite');
    for (const s of stores) {
      transaction.objectStore(s).clear();
    }
  } catch (e) {
    console.warn('[IndexedDB] Error clearing stores:', e);
  }
}
