import { TestBed } from '@angular/core/testing';

import { AutoannService } from './autoann.service';

describe('AutoannService', () => {
  let service: AutoannService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutoannService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
