import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-success.component.html',
  styleUrl: './order-success.component.scss'
})
export class OrderSuccessComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  public readonly loading = signal(true);
  public readonly orderId = signal<string | null>(null);

  ngOnInit(): void {
    // Check if we have order ID from URL params or session storage
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id') || sessionStorage.getItem('orderId');

    if (orderId) {
      this.orderId.set(orderId);
      this.loading.set(false);
      this.toast.success('Order placed successfully!');
    } else {
      this.loading.set(false);
      this.toast.error('Order information not found');
    }

    // Clear any stored data
    sessionStorage.removeItem('orderId');
    sessionStorage.removeItem('shippingAddress');
  }

  goToOrders(): void {
    this.router.navigate(['/account/orders']);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}
