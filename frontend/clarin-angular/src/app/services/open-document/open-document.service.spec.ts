import { TestBed } from '@angular/core/testing';

import { OpenDocumentService } from './open-document.service';

describe('OpenDocumentService', () => {
  let service: OpenDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
