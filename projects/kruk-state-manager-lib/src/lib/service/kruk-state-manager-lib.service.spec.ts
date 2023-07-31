import { TestBed, waitForAsync } from '@angular/core/testing';
import { KrukStateManagerLibService } from './kruk-state-manager-lib.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { MockHttpClient } from './mocks/http-client.mock';
import { SessionStorageMock } from './mocks/session-store.mock';

describe('KrukStateManagerLibService', () => {
  let service: KrukStateManagerLibService;
  let httpClient: HttpClient;
  let httpGetSpy: jasmine.Spy;
  let httpPutSpy: jasmine.Spy;
  let httpPostSpy: jasmine.Spy;
  let httpDeleteSpy: jasmine.Spy;
  let sessionStorageMock: SessionStorageMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: HttpClient, useClass: MockHttpClient }],
    });
    service = TestBed.inject(KrukStateManagerLibService);
    httpClient = TestBed.inject(HttpClient);

    // Session Storage
    sessionStorageMock = new SessionStorageMock();
    spyOn(window.sessionStorage, 'getItem').and.callFake(sessionStorageMock.getItem);
    spyOn(window.sessionStorage, 'setItem').and.callFake(sessionStorageMock.setItem);
  });

  const fakeHTTPCall = <T extends object>(obj: T): void => {
    httpGetSpy = spyOn(httpClient, 'get').and.returnValue(of(obj));
    httpPutSpy = spyOn(httpClient, 'put').and.returnValue(of(obj));
    httpPostSpy = spyOn(httpClient, 'post').and.returnValue(of(obj));
    httpDeleteSpy = spyOn(httpClient, 'delete').and.returnValue(of(obj));
  };

  describe('Item is found in cache', () => {
    it('Should not call HTTP Client if item is found in cache', () => {
      sessionStorageMock.setItem('demoEndpoint', JSON.stringify({ foo: 'bar' }));
      fakeHTTPCall({ foo: 'bar' });
      service.makeRequest('get', 'demoEndpoint');
      expect(httpGetSpy).not.toHaveBeenCalled();
    });

    it('Should not log timer when monitor is not set', () => {
      sessionStorageMock.setItem('demoEndpoint', JSON.stringify({ foo: 'bar' }));
      fakeHTTPCall({ foo: 'bar' });
      const logSpy = spyOn(console, 'log').and.callFake(() => {});

      service.makeRequest('get', 'demoEndpoint');

      expect(logSpy).not.toHaveBeenCalled();
    });

    it('Should log timer when monitor set', () => {
      sessionStorageMock.setItem('demoEndpoint', JSON.stringify({ foo: 'bar' }));
      sessionStorageMock.setItem('monitor', 'true');
      fakeHTTPCall({ foo: 'bar' });
      const logSpy = spyOn(console, 'log').and.callFake(() => {});

      service.makeRequest('get', 'demoEndpoint');

      expect(logSpy).toHaveBeenCalled();
    });

    it('Should call api when fresh is present', () => {
      sessionStorageMock.setItem('demoEndpoint', JSON.stringify({ foo: 'bar' }));
      fakeHTTPCall({ foo: 'bar' });
      service.makeRequest('get', 'demoEndpoint', { fresh: true });
      expect(httpGetSpy).toHaveBeenCalled();
    });
  });

  describe('Item is not found in cache', () => {
    it('Should throw an error when no body is present with post', waitForAsync(() => {
      fakeHTTPCall({ foo: 'bar' });
      const obs$ = service.makeRequest('put', 'demoEndpoint', { body: { foo: 'bar' } });

      obs$.subscribe({ error: (e: Error) => expect(e.message).toEqual('Put/Post requests must contain a body') });
    }));

    it('Should throw an error when no body is present with post', waitForAsync(() => {
      fakeHTTPCall({ foo: 'bar' });
      const obs$ = service.makeRequest('post', 'demoEndpoint', { body: { foo: 'bar' } });

      obs$.subscribe({ error: (e: Error) => expect(e.message).toEqual('Put/Post requests must contain a body') });
    }));

    it('Should call the HTTP Client testing module if an item is found in the cache', () => {
      fakeHTTPCall({ foo: 'bar' });
      service.makeRequest('get', 'demoEndpoint');
      expect(httpGetSpy).toHaveBeenCalled();
    });

    it('Should update cache when retrieving data', waitForAsync(() => {
      fakeHTTPCall({ bar: 'baz' });
      const obs$ = service.makeRequest('put', 'demoEndpoint', { body: { foo: 'bar' } });

      obs$.subscribe((x) => {
        expect(window.sessionStorage.getItem('demoEndpoint')).toEqual(JSON.stringify({ bar: 'baz' }));
      });
    }));

    it('Should call the HTTPClient Put if an item is not in the cache', waitForAsync(() => {
      fakeHTTPCall({ put: 'put' });

      const obs$ = service.makeRequest('put', 'demoPut', { body: {} });

      obs$.subscribe((x) => {
        expect(httpPutSpy).toHaveBeenCalled();
        expect(window.sessionStorage.getItem('demoPut')).toEqual(JSON.stringify({ put: 'put' }));
      });
    }));

    it('Should call the HTTPClient Post if an item is not in the cache', waitForAsync(() => {
      fakeHTTPCall({ post: 'post' });

      const obs$ = service.makeRequest('post', 'demoPost', { body: {} });

      obs$.subscribe((x) => {
        expect(httpPostSpy).toHaveBeenCalled();
        expect(window.sessionStorage.getItem('demoPost')).toEqual(JSON.stringify({ post: 'post' }));
      });
    }));

    it('Should call the HTTPClient Post if an item is not in the cache', waitForAsync(() => {
      fakeHTTPCall({ post: 'post' });

      const obs$ = service.makeRequest('post', 'demoPost', { body: {} });

      obs$.subscribe((x) => {
        expect(httpPostSpy).toHaveBeenCalled();
        expect(window.sessionStorage.getItem('demoPost')).toEqual(JSON.stringify({ post: 'post' }));
      });
    }));

    it('Should call the HTTPClient Delete if an item is not in the cache', waitForAsync(() => {
      fakeHTTPCall({});

      const obs$ = service.makeRequest('delete', 'demoDelete');

      obs$.subscribe((x) => {
        expect(httpDeleteSpy).toHaveBeenCalled();
      });
    }));
  });
});
