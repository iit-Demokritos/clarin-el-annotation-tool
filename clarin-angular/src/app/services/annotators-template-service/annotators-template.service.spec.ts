import { TestBed } from '@angular/core/testing';

import { AnnotatorsTemplateService } from './annotators-template.service';

describe('AnnotatorsTemplateService', () => {
  let service: AnnotatorsTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnotatorsTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
