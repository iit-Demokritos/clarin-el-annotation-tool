import { TestBed } from '@angular/core/testing';

import { ButtonAnnotatorService } from './button-annotator.service';

describe('ButtonAnnotatorService', () => {
  let service: ButtonAnnotatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ButtonAnnotatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
