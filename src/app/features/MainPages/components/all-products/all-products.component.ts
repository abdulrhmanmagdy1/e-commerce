import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject, startWith, tap, merge, map, distinctUntilChanged } from 'rxjs';
import { CatalogService } from '../../../../core/services/catalog.service';
import { ApiListResponse } from '../../../../core/interfaces/api';
import { Product } from '../../../../core/interfaces/catalog';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { ToastService } from '../../../../core/services/toast.service';
import { SearchService } from '../../../../core/services/search.service';

@Component({
  selector: 'app-all-products',
  standalone: true,
  imports: [AsyncPipe, RouterLink, CurrencyPipe, ReactiveFormsModule],
  templateUrl: './all-products.component.html',
  styleUrl: './all-products.component.scss'
})
export class AllProductsComponent implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly fb = inject(FormBuilder);
  private readonly cart = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly wishlist = inject(WishlistService);
  private readonly toast = inject(ToastService);
  private readonly search = inject(SearchService);
  private readonly manualSearch$ = new Subject<void>();

  public readonly filters: FormGroup = this.fb.group({
    sort: ['-sold'],
    q: [''],
    category: [''],
    brand: ['']
  });

  products$!: Observable<ApiListResponse<Product>>;

  ngOnInit(): void {
    // Initialize from URL params (supports coming from categories page)
    const qp = this.route.snapshot.queryParamMap;
    const keyword = qp.get('keyword') || '';
    const sort = qp.get('sort') || '-sold';
    const category = qp.get('category') || '';
    const brand = qp.get('brand') || '';
    this.filters.patchValue({ q: keyword, sort, category, brand }, { emitEvent: false });

    // Real-time search with URL sync + manual trigger (button/Enter)
    const valueChanges$ = this.filters.valueChanges.pipe(startWith(this.filters.value));

    // Keep form in sync when query params change (e.g., navigating from Categories)
    this.route.queryParamMap.pipe(
      map((qp) => ({
        q: qp.get('keyword') || '',
        sort: qp.get('sort') || '-sold',
        category: qp.get('category') || '',
        brand: qp.get('brand') || ''
      })),
      distinctUntilChanged((a, b) => a.q === b.q && a.sort === b.sort && a.category === b.category && a.brand === b.brand)
    ).subscribe((v) => this.filters.patchValue(v, { emitEvent: true }));
    const filters$ = merge(
      valueChanges$,
      this.manualSearch$.pipe(map(() => this.filters.value))
    ).pipe(
      tap((form: any) => {
        const q: string = (form?.q || '').toString().trim();
        const sortVal: string = (form?.sort || '-sold').toString();
        const categoryId: string = (form?.category || '').toString();
        const brandId: string = (form?.brand || '').toString();
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { keyword: q || null, sort: sortVal, category: categoryId || null, brand: brandId || null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      })
    );

    this.products$ = this.search.searchProducts(filters$, 3000);
  }

  addToCart(productId: string): void {
    this.cart.addToCart(productId).subscribe({
      next: () => this.toast.success('Added to cart successfully!'),
      error: () => this.toast.error('Failed to add to cart')
    });
  }

  toggleWishlist(productId: string): void {
    const isWishlisted = this.wishlist.ids().has(productId);
    console.log('AllProducts - Before toggle - isWishlisted:', isWishlisted, 'wishlist ids:', this.wishlist.ids());

    const action = isWishlisted ? this.wishlist.remove(productId) : this.wishlist.add(productId);
    action.subscribe({
      next: () => {
        console.log('AllProducts - After API success - wishlist ids:', this.wishlist.ids());
        this.toast.success(isWishlisted ? 'Removed from wishlist!' : 'Added to wishlist!');
      },
      error: () => {
        console.log('AllProducts - API error - reverting wishlist ids:', this.wishlist.ids());
        this.toast.error(isWishlisted ? 'Failed to remove from wishlist' : 'Failed to add to wishlist');
      }
    });
  }

  onSearchNow(): void {
    this.manualSearch$.next();
  }
}
