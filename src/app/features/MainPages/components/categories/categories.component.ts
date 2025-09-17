import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { CatalogService } from '../../../../core/services/catalog.service';
import { ApiListResponse } from '../../../../core/interfaces/api';
import { Category } from '../../../../core/interfaces/catalog';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent {
  private readonly catalog = inject(CatalogService);
  categories$!: Observable<ApiListResponse<Category>>;

  ngOnInit(): void {
    this.categories$ = this.catalog.getCategories();
  }
}
