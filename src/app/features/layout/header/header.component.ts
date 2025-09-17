import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';
import { TokenService } from '../../../core/services/token.service';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { I18nService } from '../../../core/services/i18n.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, NgClass, NgIf, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  protected readonly cart = inject(CartService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18nService);
  public readonly isLoggedIn = signal(false);
  private routerSubscription?: Subscription;

  ngOnInit(): void {
    this.checkAuthStatus();
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkAuthStatus();
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  private checkAuthStatus(): void {
    const token = this.tokenService.get();
    this.isLoggedIn.set(!!token);
  }

  toggleMobileMenu() { this.isMobileMenuOpen = !this.isMobileMenuOpen; }
  toggleLang() { this.i18n.toggle(); }

  logout(): void {
    this.tokenService.clear();
    this.isLoggedIn.set(false);
    this.router.navigate(['/home']);
  }
}
