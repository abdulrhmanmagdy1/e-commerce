import { Component, inject } from '@angular/core';
import { CurrencyPipe, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { CartService } from '../../../../core/services/cart.service';
import { Product } from '../../../../core/interfaces/catalog';
import { ApiItemResponse } from '../../../../core/interfaces/api';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, AsyncPipe],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent {
  private readonly wishlist = inject(WishlistService);
  private readonly cart = inject(CartService);

  items$!: Observable<ApiItemResponse<Product[]>>;

  ngOnInit(): void {
    this.items$ = this.wishlist.getWishlist();
  }

  remove(productId: string): void {
    this.wishlist.remove(productId).subscribe({
      next: () => {
        // Refresh the wishlist items from API
        this.items$ = this.wishlist.getWishlist();
      },
      error: (error) => {
        console.error('Failed to remove from wishlist:', error);
      }
    });
  }

  addToCart(productId: string): void {
    this.cart.addToCart(productId).subscribe();
  }
}
