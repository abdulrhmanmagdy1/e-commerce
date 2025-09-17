import { Component, inject, OnInit, signal } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { CatalogService } from '../../../../core/services/catalog.service';
import { ApiListResponse } from '../../../../core/interfaces/api';
import { Category, Product } from '../../../../core/interfaces/catalog';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AsyncPipe, RouterLink, CurrencyPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly catalog = inject(CatalogService);

  products$!: Observable<ApiListResponse<Product>>;
  categories$!: Observable<ApiListResponse<Category>>;

  // Slider data
  currentSlide = signal(0);
  sliderProducts$!: Observable<ApiListResponse<Product>>;

  // Static images data
  staticImages = [
    {
      title: 'Health & Beauty',
      image: '/images/img4.avif',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800'
    },
    {
      title: 'Fresh Fruits',
      image: '/images/img5.avif',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800'
    }
  ];

  ngOnInit(): void {
    this.products$ = this.catalog.getProducts({ limit: 8, sort: '-sold' });
    this.categories$ = this.catalog.getCategories();
    this.sliderProducts$ = this.catalog.getProducts({ limit: 5, sort: '-sold' });

    // Auto-slide every 5 seconds
    setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide(): void {
    this.currentSlide.update(current => (current + 1) % 3);
  }

  prevSlide(): void {
    this.currentSlide.update(current => current === 0 ? 2 : current - 1);
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
  }
}
