import { Injectable, Inject, PLATFORM_ID, signal, effect } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

export type Lang = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly STORAGE_KEY = 'lang';
  private translations = new Map<string, string>();
  public readonly lang = signal<Lang>('en');

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: any
  ) {
    effect(() => {
      const l = this.lang();
      this.applyDir(l);
      if (this.isBrowser()) {
        try { localStorage.setItem(this.STORAGE_KEY, l); } catch {}
      }
    });
  }

  private isBrowser() { return isPlatformBrowser(this.platformId); }

  async initialize(): Promise<void> {
    let initial: Lang = 'en';
    if (this.isBrowser()) {
      try { initial = (localStorage.getItem(this.STORAGE_KEY) as Lang) || 'en'; } catch {}
    }
    await this.load(initial);
  }

  async load(lang: Lang): Promise<void> {
    const path = `/i18n/${lang}.json`;
    const data = await firstValueFrom(this.http.get<Record<string, string>>(path).pipe(map(d => d || {})));
    this.translations.clear();
    Object.entries(data).forEach(([k, v]) => this.translations.set(k, String(v)));
    this.lang.set(lang);
  }

  toggle(): void { this.set(this.lang() === 'en' ? 'ar' : 'en'); }
  async set(lang: Lang): Promise<void> { await this.load(lang); }

  t(key: string, params?: Record<string, any>): string {
    let value = this.translations.get(key) || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(new RegExp(`\\{{${k}\\}}`, 'g'), String(v));
      });
    }
    return value;
  }

  private applyDir(lang: Lang) {
    if (!this.isBrowser()) return;
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    const el = this.document?.documentElement as HTMLElement;
    if (el) { el.setAttribute('dir', dir); el.setAttribute('lang', lang); }
    const body = this.document?.body as HTMLElement;
    if (body) {
      body.classList.toggle('rtl', lang === 'ar');
    }
  }
}
