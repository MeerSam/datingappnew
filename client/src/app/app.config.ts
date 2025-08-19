import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { InitService } from '../core/services/init-service';
import { lastValueFrom } from 'rxjs';
import { errorInterceptor } from '../core/interceptors/error-interceptor';
import { jwtInterceptor } from '../core/interceptors/jwt-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([errorInterceptor,jwtInterceptor])),
    provideAppInitializer(async () => {
      const initService = inject(InitService);
      return new Promise<void>((resolve) => {
        setTimeout(async () => {
          // we have to get api info later so we need to try catch if there is failure
          try {
            return lastValueFrom(initService.init());
          } finally {
            // finally when the app is initialized do this
            // We're going to have a little splash screen whilst we're waiting for the app to initialize.
            const splash = document.getElementById('initial-splash');
            if (splash) {
              splash.remove();
            }
            resolve();
          }
        }, 500);
      })
    })
  ]
};
