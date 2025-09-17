import { Injectable, inject } from '@angular/core';
import { Observable, debounceTime, distinctUntilChanged, map, switchMap, forkJoin, of, shareReplay } from 'rxjs';
import { CatalogService } from './catalog.service';
import { ApiListResponse } from '../interfaces/api';
import { Product } from '../interfaces/catalog';

export interface ProductSearchParams {
  q?: string | null;
  sort?: string | null;
  category?: string | null;
  brand?: string | null;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly catalog = inject(CatalogService);

  private cache = new Map<string, Observable<Product[]>>();

  searchProducts(
    filters$: Observable<ProductSearchParams>,
    debounceMs = 1000
  ): Observable<ApiListResponse<Product>> {
    return filters$.pipe(
      debounceTime(debounceMs),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      switchMap((form) => {
        const q = (form?.q || '').toString().trim();
        const sortVal = (form?.sort || '-sold')!.toString();
        const categoryId = (form?.category || '').toString();
        const brandId = (form?.brand || '').toString();

        return this.getAllProductsFor(categoryId, brandId).pipe(
          map((all) => {
            const lowered = q.toLowerCase();
            let data = !lowered
              ? [...all]
              : all.filter((p: Product) => (p.title || '').toLowerCase().includes(lowered));

            // client-side sort
            data = this.sortProducts(data, sortVal);

            return { results: data.length, data } as ApiListResponse<Product>;
          })
        );
      })
    );
  }

  private getAllProductsFor(categoryId: string | null | undefined, brandId: string | null | undefined): Observable<Product[]> {
    const key = `${categoryId ? `cat:${categoryId}` : 'all'}|${brandId ? `brand:${brandId}` : 'all'}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    const params: Record<string, string> = { limit: '50' };
    if (categoryId) params['category[in]'] = categoryId as string;
    if (brandId) params['brand[in]'] = brandId as string;

    const obs = this.fetchAllProducts(params).pipe(
      map((res) => res.data || []),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    this.cache.set(key, obs);
    return obs;
  }

  private sortProducts(data: Product[], sortVal: string): Product[] {
    const arr = [...data];
    switch (sortVal) {
      case 'price':
        return arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      case '-price':
        return arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      case '-ratingsAverage':
        return arr.sort((a, b) => (b.ratingsAverage ?? 0) - (a.ratingsAverage ?? 0));
      case '-sold':
      default:
        return arr.sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0));
    }
  }

  private fetchAllProducts(params: Record<string, string>): Observable<ApiListResponse<Product>> {
    const firstParams = { ...params, page: '1' };
    return this.catalog.getProducts(firstParams).pipe(
      switchMap((first) => {
        const meta: any = first.metadata || {};
        const pages = Number((meta && (meta.numberOfPages || meta?.pagination?.numberOfPages)) || 1);
        if (pages <= 1) return of(first);
        const reqs: Observable<ApiListResponse<Product>>[] = [];
        for (let p = 2; p <= pages; p++) {
          reqs.push(this.catalog.getProducts({ ...firstParams, page: String(p) }));
        }
        return (reqs.length ? forkJoin(reqs) : of([])).pipe(
          map((rest: ApiListResponse<Product>[]) => {
            const combined = rest.reduce<Product[]>((acc, r) => acc.concat(r.data || []), [...(first.data || [])]);
            return { results: combined.length, metadata: first.metadata, data: combined } as ApiListResponse<Product>;
          })
        );
      })
    );
  }
}
