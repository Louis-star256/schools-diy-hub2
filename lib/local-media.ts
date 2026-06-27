
/**
 * @fileOverview Local Media Persistence Engine.
 * Saves large files to the user's device (IndexedDB) to save cloud storage costs.
 */

export const localMediaDB = {
  saveMedia: async (id: string, blob: Blob) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SchoolsDIYHub_Media', 1);
      
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('media')) {
          db.createObjectStore('media');
        }
      };

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction(['media'], 'readwrite');
        const store = transaction.objectStore('media');
        store.put(blob, id);
        resolve(true);
      };

      request.onerror = () => reject('Local storage access denied.');
    });
  },

  getMedia: async (id: string): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const request = indexedDB.open('SchoolsDIYHub_Media', 1);
      request.onsuccess = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('media')) {
          resolve(null);
          return;
        }
        const transaction = db.transaction(['media'], 'readonly');
        const store = transaction.objectStore('media');
        const getReq = store.get(id);
        getReq.onsuccess = () => resolve(getReq.result);
        getReq.onerror = () => resolve(null);
      };
      request.onerror = () => resolve(null);
    });
  }
};
