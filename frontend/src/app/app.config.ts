import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi, withInterceptors } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { authErrorInterceptor } from './core/interceptors/auth-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi(), withInterceptors([authErrorInterceptor])),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ]
};
