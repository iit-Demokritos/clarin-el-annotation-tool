import { TestBed } from '@angular/core/testing';

import { CoreferenceColorDataService } from './coreference-color-data.service';

describe('CoreferenceColorDataService', () => {
  let service: CoreferenceColorDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoreferenceColorDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
