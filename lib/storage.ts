/**
 * Safe LocalStorage and Storage Quota Management Utility
 * Protects against DOMException: Setting the value of '...' exceeded the quota
 * Provides in-memory fallback, proactive cache pruning, and image compression.
 */

// In-memory fallback map when localStorage quota is exhausted or unavailable
const inMemoryStorage = new Map<string, string>();

/**
 * Strips or downsamples giant data URIs (>50KB) inside a JSON string to protect localStorage
 */
function sanitizeLargeDataUris(jsonStr: string, maxLen = 60000): string {
  if (!jsonStr || jsonStr.length < maxLen) return jsonStr;
  try {
    // Replace large data:image URLs with empty string in stored cache
    return jsonStr.replace(/"data:image\/[a-zA-Z0-9+.-]+;base64,[^"]{60000,}"/g, '""');
  } catch (e) {
    return jsonStr;
  }
}

/**
 * Prunes non-critical and oversized data from localStorage to free up quota
 */
export function pruneLocalStorage(targetKey?: string, targetValue?: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  try {
    console.warn('[SafeStorage] Storage quota reached. Commencing automatic cache cleanup...');

    // 1. Clear non-essential security audit logs and login attempts
    window.localStorage.removeItem('gp_security_audit_logs');
    window.localStorage.removeItem('gp_security_login_attempts');

    // 2. Scan all stored keys and strip giant base64 images from cached lists
    const keysToCheck = [
      'gp_admin_list',
      'gp_office_details_list',
      'gp_developer_profile',
      'gp_business_registrations',
      'gp_families',
      'gp_other_tax_receipts',
    ];

    for (const key of keysToCheck) {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw && raw.length > 80000) {
          const sanitized = sanitizeLargeDataUris(raw);
          if (sanitized.length < raw.length) {
            window.localStorage.setItem(key, sanitized);
            console.info(`[SafeStorage] Stripped large image payloads from cached key "${key}"`);
          }
        }
      } catch (err) {
        // If updating a key fails, remove it to free immediate space
        try {
          window.localStorage.removeItem(key);
        } catch {}
      }
    }

    // 3. If targetKey and targetValue were passed, attempt write again
    if (targetKey && targetValue !== undefined) {
      try {
        const valueToSave = sanitizeLargeDataUris(targetValue);
        window.localStorage.setItem(targetKey, valueToSave);
        console.info(`[SafeStorage] Successfully saved "${targetKey}" after cleanup.`);
        return true;
      } catch (secondErr) {
        // Try removing the existing item first
        try {
          window.localStorage.removeItem(targetKey);
          window.localStorage.setItem(targetKey, sanitizeLargeDataUris(targetValue));
          return true;
        } catch (thirdErr) {
          console.warn(`[SafeStorage] Unable to save "${targetKey}" to localStorage after pruning. Falling back to memory storage.`);
        }
      }
    }

    return true;
  } catch (globalErr) {
    console.error('[SafeStorage] Error during cache pruning:', globalErr);
    return false;
  }
}

/**
 * Safely writes to localStorage with automatic QuotaExceeded recovery and in-memory fallback.
 * Guaranteed never to throw an unhandled exception.
 */
export function safeSetItem(key: string, value: string): boolean {
  if (value === null || value === undefined) {
    safeRemoveItem(key);
    return true;
  }

  // Always keep in-memory fallback synchronized
  inMemoryStorage.set(key, value);

  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error: any) {
    const isQuota =
      error?.name === 'QuotaExceededError' ||
      error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error?.code === 22 ||
      error?.code === 1014 ||
      error?.number === -2147024882 ||
      (typeof error?.message === 'string' && error.message.toLowerCase().includes('quota'));

    if (isQuota) {
      console.warn(`[SafeStorage] QuotaExceededError writing "${key}". Recovering space...`);
      const recovered = pruneLocalStorage(key, value);
      if (recovered) {
        return true;
      }
    } else {
      console.warn(`[SafeStorage] Error writing "${key}" to localStorage:`, error?.message);
    }

    // Store in-memory so application state remains consistent without throwing
    inMemoryStorage.set(key, value);
    return false;
  }
}

