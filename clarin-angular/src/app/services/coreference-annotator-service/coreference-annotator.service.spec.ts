import { TestBed } from '@angular/core/testing';

import { CoreferenceAnnotatorService } from './coreference-annotator.service';

describe('CoreferenceAnnotatorService', () => {
  let service: CoreferenceAnnotatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoreferenceAnnotatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
