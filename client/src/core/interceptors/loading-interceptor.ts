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
  const generateCacheKey = (url: string, params: HttpParams): string => {
    const paramString = params.keys().map(key => `${key}=${params.get(key)}`).join('&');

    return paramString ? `${url}?${paramString}` : url;
  }

  // we are creating a method 178 lesson to invalidate cache

  //method: invalidateCache => we're effectively going to loop over our cache keys. 
  // And we're going to look for a pattern that matches the URL inside our cache keys, and if it finds it
  // based on what we passed to this method, then we're going to delete that cache key.
  // And then the next time a request comes in because that's not going to be available inside the cache.
  // That's going to force us to go out to the API to get fresh data.
  const invalidateCache = (urlPattern: string) => {
    // method: invalidateCache
    for (const key of cache.keys()) {
      if (key.includes(urlPattern)) {
        cache.delete(key);
        console.log(`Cache invalidated for:  ${key}`);
      }

    }
  }

  const cacheKey = generateCacheKey(req.url, req.params);

  if (req.method.includes('POST') && req.url.includes('/likes')) {
    invalidateCache('/likes')
  }
  // when new message created Invalidate cache
  if (req.method.includes('POST') && req.url.includes('/messages')) {
    invalidateCache('/messages')
  }

  // when user logsout we need to clear cache
  if (req.method.includes('POST') && req.url.includes('/logout')) {
    cache.clear();
  }

  if (req.method === 'GET') {
    // const cachedResponse = cache.get(req.url);
    console.log(cacheKey);
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      return of(cachedResponse);
    }
  }

  busyService.busy();

  // after the request comes back to us we need to use the rxjs operator
  // 500ms half second 
  return next(req).pipe(
    delay(500),
    tap(reponse => {
      cache.set(cacheKey, reponse);
    }),
    finalize(() => {
      busyService.idle()
    })
  );
};
