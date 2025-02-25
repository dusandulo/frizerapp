import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  let isRefreshing = false;
  const refreshTokenSubject = new BehaviorSubject<string | null>(null);

  const authReq = token
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        if (req.url.includes('/refresh-token')) {
          authService.logout();
          router.navigate(['/auth']);
          return throwError(() => new Error('Refresh is invalid'));
        }
        return handle401Error(authReq, next);
      }
      return throwError(() => error);
    })
  );

  function handle401Error(request: HttpRequest<unknown>, nextFn: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokenSubject.next(null);

      return authService.refreshToken().pipe(
        switchMap((newToken: string) => {
          isRefreshing = false;
          refreshTokenSubject.next(newToken);
          return nextFn(
            request.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            })
          );
        }),
        catchError((err) => {
          isRefreshing = false;
          authService.logout();
          router.navigate(['/auth']);
          return throwError(() => err);
        })
      );
    } else {
      return refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) =>
          nextFn(
            request.clone({
              setHeaders: { Authorization: `Bearer ${token}` },
            })
          )
        )
      );
    }
  }
};