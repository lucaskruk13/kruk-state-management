import { HttpHeaders } from '@angular/common/http';

export type http_verb = ['get', 'put', 'post', 'delete'][number];

export type k_state_service_options = Partial<{
  readonly fresh: boolean;
  readonly body: object;
  readonly headers: HttpHeaders;
}>;
