import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OrdersService } from '../../../../core/services/orders.service';
import { ApiItemResponse } from '../../../../core/interfaces/api';
import { Order } from '../../../../core/interfaces/order';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-order-details',
    standalone: true,
    imports: [CommonModule, CurrencyPipe, DatePipe],
    templateUrl: './order-details.component.html',
    styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly orders = inject(OrdersService);

    order$!: Observable<ApiItemResponse<Order>>;

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id') || '';
        this.order$ = this.orders.getOrder(id);
    }
}
