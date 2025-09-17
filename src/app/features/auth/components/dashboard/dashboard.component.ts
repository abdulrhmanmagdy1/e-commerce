import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersService } from '../../../../core/services/orders.service';
import { TokenService } from '../../../../core/services/token.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ApiItemResponse } from '../../../../core/interfaces/api';
import { Order } from '../../../../core/interfaces/order';
import { User } from '../../../../core/interfaces/auth';
import { Observable, combineLatest, map, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly tokenService = inject(TokenService);
  private readonly wishlistService = inject(WishlistService);
  private readonly authService = inject(AuthService);

  orders$!: Observable<Order[]>;
  wishlist$!: Observable<ApiItemResponse<any[]>>;
  user$!: Observable<User | null>;
  dashboardData$!: Observable<{
    totalOrders: number;
    inTransit: number;
    wishlistItems: number;
    totalSpent: number;
    recentOrders: Order[];
    userName: string;
    userInitials: string;
  }>;

  ngOnInit(): void {
    const token = this.tokenService.get();
    const userId = token ? this.safeDecode(token) : null;
    if (!userId) return;

    this.orders$ = this.ordersService.getUserOrders(userId);
    this.wishlist$ = this.wishlistService.getWishlist();

    // Get user data from token
    this.user$ = of(this.getUserFromToken());

    this.dashboardData$ = combineLatest([this.orders$, this.wishlist$, this.user$]).pipe(
      map(([orders, wishlistRes, user]) => {
        const wishlistItems = wishlistRes.data || [];

        return {
          totalOrders: orders.length,
          inTransit: orders.filter(o => !o.isDelivered && o.isPaid).length,
          wishlistItems: wishlistItems.length,
          totalSpent: orders.reduce((sum, o) => sum + o.totalOrderPrice, 0),
          recentOrders: orders.slice(0, 3),
          userName: user?.name || 'User',
          userInitials: this.getUserInitials(user?.name || 'User')
        };
      })
    );
  }

  private getUserFromToken(): User | null {
    const token = this.tokenService.get();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      return {
        _id: payload?.id || payload?._id || '',
        name: payload?.name || 'User',
        email: payload?.email || '',
        role: payload?.role || 'user'
      };
    } catch {
      return null;
    }
  }

  private getUserInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  private safeDecode(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      return payload?.id || payload?._id || null;
    } catch {
      return null;
    }
  }
}
