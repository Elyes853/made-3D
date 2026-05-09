import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LithophaneService {
  private memoryStore = new Map<string, string>(); // id -> compressed dataUrl
  private readonly prefix = 'litho_img_';

  /** Persist image in memory + sessionStorage (survives route navigation) */
  storeImage(id: string, dataUrl: string): void {
    this.memoryStore.set(id, dataUrl);
    try {
      sessionStorage.setItem(this.prefix + id, dataUrl);
    } catch {
      // sessionStorage quota exceeded – in-memory still works for the session
    }
  }

  /** Retrieve image by id */
  getImage(id: string): string | null {
    if (this.memoryStore.has(id)) return this.memoryStore.get(id)!;
    const stored = sessionStorage.getItem(this.prefix + id);
    if (stored) {
      this.memoryStore.set(id, stored);
      return stored;
    }
    return null;
  }

  removeImage(id: string): void {
    this.memoryStore.delete(id);
    sessionStorage.removeItem(this.prefix + id);
  }

  /** Returns all stored image ids */
  getStoredIds(): string[] {
    return Array.from(this.memoryStore.keys());
  }
}
