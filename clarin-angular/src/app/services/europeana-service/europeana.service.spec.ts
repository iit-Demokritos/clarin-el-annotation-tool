import { TestBed } from '@angular/core/testing';

import { EuropeanaService } from './europeana.service';

describe('EuropeanaService', () => {
  let service: EuropeanaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EuropeanaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
