import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-payments',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './payments.component.html',
    styleUrl: './payments.component.scss'
})
export class PaymentsComponent {
    // Mock data for now - will integrate with payment APIs later
    paymentMethods = [
        {
            id: '1',
            type: 'Visa',
            last4: '4242',
            expiry: '12/2025',
            isDefault: true
        },
        {
            id: '2',
            type: 'Mastercard',
            last4: '5555',
            expiry: '08/2026',
            isDefault: false
        }
    ];
}
