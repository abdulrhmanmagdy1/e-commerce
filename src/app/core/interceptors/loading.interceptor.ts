import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
    const loading = inject(LoadingService);
    const skip = req.context.get(SKIP_LOADING);
    if (!skip) loading.start();
    return next(req).pipe(finalize(() => { if (!skip) loading.stop(); }));
};
