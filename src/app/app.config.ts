import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { cacheInterceptor } from './core/interceptors/cache.interceptor';
import { CartService } from './core/services/cart.service';
import { TokenService } from './core/services/token.service';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { WishlistService } from './core/services/wishlist.service';
import { I18nService } from './core/services/i18n.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([cacheInterceptor, authInterceptor, errorInterceptor, loadingInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: (wishlistService: WishlistService) => () => {
        wishlistService.initializeWishlist();
        return Promise.resolve();
      },
      deps: [WishlistService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (cart: CartService, tokens: TokenService) => () => {
        const token = tokens.get();
        if (token) {
          cart.refreshCount(true).subscribe({ complete: () => {} , error: () => {} });
        }
        return Promise.resolve();
      },
      deps: [CartService, TokenService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (i18n: I18nService) => () => i18n.initialize(),
      deps: [I18nService],
      multi: true
    }
  ]
};
