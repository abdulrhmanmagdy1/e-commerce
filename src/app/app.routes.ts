import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

// Eager components (loaded on first request)
import { HomeComponent } from './features/MainPages/components/home/home.component';
import { AllProductsComponent } from './features/MainPages/components/all-products/all-products.component';
import { CategoriesComponent } from './features/MainPages/components/categories/categories.component';
import { ProductDetailsComponent } from './features/MainPages/components/product-details/product-details.component';
import { CartComponent } from './features/ShoppingFlow/components/cart/cart.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { ForgotPasswordComponent } from './features/auth/components/forgot-password/forgot-password.component';
import { AboutComponent } from './features/InfoPages/about/about.component';
import { ContactComponent } from './features/InfoPages/contact/contact.component';
import { FAQComponent } from './features/InfoPages/faq/faq.component';
import { PrivacyPolicyComponent } from './features/InfoPages/privacy-policy/privacy-policy.component';
import { TermsComponent } from './features/InfoPages/terms/terms.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },

  // Main pages (eager)
  { path: 'home', component: HomeComponent },
  { path: 'products', component: AllProductsComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'brands', loadComponent: () => import('./features/MainPages/components/brands/brands.component').then(m => m.BrandsComponent) },
  { path: 'brands/:id', loadComponent: () => import('./features/MainPages/components/brand-details/brand-details.component').then(m => m.BrandDetailsComponent) },
  { path: 'product/:id', component: ProductDetailsComponent },

  // Wishlist and account/checkout flows remain lazy
  { path: 'wishlist', loadComponent: () => import('./features/MainPages/components/wishlist/wishlist.component').then(m => m.WishlistComponent), canActivate: [authGuard] },

  // Shopping flow (auth-only, lazy)
  { path: 'cart', component: CartComponent },
  { path: 'checkout', loadComponent: () => import('./features/ShoppingFlow/components/checkout/checkout.component').then(m => m.CheckoutComponent), canActivate: [authGuard] },
  { path: 'shipping', loadComponent: () => import('./features/ShoppingFlow/components/shipping/shipping.component').then(m => m.ShippingComponent), canActivate: [authGuard] },
  { path: 'pay', loadComponent: () => import('./features/ShoppingFlow/components/pay/pay.component').then(m => m.PayComponent), canActivate: [authGuard] },
  { path: 'order-review', loadComponent: () => import('./features/ShoppingFlow/components/order-review/order-review.component').then(m => m.OrderReviewComponent), canActivate: [authGuard] },
  { path: 'order-success', loadComponent: () => import('./features/ShoppingFlow/components/order-success/order-success.component').then(m => m.OrderSuccessComponent), canActivate: [authGuard] },

  // Auth pages (eager)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // Account area (lazy module with tabs)
  { path: 'account', loadChildren: () => import('./features/account/account.module').then(m => m.AccountModule) },
  // Backward compatible redirects
  { path: 'dashboard', redirectTo: 'account/overview', pathMatch: 'full' },
  { path: 'allorders', redirectTo: 'account/orders', pathMatch: 'full' },
  { path: 'addresses', redirectTo: 'account/addresses', pathMatch: 'full' },
  { path: 'payments', redirectTo: 'account/payments', pathMatch: 'full' },
  { path: 'profile', redirectTo: 'account/profile', pathMatch: 'full' },
  { path: 'orders/:id', loadComponent: () => import('./features/ShoppingFlow/components/order-details/order-details.component').then(m => m.OrderDetailsComponent), canActivate: [authGuard] },

  // Info pages (eager)
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'faq', component: FAQComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'terms', component: TermsComponent },

  // Not found (lazy)
  { path: '**', loadComponent: () => import('./features/InfoPages/notfound/notfound.component').then(m => m.NotfoundComponent) },
];
