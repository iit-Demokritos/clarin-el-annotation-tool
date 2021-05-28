import { TestBed } from '@angular/core/testing';

import { RestoreAnnotationService } from './restore-annotation.service';

describe('RestoreAnnotationService', () => {
  let service: RestoreAnnotationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestoreAnnotationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
