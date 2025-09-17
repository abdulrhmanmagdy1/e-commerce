import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersService } from '../../../../core/services/orders.service';
import { Order } from '../../../../core/interfaces/order';
import { TokenService } from '../../../../core/services/token.service';
import { Observable, map, catchError, of } from 'rxjs';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss'
})
export class OrderHistoryComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly tokenService = inject(TokenService);

  orders$!: Observable<Order[]>;
  error: string | null = null;

  ngOnInit(): void {
    const userId = this.getUserIdFromToken();
    console.log('User ID from token:', userId);
    if (!userId) {
      console.log('No user ID found in token');
      this.error = 'Please log in to view your orders.';
      return;
    }

    this.orders$ = this.ordersService.getUserOrders(userId).pipe(
      catchError(error => {
        console.error('Error fetching orders:', error);
        this.error = 'Failed to load orders. Please try again.';
        return of([]);
      })
    );
  }

  private getUserIdFromToken(): string | null {
    const token = this.tokenService.get();
    console.log('Token from storage:', token ? 'Token exists' : 'No token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      console.log('Token payload:', payload);
      const userId = payload?.id || payload?._id || null;
      console.log('Extracted user ID:', userId);
      return userId;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }
}
