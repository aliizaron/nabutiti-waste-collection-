/**
 * IndexedDB Utility for Offline Field Task Updates
 * Web-Based Waste Collection Management and Monitoring System
 * Case Study of Nabutiti Village, Kansanga, Kampala
 */

import { WasteRequest, RequestStatus } from '../types';

const DB_NAME = 'nabutiti_waste_offline_db';
const DB_VERSION = 1;

export interface OfflineTaskUpdate {
  id?: number;
  requestId: number;
  assignmentId?: number;
  newStatus: RequestStatus;
  collectorNotes: string;
  proofPhoto?: string;
  timestamp: string;
  synced: boolean;
}

/**
 * Open or initialize the IndexedDB instance
 */
export function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Pending task updates queue (for offline submissions)
      if (!db.objectStoreNames.contains('pending_updates')) {
        const updateStore = db.createObjectStore('pending_updates', {
          keyPath: 'id',
          autoIncrement: true
        });
        updateStore.createIndex('requestId', 'requestId', { unique: false });
        updateStore.createIndex('synced', 'synced', { unique: false });
      }

      // 2. Cached tasks store (for viewing assigned jobs while offline)
      if (!db.objectStoreNames.contains('cached_tasks')) {
        db.createObjectStore('cached_tasks', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Save a collector task update to the offline IndexedDB queue
 */
export async function saveOfflineTaskUpdate(
  update: Omit<OfflineTaskUpdate, 'id'>
): Promise<number> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending_updates'], 'readwrite');
    const store = transaction.objectStore('pending_updates');
    const request = store.add(update);

    request.onsuccess = () => {
      resolve(request.result as number);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Retrieve all pending task updates awaiting synchronization
 */
export async function getPendingOfflineUpdates(): Promise<OfflineTaskUpdate[]> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending_updates'], 'readonly');
    const store = transaction.objectStore('pending_updates');
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as OfflineTaskUpdate[]);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Delete a specific pending update after successful synchronization
 */
export async function deletePendingOfflineUpdate(id: number): Promise<void> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending_updates'], 'readwrite');
    const store = transaction.objectStore('pending_updates');
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Clear all pending offline updates
 */
export async function clearAllPendingOfflineUpdates(): Promise<void> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending_updates'], 'readwrite');
    const store = transaction.objectStore('pending_updates');
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Cache current tasks into IndexedDB so collectors can view route when offline
 */
export async function cacheTasksInIndexedDB(tasks: WasteRequest[]): Promise<void> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['cached_tasks'], 'readwrite');
    const store = transaction.objectStore('cached_tasks');
    
    // Clear old cache and populate new
    store.clear().onsuccess = () => {
      tasks.forEach((t) => store.put(t));
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

/**
 * Get cached tasks from IndexedDB when offline
 */
export async function getCachedTasksFromIndexedDB(): Promise<WasteRequest[]> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['cached_tasks'], 'readonly');
    const store = transaction.objectStore('cached_tasks');
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as WasteRequest[]);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
