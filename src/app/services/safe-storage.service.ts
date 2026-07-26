import { Injectable } from '@angular/core';

type StorageArea = 'session' | 'local';

@Injectable({
  providedIn: 'root'
})
export class SafeStorageService {
  getItem(key: string, area: StorageArea): string | null {
    const storage = this.getStorage(area);
    if (!storage) {
      return null;
    }

    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string, area: StorageArea): boolean {
    const storage = this.getStorage(area);
    if (!storage) {
      return false;
    }

    try {
      storage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  removeItem(key: string, area: StorageArea): void {
    const storage = this.getStorage(area);
    if (!storage) {
      return;
    }

    try {
      storage.removeItem(key);
    } catch {
      // Ignore storage deletion errors to keep UI responsive.
    }
  }

  private getStorage(area: StorageArea): Storage | null {
    try {
      return area === 'session' ? window.sessionStorage : window.localStorage;
    } catch {
      return null;
    }
  }
}
