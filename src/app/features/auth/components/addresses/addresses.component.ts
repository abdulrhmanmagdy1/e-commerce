import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AddressesService } from '../../../../core/services/addresses.service';
import { ApiItemResponse } from '../../../../core/interfaces/api';
import { Address } from '../../../../core/interfaces/order';
import { Observable, Subject, startWith, switchMap } from 'rxjs';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
    selector: 'app-addresses',
    standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './addresses.component.html',
  styleUrl: './addresses.component.scss'
})
export class AddressesComponent implements OnInit {
  private readonly addressesService = inject(AddressesService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  addresses$!: Observable<ApiItemResponse<Address[]>>;
  private readonly reload$ = new Subject<void>();

  isModalOpen = signal(false);
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    details: ['', [Validators.required, Validators.minLength(5)]],
    phone: ['', [Validators.required]],
    city: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.addresses$ = this.reload$.pipe(
      startWith(void 0),
      switchMap(() => this.addressesService.getAddresses())
    );
  }

  openModal(): void { this.isModalOpen.set(true); }
  closeModal(): void { this.isModalOpen.set(false); this.form.reset({ name: '', details: '', phone: '', city: '' }); }

  submit(): void {
    if (this.form.invalid) return;
    this.addressesService.addAddress(this.form.value).subscribe({
      next: () => { this.toast.success('Address added'); this.closeModal(); this.reload$.next(); },
      error: () => this.toast.error('Failed to add address')
    });
  }

  remove(id: string): void {
    this.addressesService.removeAddress(id).subscribe({
      next: () => { this.toast.success('Address removed'); this.reload$.next(); },
      error: () => this.toast.error('Failed to remove address')
    });
  }
}
