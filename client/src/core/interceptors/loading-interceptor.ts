import { HttpEvent, HttpInterceptorFn, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { BusyService } from '../services/busy-service';
import { delay, finalize, of, tap } from 'rxjs';


// Map : key/value pair key in this case in the get request url
// we're  only caching get requests 

const cache = new Map<string, HttpEvent<unknown>>();


export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService);

  //method to create a cache key
  const generateCacheKey = (url:string, params:HttpParams): string => {
    const paramString =params.keys().map(key => `${key}=${params.get(key)}`).join('&');

    return paramString ? `${url}?${paramString}` : url; 
  }


  const cachKey = generateCacheKey(req.url, req.params);
  if (req.method === 'GET'){
    // const cachedResponse = cache.get(req.url);
    console.log(cachKey);
    const cachedResponse = cache.get(cachKey);
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
      cache.set(cachKey, reponse);
    }),
    finalize(() =>{
      busyService.idle()
    })
  );
};
