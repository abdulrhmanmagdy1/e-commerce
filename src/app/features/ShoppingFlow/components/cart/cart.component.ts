import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { Observable } from 'rxjs';
import { ApiItemResponse } from '../../../../core/interfaces/api';
import { Cart } from '../../../../core/interfaces/catalog';

@Component({
  selector: 'app-cart',
  imports: [AsyncPipe, CurrencyPipe, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  private readonly cart = inject(CartService);
  cart$!: Observable<ApiItemResponse<Cart>>;

  ngOnInit(): void {
    this.cart$ = this.cart.getCart();
  }

  inc(productId: string, current: number): void {
    this.cart.updateItemQuantity(productId, current + 1).subscribe(res => this.cart$ = this.cart.getCart());
  }
  dec(productId: string, current: number): void {
    if (current <= 1) { this.remove(productId); return; }
    this.cart.updateItemQuantity(productId, current - 1).subscribe(res => this.cart$ = this.cart.getCart());
  }
  remove(productId: string): void { this.cart.removeItem(productId).subscribe(res => this.cart$ = this.cart.getCart()); }
  clear(): void { this.cart.clearCart().subscribe(res => this.cart$ = this.cart.getCart()); }
}
