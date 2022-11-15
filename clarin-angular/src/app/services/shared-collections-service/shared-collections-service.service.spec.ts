import { TestBed } from '@angular/core/testing';

import { SharedCollectionsService } from './collection-service.service';

describe('SharedCollectionsService', () => {
  let service: SharedCollectionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedCollectionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
