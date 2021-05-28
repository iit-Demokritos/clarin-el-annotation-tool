import { TestBed } from '@angular/core/testing';

import { SharedCollectionService } from './shared-collection.service';

describe('SharedCollectionService', () => {
  let service: SharedCollectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedCollectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
