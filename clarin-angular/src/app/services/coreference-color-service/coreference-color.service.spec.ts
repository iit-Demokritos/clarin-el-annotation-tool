import { TestBed } from '@angular/core/testing';

import { CoreferenceColorService } from './coreference-color.service';

describe('CoreferenceColorService', () => {
  let service: CoreferenceColorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoreferenceColorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
