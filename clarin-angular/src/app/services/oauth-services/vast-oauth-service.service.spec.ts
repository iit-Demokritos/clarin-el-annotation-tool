import { TestBed } from '@angular/core/testing';

import { VAST_OauthService } from './vst-oauth-service.service';

describe('VAST_OauthService', () => {
  let service: VAST_OauthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VAST_OauthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
