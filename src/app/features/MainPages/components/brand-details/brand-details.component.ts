import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { CatalogService } from '../../../../core/services/catalog.service';
import { ApiItemResponse } from '../../../../core/interfaces/api';
import { Brand } from '../../../../core/interfaces/catalog';

@Component({
  selector: 'app-brand-details',
  standalone: true,
  imports: [AsyncPipe, RouterLink, NgIf, CurrencyPipe],
  templateUrl: './brand-details.component.html',
  styleUrl: './brand-details.component.scss'
})
export class BrandDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(CatalogService);

  brand$!: Observable<ApiItemResponse<Brand>>;

  ngOnInit(): void {
    this.brand$ = this.route.paramMap.pipe(
      switchMap((params) => this.catalog.getBrand(params.get('id') || ''))
    );
  }
}
