import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

interface CacheEntry<T = any> {
  url: string;
  response: HttpResponse<T>;
  added: number;
  ttl: number;
}

@Injectable({ providedIn: 'root' })
export class HttpCacheService {
  private cache = new Map<string, CacheEntry>();

  // Default TTL: 5 minutes
  private readonly defaultTtlMs = 5 * 60 * 1000;

  get<T = any>(key: string): HttpResponse<T> | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const isExpired = Date.now() - entry.added > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    return entry.response.clone();
  }

  set<T = any>(key: string, response: HttpResponse<T>, ttlMs: number = this.defaultTtlMs): void {
    const entry: CacheEntry<T> = {
      url: key,
      response: response.clone(),
      added: Date.now(),
      ttl: ttlMs,
    };
    this.cache.set(key, entry);
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}
