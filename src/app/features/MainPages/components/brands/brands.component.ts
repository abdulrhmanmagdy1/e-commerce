import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { CatalogService } from '../../../../core/services/catalog.service';
import { ApiListResponse } from '../../../../core/interfaces/api';
import { Brand } from '../../../../core/interfaces/catalog';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.scss'
})
export class BrandsComponent {
  private readonly catalog = inject(CatalogService);
  brands$!: Observable<ApiListResponse<Brand>>;

  ngOnInit(): void {
    this.brands$ = this.catalog.getBrands();
  }
}
