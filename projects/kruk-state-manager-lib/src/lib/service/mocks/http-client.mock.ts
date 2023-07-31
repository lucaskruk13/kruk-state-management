import { HttpClient, HttpContext, HttpEvent, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export class MockHttpClient {
  public get(url: string) {}

  public put(url: string, body: object) {}

  public post(url: string, body: object) {}

  public delete(url: string) {}
}
