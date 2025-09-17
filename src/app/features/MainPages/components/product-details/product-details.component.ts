import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe, AsyncPipe } from '@angular/common';
import { CatalogService } from '../../../../core/services/catalog.service';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ApiItemResponse } from '../../../../core/interfaces/api';
import { Product } from '../../../../core/interfaces/catalog';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CurrencyPipe, AsyncPipe],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(CatalogService);
  private readonly cart = inject(CartService);
  protected readonly wishlist = inject(WishlistService);
  private readonly toast = inject(ToastService);

  product$!: Observable<ApiItemResponse<Product>>;

  ngOnInit(): void {
    this.product$ = this.route.paramMap.pipe(
      switchMap(params => this.catalog.getProduct(params.get('id') || ''))
    );
  }

  addToCart(productId: string): void {
    this.cart.addToCart(productId).subscribe({
      next: () => this.toast.success('Added to cart successfully!'),
      error: () => this.toast.error('Failed to add to cart')
    });
  }

  toggleWishlist(productId: string): void {
    const isWishlisted = this.wishlist.ids().has(productId);
    console.log('Before toggle - isWishlisted:', isWishlisted, 'wishlist ids:', this.wishlist.ids());

    const action = isWishlisted ? this.wishlist.remove(productId) : this.wishlist.add(productId);
    action.subscribe({
      next: () => {
        console.log('After API success - wishlist ids:', this.wishlist.ids());
        this.toast.success(isWishlisted ? 'Removed from wishlist!' : 'Added to wishlist!');
      },
      error: () => {
        console.log('API error - reverting wishlist ids:', this.wishlist.ids());
        this.toast.error(isWishlisted ? 'Failed to remove from wishlist' : 'Failed to add to wishlist');
      }
    });
  }
}
