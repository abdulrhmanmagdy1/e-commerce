import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../core/services/cart.service';
import { OrdersService, ShippingAddress } from '../../../../core/services/orders.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ApiItemResponse } from '../../../../core/interfaces/api';
import { Cart } from '../../../../core/interfaces/catalog';
import { AddressesService } from '../../../../core/services/addresses.service';
import { Address } from '../../../../core/interfaces/order';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './checkout.component.html',
    styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly cart = inject(CartService);
    private readonly orders = inject(OrdersService);
    private readonly router = inject(Router);
    private readonly toast = inject(ToastService);
    private readonly addresses = inject(AddressesService);

    public readonly loading = signal(false);
    public readonly cartData = signal<ApiItemResponse<Cart> | null>(null);
    public readonly savedAddresses = signal<Address[]>([]);
    public readonly selectedMode = signal<'saved' | 'new'>('saved');
    public readonly selectedAddressId = signal<string | null>(null);
    public readonly selectedAddress = computed(() => {
        const id = this.selectedAddressId();
        return this.savedAddresses().find(a => a._id === id) || null;
    });

    public readonly shippingForm: FormGroup = this.fb.group({
        details: ['', [Validators.required, Validators.minLength(10)]],
        phone: ['', [Validators.required, Validators.pattern(/^01[0-9]{9}$/)]],
        city: ['', [Validators.required, Validators.minLength(2)]]
    });

    ngOnInit(): void {
        this.loadCartData();
        this.loadAddresses();
    }

    private loadCartData(): void {
        this.cart.getCart().subscribe({
            next: (res) => {
                this.cartData.set(res);
                if (!res.data?.products?.length) {
                    this.toast.error('Your cart is empty');
                    this.router.navigate(['/cart']);
                }
            },
            error: () => {
                this.toast.error('Failed to load cart data');
                this.router.navigate(['/cart']);
            }
        });
    }

    private loadAddresses(): void {
        this.addresses.getAddresses().subscribe({
            next: (res) => {
                const list = res.data || [];
                this.savedAddresses.set(list);
                if (list.length) {
                    this.selectedAddressId.set(list[0]._id);
                    this.fillFormFromAddress(list[0]);
                    this.selectedMode.set('saved');
                } else {
                    this.selectedMode.set('new');
                }
            },
            error: () => {
                this.savedAddresses.set([]);
                this.selectedMode.set('new');
            }
        });
    }

    selectMode(mode: 'saved' | 'new'): void {
        this.selectedMode.set(mode);
        if (mode === 'new') {
            this.shippingForm.reset({ details: '', phone: '', city: '' });
        } else if (this.selectedAddress()) {
            this.fillFormFromAddress(this.selectedAddress()!);
        }
    }

    selectAddress(id: string): void {
        this.selectedAddressId.set(id);
        const addr = this.selectedAddress();
        if (addr) this.fillFormFromAddress(addr);
    }

    private fillFormFromAddress(addr: Address): void {
        this.shippingForm.patchValue({
            details: addr.details || '',
            phone: addr.phone || '',
            city: addr.city || ''
        });
    }

    onSubmit(): void {
        if (this.shippingForm.invalid) {
            this.toast.error('Please fill all required fields correctly');
            return;
        }

        const cartData = this.cartData();
        if (!cartData?.data?._id) {
            this.toast.error('Cart not found');
            return;
        }

        this.loading.set(true);
        let shippingAddress: ShippingAddress = this.shippingForm.value;
        if (this.selectedMode() === 'saved' && this.selectedAddress()) {
            const a = this.selectedAddress()!;
            shippingAddress = { details: a.details, phone: a.phone, city: a.city || '' };
        }

        // Create checkout session with Stripe
        // API expects only the base URL (origin). It will redirect to `${url}/account/orders` or `${url}/cart`.
        this.orders.createCheckoutSession(
            cartData.data._id,
            window.location.origin,
            shippingAddress
        ).subscribe({
            next: (response) => {
                this.loading.set(false);
                if ((response as any)?.session?.url) {
                    // Redirect to Stripe payment
                    window.location.href = (response as any).session.url;
                } else {
                    this.toast.error('Failed to create payment session');
                }
            },
            error: (err) => {
                this.loading.set(false);
                console.error('Checkout error:', err);
                this.toast.error('Failed to process payment. Please try again.');
            }
        });
    }

    getTotalPrice(): number {
        const cart = this.cartData();
        return cart?.data?.totalCartPrice || 0;
    }

    getTotalItems(): number {
        const cart = this.cartData();
        return cart?.data?.products?.length || 0;
    }
}
