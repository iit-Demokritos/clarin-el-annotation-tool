import { TestBed } from '@angular/core/testing';

import { ObjectIdService } from './object-id.service';

describe('ObjectIdService', () => {
  let service: ObjectIdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjectIdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
