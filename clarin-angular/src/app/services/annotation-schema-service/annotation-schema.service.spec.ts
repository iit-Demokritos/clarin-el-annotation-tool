import { TestBed } from '@angular/core/testing';

import { AnnotationSchemaService } from './annotation-schema.service';

describe('AnnotationSchemaService', () => {
  let service: AnnotationSchemaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnotationSchemaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
