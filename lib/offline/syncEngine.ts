/**
 * Spendy Automatic Cloud Synchronization Engine
 * Adheres to Sections 6, 7, 8, 9 & 24 of Offline-First Specification.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  getPendingSyncQueue,
  updateSyncItemStatus,
  removeSyncQueueItem,
  SyncQueueItem,
} from './indexedDb';

export type SyncState = 'synced' | 'offline' | 'syncing' | 'pending_sync' | 'error';

export interface SyncEngineResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  error?: string;
}

let isSyncRunning = false;

/**
 * Verifies that the network is truly connected to Supabase and not in a captive portal or dead wifi state.
 */
export async function verifyCloudReachability(supabase: SupabaseClient): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  try {
    // Quick head check against Supabase profiles
    const { error } = await supabase.from('profiles').select('id', { head: true, count: 'exact' });
    return !error || error.code === 'PGRST116' || error.message.includes('JSON');
  } catch {
    return false;
  }
}

/**
 * Processes all pending items in the local IndexedDB sync queue idempotently.
 */
export async function processSyncQueue(
  supabase: SupabaseClient | null,
  userId: string,
  onProgress?: (synced: number, total: number) => void
): Promise<SyncEngineResult> {
  if (!supabase || !userId) {
    return { success: false, syncedCount: 0, failedCount: 0, error: 'User not authenticated' };
  }

  if (isSyncRunning) {
    return { success: true, syncedCount: 0, failedCount: 0 };
  }

  isSyncRunning = true;
  let syncedCount = 0;
  let failedCount = 0;

  try {
    const isReachable = await verifyCloudReachability(supabase);
    if (!isReachable) {
      isSyncRunning = false;
      return { success: false, syncedCount: 0, failedCount: 0, error: 'Cloud unreachable' };
    }

    const pendingItems = await getPendingSyncQueue(userId);
    const total = pendingItems.length;

    if (total === 0) {
      isSyncRunning = false;
      return { success: true, syncedCount: 0, failedCount: 0 };
    }

    for (let i = 0; i < pendingItems.length; i++) {
      const item = pendingItems[i];

      try {
        await updateSyncItemStatus(item.id, 'SYNCING');

        // Apply operation idempotently using client-generated UUID
        if (item.operation === 'CREATE' || item.operation === 'UPDATE') {
          const { error } = await supabase
            .from(item.entity_type)
            .upsert(item.payload, { onConflict: 'id' });

          if (error) {
            throw error;
          }
        } else if (item.operation === 'DELETE') {
          const { error } = await supabase
            .from(item.entity_type)
            .delete()
            .eq('id', item.entity_id);

          if (error) {
            throw error;
          }
        }

        // Successfully synced -> clean up from local queue
        await removeSyncQueueItem(item.id);
        syncedCount++;
        if (onProgress) onProgress(syncedCount, total);
      } catch (err: unknown) {
        const error = err as Error;
        console.warn(`[SyncEngine] Failed to sync item ${item.id}:`, error.message);
        await updateSyncItemStatus(item.id, 'FAILED', error.message);
        failedCount++;
      }
    }

    return {
      success: failedCount === 0,
      syncedCount,
      failedCount,
    };
  } catch (e: unknown) {
    const error = e as Error;
    return { success: false, syncedCount, failedCount, error: error.message };
  } finally {
    isSyncRunning = false;
  }
}