/**
 * Safely retrieves an item from in-memory cache or localStorage.
 * Guaranteed never to throw.
 */
export function safeGetItem(key: string): string | null {
  if (inMemoryStorage.has(key)) {
    return inMemoryStorage.get(key) ?? null;
  }

  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const item = window.localStorage.getItem(key);
    if (item !== null) {
      inMemoryStorage.set(key, item);
      return item;
    }
  } catch (e) {
    console.warn(`[SafeStorage] Error reading "${key}" from localStorage:`, e);
  }

  return null;
}

/**
 * Safely removes an item from in-memory storage and localStorage.
 */
export function safeRemoveItem(key: string): void {
  inMemoryStorage.delete(key);

  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (e) {
    console.warn(`[SafeStorage] Error removing "${key}" from localStorage:`, e);
  }
}

/**
 * Clears entire application storage cache if requested by user or recovery handler
 */
export function clearExcessStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    // Keep theme, login admin, and custom supabase credentials if present
    const preserved: Record<string, string | null> = {
      app_theme: window.localStorage.getItem('app_theme'),
      custom_supabase_url: window.localStorage.getItem('custom_supabase_url'),
      custom_supabase_anon_key: window.localStorage.getItem('custom_supabase_anon_key'),
    };

    // Remove heavy and transient keys
    const purgeKeys = [
      'gp_security_audit_logs',
      'gp_security_login_attempts',
      'gp_admin_list',
      'gp_office_details_list',
      'gp_developer_profile',
      'gp_business_registrations',
      'gp_other_tax_receipts',
      'gp_building_permissions',
      'gp_booking_rents',
      'gp_vouchers',
      'gp_works',
      'gp_vendors',
      'gp_account_heads',
      'gp_subheads',
      'gp_tax_beneficiary_lists',
      'gp_complaints',
      'gp_announcements',
      'gp_subscriptions',
      'gp_subscription_plans',
    ];

    for (const k of purgeKeys) {
      try {
        window.localStorage.removeItem(k);
      } catch {}
    }

    // Restore preserved config
    for (const [k, v] of Object.entries(preserved)) {
      if (v) {
        try {
          window.localStorage.setItem(k, v);
        } catch {}
      }
    }

    console.info('[SafeStorage] Storage cache successfully cleared.');
  } catch (e) {
    console.error('[SafeStorage] Error during clearExcessStorage:', e);
  }
}

/**
 * Compresses an image File or base64 Data URL to a lightweight JPEG/PNG thumbnail
 * Ensures avatars and logos are ~10KB - 25KB instead of several megabytes.
 */
export function compressImage(
  source: File | string,
  maxWidth = 320,
  maxHeight = 320,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve(typeof source === 'string' ? source : '');
      return;
    }

    const processDataUrl = (dataUrl: string) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Export as JPEG with controlled quality
          const outputDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(outputDataUrl);
        } catch (err) {
          console.warn('[SafeStorage] Canvas image compression failed, using original:', err);
          resolve(dataUrl);
        }
      };

      img.onerror = () => {
        resolve(dataUrl);
      };

      img.src = dataUrl;
    };

    if (typeof source === 'string') {
      processDataUrl(source);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          processDataUrl(result);
        } else {
          resolve('');
        }
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(source);
    }
  });
}

// Automatically verify storage health and run initial cleanup if already overflowing
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const testKey = '__gp_storage_test__';
    try {
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
    } catch (quotaErr) {
      console.warn('[SafeStorage] Startup storage test failed. Running proactive cleanup...');
      pruneLocalStorage();
    }
  }
} catch {}

export const safeStorage = {
  getItem: safeGetItem,
  setItem: safeSetItem,
  removeItem: safeRemoveItem,
  clear: clearExcessStorage,
};
