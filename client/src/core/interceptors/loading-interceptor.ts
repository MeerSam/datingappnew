import { HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BusyService } from '../services/busy-service';
import { delay, finalize, of, tap } from 'rxjs';


// Map : key/value pair key in this case in the get request url
// we're  only caching get requests 

const cache = new Map<string, HttpEvent<unknown>>();


export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService);

  if (req.method === 'GET'){
    const cachedResponse = cache.get(req.url);
    if(cachedResponse) {
      return of(cachedResponse);
    }
  }

  busyService.busy();

  // after the request comes back to us we need to use the rxjs operator
  // 500ms half second 
  return next(req).pipe(
    delay(500),
    tap( reponse => {
      cache.set(req.url, reponse);
    }),
    finalize(() =>{
      busyService.idle()
    })
  );
};
