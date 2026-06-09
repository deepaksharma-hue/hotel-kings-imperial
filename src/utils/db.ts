const DB_NAME = "hki_restaurant_db";
const STORE_NAME = "key_value_store";

const getDBUrl = () => {
  let url = import.meta.env.VITE_DATABASE_URL || "";
  if (url && url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  return url;
};

// Local IndexedDB Helpers
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getLocalDBItem = async (key: string): Promise<any> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error(`IndexedDB read failed for key "${key}":`, e);
    return null;
  }
};

export const setLocalDBItem = async (key: string, value: any): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error(`IndexedDB write failed for key "${key}":`, e);
  }
};

// Unified DB get/set helpers with online database sync
export const getDBItem = async (key: string): Promise<any> => {
  const dbUrl = getDBUrl();
  
  // Special case for orders_data: load all individual orders from /orders.json
  if (key === "hki_orders_data" && dbUrl) {
    try {
      const response = await fetch(`${dbUrl}/orders.json`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          // Convert dictionary of orders to a sorted array (newest first)
          const ordersArray = Object.values(data).sort(
            (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          await setLocalDBItem(key, ordersArray);
          return ordersArray;
        }
        return [];
      }
    } catch (e) {
      console.warn("Failed to fetch orders from online database, loading local fallback:", e);
    }
  }

  // General online fetch
  if (dbUrl) {
    try {
      const response = await fetch(`${dbUrl}/${key}.json`);
      if (response.ok) {
        const data = await response.json();
        if (data !== null) {
          await setLocalDBItem(key, data);
          return data;
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch key "${key}" from online database, falling back to local:`, e);
    }
  }

  return getLocalDBItem(key);
};

export const setDBItem = async (key: string, value: any): Promise<void> => {
  // Save locally first
  await setLocalDBItem(key, value);

  // Sync to online database if configured
  const dbUrl = getDBUrl();
  if (dbUrl) {
    try {
      // For orders_data: do NOT write the entire array under orders.json, 
      // instead orders are updated individually. We only allow writing of full key 
      // if it's not the orders array, to prevent client overwrites.
      if (key === "hki_orders_data") {
        return; // Orders updates are handled individually via updateOrderStatus/deleteOrder
      }

      await fetch(`${dbUrl}/${key}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
    } catch (e) {
      console.error(`Failed to sync key "${key}" to online database:`, e);
    }
  }
};

// Online Order Operations
export const submitOrderOnline = async (order: any): Promise<boolean> => {
  const dbUrl = getDBUrl();
  if (!dbUrl) return false;

  try {
    const response = await fetch(`${dbUrl}/orders/${order.id}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    return response.ok;
  } catch (e) {
    console.error("Failed to submit order to online database:", e);
    return false;
  }
};

export const updateOrderStatusOnline = async (orderId: string, newStatus: string): Promise<boolean> => {
  const dbUrl = getDBUrl();
  if (!dbUrl) return false;

  try {
    const response = await fetch(`${dbUrl}/orders/${orderId}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus: newStatus }),
    });
    return response.ok;
  } catch (e) {
    console.error(`Failed to update status for order ${orderId} online:`, e);
    return false;
  }
};

export const updateOrderDetailsOnline = async (order: any): Promise<boolean> => {
  const dbUrl = getDBUrl();
  if (!dbUrl) return false;

  try {
    const response = await fetch(`${dbUrl}/orders/${order.id}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    return response.ok;
  } catch (e) {
    console.error(`Failed to update details for order ${order.id} online:`, e);
    return false;
  }
};

export const deleteOrderOnline = async (orderId: string): Promise<boolean> => {
  const dbUrl = getDBUrl();
  if (!dbUrl) return false;

  try {
    const response = await fetch(`${dbUrl}/orders/${orderId}.json`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (e) {
    console.error(`Failed to delete order ${orderId} from online database:`, e);
    return false;
  }
};
