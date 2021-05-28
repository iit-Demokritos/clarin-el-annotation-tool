import { TestBed } from '@angular/core/testing';

import { TempAnnotationService } from './temp-annotation.service';

describe('TempAnnotationService', () => {
  let service: TempAnnotationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TempAnnotationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
