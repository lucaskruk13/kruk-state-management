import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { http_verb, k_state_service_options } from '../types/service-types.type';
import { Observable, of, tap, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class KrukStateManagerLibService {
  constructor(private httpService: HttpClient) {}

  /**
   * Make a HTTP Request. This Method will check the state for the api storage and
   * then return that object if found. If not, it will make the api request and
   * then cache the result as it is returned
   *
   * Options that can be provided:
   *  fresh: if true, bypass the cache check
   *  body: Http Request Body
   *  headers: HttpHeaders
   *
   * @param verb HTTP Request Verb
   * @param endpoint Full Endpoint of the api request
   * @param options k_state_service_options
   *
   * @returns Observable of the http request, or the cached value wrapped in an observable
   */
  public makeRequest<T extends Object>(verb: http_verb, endpoint: string, options?: k_state_service_options): Observable<T> {
    const timerStart = performance.now();
    const item = options?.fresh ? null : window.sessionStorage.getItem(endpoint);
    const monitor = window.sessionStorage.getItem('monitor') === 'true';
    const logTime = () => {
      const timerEnd = performance.now();
      monitor && console.log(`makeRequest took ${timerEnd - timerStart}s to complete`);
    };

    if (item && verb === 'get') {
      const val = JSON.parse(item);
      logTime();

      return of<T>(val);
    }

    const cacheSideEffect = tap<T>((x: T) => {
      window.sessionStorage.setItem(endpoint, JSON.stringify(x));

      logTime();
    });

    if ((verb === 'post' || verb === 'put') && !options?.body) {
      return throwError(() => new Error('Put/Post requests must contain a body'));
    }

    if (verb === 'put') {
      return this.httpService.put<T>(endpoint, options?.body).pipe(cacheSideEffect);
    }

    if (verb === 'post') {
      return this.httpService.post<T>(endpoint, options?.body).pipe(cacheSideEffect);
    }

    if (verb === 'delete') {
      return this.httpService.delete<T>(endpoint);
    }

    return this.httpService.get<T>(endpoint).pipe(cacheSideEffect);
  }

  //#region Private

  //#endregion
}
