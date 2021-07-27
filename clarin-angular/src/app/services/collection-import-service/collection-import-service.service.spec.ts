import { TestBed } from '@angular/core/testing';

import { CollectionImportService } from './collection-import-service.service';

describe('CollectionImportService', () => {
  let service: CollectionImportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CollectionImportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
